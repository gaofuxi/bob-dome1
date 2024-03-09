import axios from 'axios';
import { writeFileSync } from 'fs';
import { normalize, join } from 'path';
import cache from '../../commons/cache';
import storageKeys from '../../constant/storageKeys';
import yaml from 'yaml';
import {
  compatible,
  isWin,
  MAC_ARM64,
  MAC_X64,
  WIN_IA32,
  WIN_X64,
  WIN_ARM64,
  LINUX_ARM64,
  LINUX_X64
} from '../../constant/platform';
import {
  downloadClashProfile,
  getSubscribe,
  getUserInfo,
  login
} from '../../commons/api';

const state = {
  staticPath: '',
  isServiceConnecting: false,
  userAuthInfo: null,
  userDataPath: '',
  coreControllerPort: 0,
  logFilePath: '',
  isDevMode: false,
  userSettingsObject: {},
  clashConfigs: {},
  clashProfileUrl: '',
  clashProfileContent: 'shadowfly: true',
  mixinObject: {},
  isConnecting: false,
  upgradeDownloadProgress: 0,
  logs: [],
  appUpdateInfo: {},
  isTicketResponsed: false,
  configs: {}
};

const getters = {
  clashPath: (state) => {
    if (state.userDataPath) {
      return normalize(join(state.userDataPath, 'clash'));
    }
    return '';
  },
  getConfigs: (state) => {
    if (state.configs) {
      return state.configs;
    }
    return {};
  },
  filesPath: (state, getters) => {
    if (state.staticPath !== '') {
      return join(state.staticPath, 'files');
    }
    return 'static/files';
  },
  binaryFilesPath: (state, getters) => {
    return {
      [WIN_IA32]: join(getters.filesPath, 'win', 'ia32'),
      [WIN_X64]: join(getters.filesPath, 'win', 'x64'),
      [WIN_ARM64]: join(getters.filesPath, 'win', 'arm64'),
      [MAC_X64]: join(
        getters.filesPath,
        'darwin',
        state.isDevMode ? 'x64' : 'universal'
      ),
      [MAC_ARM64]: join(
        getters.filesPath,
        'darwin',
        state.isDevMode ? 'arm64' : 'universal'
      ),
      [LINUX_X64]: join(getters.filesPath, 'linux', 'x64'),
      [LINUX_ARM64]: join(getters.filesPath, 'linux', 'arm64')
    }[compatible()];
  },
  clashHttpClient() {
    if (state.coreControllerPort > 0) {
      const c = axios.create({
        baseURL: `http://127.0.0.1:${state.coreControllerPort}`
      });
      c.interceptors.response.use(
        (r) => r,
        (error) => Promise.resolve(error)
      );
      return c;
    }
    return null;
  },
  clashWSClient:
    (state, getters) =>
      (path, params = []) => {
        const port = state.coreControllerPort;
        if (port > 0) {
          if (!/^\//.test(path)) {
            path = '/' + path;
          }
          let addr = `ws://127.0.0.1:${port}${path}?${
            params.length > 0 ? `${params.join('&')}` : ''
          }`;
          return new WebSocket(addr);
        }
        return null;
      },
  isClashCoreConnected(state) {
    return state.clashConfigs?.mode !== undefined;
  },
  coreControllerPort(state) {
    return state.coreControllerPort;
  },
  settingInterfaceName(state) {
    return state.userSettingsObject.interfaceName;
  },
  clashProfileObject(state, getters) {
    try {
      const p = yaml.parse(state.clashProfileContent);
      const groups = p?.['proxy-groups'];
      if (!groups) {
        return {};
      }
      const mainGroup = groups.find((g) => g.name === 'Proxy');
      const autoGroup = {
        ...mainGroup,
        name: 'auto_hide',
        type: 'url-test',
        url: 'http://www.gstatic.com/generate_204',
        interval: 3600
      };
      //console.log('profile changed:', JSON.stringify(p, null, 2));
      return {
        ...p,
        'proxy-groups': [...groups, autoGroup],
        ...state.mixinObject,
        'interface-name': getters.settingInterfaceName
      };
    } catch (e) {
      console.error('parse profile failed with error:', e);
    }
    return {};
  }
};

const mutations = {
  resetAll(state) {
    state.userAuthInfo = null;
    state.userDataPath = '';
    state.clashProfileUrl = '';
    state.clashProfileContent = 'shadowfly: true';
    state.isTicketResponsed = false;
  },
  setIsDevMode(state, isDevMode) {
    state.isDevMode = isDevMode;
  },
  setStaticPath(state, path) {
    state.staticPath = path;
  },
  setIsServiceConnecting(state, status) {
    state.isServiceConnecting = status;
  },
  setUserAuthInfo: (state, info) => {
    state.userAuthInfo = info;
  },
  setUserDataPath(state, path) {
    state.userDataPath = path;
  },
  setCoreControllerPort(state, port) {
    state.coreControllerPort = port;
    const wintunTempWorkaround = isWin()
      ? {
        tun: {
          enable: true,
          stack: 'gvisor',
          'auto-route': false,
          'auto-detect-interface': true
        }
      }
      : {};
    writeFileSync(
      join(state.userDataPath, 'clash', 'config.yaml'),
      yaml.stringify({
        'external-controller': `127.0.0.1:${port}`,
        ...wintunTempWorkaround
      })
    );
  },
  setLogFilePath(state, path) {
    state.logFilePath = path;
  },
  setUserSettingsObject(state, object) {
    state.userSettingsObject = object;
    cache.put(storageKeys.USER_CONFIG, object);
  },
  setClashConfigs(state, configs) {
    state.clashConfigs = configs;
  },
  setConfigs(state, configs) {
    state.Configs = configs;
  },
  setClashProfileUrl(state, url) {
    state.clashProfileUrl = url;
  },
  setClashProfileContent(state, content) {
    state.clashProfileContent = content;
  },
  setMixinObject(state, object) {
    state.mixinObject = object;
  },
  setIsConnecting(state, status) {
    state.isConnecting = status;
  },
  setUpgradeDownloadProgress(state, progress) {
    state.upgradeDownloadProgress = progress;
  },
  appendLog(state, log) {
    state.logs = [...state.logs, log];
  },
  setAPPUpdateInfo(state, info) {
    state.appUpdateInfo = info;
  },
  setIsTicketResponsed(state, status) {
    state.isTicketResponsed = status;
  }
};
const actions = {
  doLogin: async ({ commit, dispatch }, { email, password }) => {
    if (!email || !password) {
      throw new Error('登录邮箱或密码为空');
    }
	const data = await login({
	  email,
	  password
	});
    
    if (data) {
      cache.put(storageKeys.USER_LOGIN_INFO, { email, password });
      if (await dispatch('refreshClashProfile')) {
        const token = data?.token || '';
        commit('setUserAuthInfo', {
          token,
          authData: data?.auth_data
        });
        cache.put(storageKeys.IS_USER_LOGINED, true);
        return {
          hasPlan: state.clashProfileContent !== '',
          token: data?.token || '',
          authData: data?.auth_data
        };
      } else {
        throw new Error('获取订阅地址失败，请重试');
      }
    } else {
      throw new Error('登录请求响应异常，请重试');
    }
  },
  codeLogin: async ({ commit, dispatch }, {data}) => {
	  //cache.put(storageKeys.USER_LOGIN_INFO, { email, password });
	  if (await dispatch('refreshClashProfile')) {
	    const token = data?.token || '';
	    commit('setUserAuthInfo', {
	      token,
	      authData: data?.auth_data
	    });
	    cache.put(storageKeys.IS_USER_LOGINED, true);
	    return {
	      hasPlan: state.clashProfileContent !== '',
	      token: data?.token || '',
	      authData: data?.auth_data
	    };
	  } else {
	    throw new Error('获取订阅地址失败，请重试');
	  }
  },
  refreshClashProfile: async ({ commit, state }) => {
    const { info } = await getUserInfo();
    const config = await getSubscribe();
    localStorage.setItem('config', JSON.stringify(config));
    const subUrl = new URL(info.subUrl);
    // subUrl.host = chosenDomain;
    const url = subUrl.toString();
    
    commit('setClashProfileUrl', url);
    if (url) {
      const profile = (await downloadClashProfile(state.clashProfileUrl)) || '';
      commit('setClashProfileContent', profile);
      return true;
    }
    // return true
    return false;
  }
};

export default {
  state,
  getters,
  mutations,
  actions
};
