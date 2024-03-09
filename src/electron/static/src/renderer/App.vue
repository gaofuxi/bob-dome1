<template>
  <div id='app' class='w-full h-full'>
    <!-- <TitleBar /> -->
    <keep-alive>
      <router-view
        v-if='$route.meta.keepAlive'
        class='w-[100vw] h-[100vh]'
      ></router-view>
    </keep-alive>
    <router-view
      v-if='!$route.meta.keepAlive'
      class='w-[100vw] h-[100vh]'
    ></router-view>
  </div>
</template>

<script>
import { ipcRenderer, shell } from 'electron';
import {
  compatible,
  isLinux,
  isMac,
  isWin,
  WIN_ARM64,
  WIN_IA32,
  WIN_X64
} from './constant/platform';
import TitleBar from './components/TitleBar.vue';
import {
  getConfig,
  getUserInfo,
  getUserPlan,
  login,
  setAuthFunction,
  getUpdate
} from './commons/api';
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';
import path from 'path';
import storageKeys from './constant/storageKeys';
import cache from './commons/cache';
import { killClash, killProcess, spawnClash } from './commons/binary';
import getPort from 'get-port';
import yaml from 'yaml';
import mousetrap from 'mousetrap';

const {
  statusService,
  status: serviceStatus,
  installService,
  uninstallService
} = require(`./commons/service_${process.platform}`);
import fs from 'fs';
import {
  closeAllConnections,
  getConfigs,
  patchConfigs,
  putConfigs, requestTraffic
} from './commons/clashRestful';
import { setNowInterval, showDialog, traffic } from './commons/helper';
import { spawnSync } from 'child_process';
import moment from 'moment';
import _ from 'lodash';

export default {
  name: 'App',
  props: {},
  components: { TitleBar },
  data() {
    return {
      routerTransition: '',
      trafficWSClient: null,
      traffic: [
        {
          leading: '↑',
          value: '0',
          unit: 'B/s'
        },
        {
          leading: '↓',
          value: '0',
          unit: 'B/s'
        }
      ]
    };
  },
  watch: {
    $route(to, from) {
      if (to.name === 'order-page') {
        this.routerTransition = 'slide';
      } else {
        this.routerTransition = '';
      }
    },
    isClashCoreConnected: {
      immediate: true,
      handler(online) {
        patchConfigs({
          'mixed-port': this.settings.mixedPort,
          mode: this.settings.mode,
          'allow-lan': this.settings.isAllowLAN
        });
      }
    },
    'settings.isLaunchAtLogin': {
      handler(on) {
        this.$setAutoLaunch(on);
      },
      immediate: true
    },
    'settings.isAllowLAN': {
      handler(on) {
        patchConfigs({ 'allow-lan': on });
      },
      immediate: true
    },
    'settings.mixedPort': {
      handler(port) {
        patchConfigs({ 'mixed-port': port });
      },
      immediate: true
    },
    'settings.mode': {
      async handler(mode) {
        await patchConfigs({ mode });
        await closeAllConnections();
      },
      immediate: true
    },
    'settings.language': {
      async handler(lang) {
        const setLang = (l) => {
          if (l === 'zh-CN' || l === 'cn') {
            this.$i18n.locale = 'cn';
          } else {
            this.$i18n.locale = 'en';
          }
        };
        if (['auto'].includes(lang)) {
          const l = await ipcRenderer.invoke('app', 'getLocale');
          setLang(l);
        } else {
          setLang(lang);
        }
      },
      immediate: true
    },
    async clashProfileObject(o, t) {
      console.log(JSON.stringify(o) === JSON.stringify(t));
      await putConfigs(yaml.stringify(o));
      await patchConfigs({ mode: this.settings.mode });
    },
    appUpdateInfo(info) {
      this.checkForUpdate(info);
    },
    async clashProfileUrl(url) {
      url = '';
      if (url) {
        const [uip, upp] = await Promise.allSettled([
          getUserInfo(),
          getUserPlan()
        ]);
        console.log("uip", uip)
        if (uip.status === 'fulfilled' && upp.status === 'fulfilled') {
          const { email, balance } = uip.value;
          const { plan, transfer_enable, u, d, expired_at } = upp.value;
          // console.log({ email, balance, plan });
          this.$crisp.push(['set', 'user:nickname', email.replace(/@.*/, '')]);
          this.$crisp.push(['set', 'user:email', email]);
          this.$crisp.push([
            'set',
            'session:data',
            [
              [
                ['Plan', plan.name],
                ['UsedTraffic', traffic(u + d)],
                [
                  'ExpireTime',
                  expired_at
                    ? moment(expired_at * 1000).format('YYYY-MM-DD')
                    : '永久'
                ],
                ['AllTraffic', traffic(transfer_enable)],
                ['Balance', '¥ ' + (balance / 100).toFixed(2)],
                ['Platform', isMac() ? 'macOS' : isWin() ? 'Windows' : 'Linux']
              ]
            ]
          ]);
        }
      } else {
        try {
          this.$crisp.push(['set', 'user:email', '']);
          this.$crisp.push(['set', 'session:data', [[]]]);
        } catch (e) {
        }
      }
    }
  },
  computed: {
    ...mapState({
      isDevMode: (state) => state.isDevMode,
      isConnecting: (state) => state.app.isConnecting,
      appUpdateInfo: (state) => state.app.appUpdateInfo,
      upgradeDownloadProgress: (state) => state.app.upgradeDownloadProgress,
      clashProfileUrl: (state) => state.app.clashProfileUrl
    }),
    ...mapGetters([
      'clashPath',
      'filesPath',
      'isClashCoreConnected',
      'clashProfileObject',
      'clashWSClient'
    ])
  },
  methods: {
    ...mapMutations([
      'setStaticPath',
      'setIsServiceConnecting',
      'setUserDataPath',
      'setCoreControllerPort',
      'setUserSettingsObject',
      'setIsDevMode',
      'appendLog'
    ]),
    ...mapActions(['doLogin']),
    async checkForUpdate(updateInfo) {
      if (isLinux()) {
        return;
      }
      if (this.upgradeDownloadProgress) {
        return;
      }
      const vw = (str) => {
        let p = 1;
        return str
          .split('.')
          .reverse()
          .reduce((s, c) => {
            let res = s * 1 + c * p;
            p *= 1000;
            return res;
          }, 0);
      };
      const {
        macos_download_url,
        macos_version,
        windows_download_url,
        windows_version,
        windows_version_flag,
        macos_version_flag
      } = updateInfo;
      try {


      } catch (e) {
        this.$dialog({
          type: 'fail',
          title: this.$t('Upgrade failed'),
          message: this.$t('Upgrade error', { error: e.message })
        });
      }
    },
    async toUpdate() {
      try {
        const version = await ipcRenderer.invoke('app', 'getVersion');
        let type = window.navigator.platform === 'Win32' ? 'windows' : 'mac';
        let list = await getUpdate(version, type);
        if (list.download_url && list.enable == true) {
          const { response } = await showDialog({
            message: this.$t(`New version found`, {
              v: list.download_url
            }),
            buttons: [this.$t('Download later'), this.$t('Download now')]
          });
          if (response === 1) {
            shell.openExternal(
              list.download_url
            );
          }
        } else {

        }
      } catch (e) {
        this.$dialog({
          type: 'fail',
          title: this.$t('Upgrade failed'),
          message: this.$t('Upgrade error', { error: e.message })
        });
      }
    },
    initClashFolder() {
      console.log(`init clash folder: ${this.clashPath}`);
      if (!fs.existsSync(this.clashPath)) {
        fs.mkdirSync(this.clashPath);
      }
      const configYamlPath = path.join(this.clashPath, 'config.yaml');
      if (!fs.existsSync(configYamlPath)) {
        fs.writeFileSync(configYamlPath, '{}', 'utf8');
      }
      const mmdbPath = path.join(this.clashPath, 'Country.mmdb');
      if (!fs.existsSync(mmdbPath)) {
        const fromPath = path.join(this.filesPath, 'default', 'Country.mmdb');
        fs.copyFileSync(fromPath, mmdbPath);
      }
      if (isWin()) {
        // init wintun.dll
        const dirName = {
          [WIN_IA32]: 'ia32',
          [WIN_X64]: 'x64',
          [WIN_ARM64]: 'arm64'
        }[compatible()];
        const wintunDLLPath = path.join(
          this.filesPath,
          `win/${dirName}/wintun.dll`
        );
        const wintunPath = path.join(this.clashPath, 'wintun.dll');
        if (fs.existsSync(wintunPath)) {
          fs.unlinkSync(wintunPath);
        }
        fs.copyFileSync(wintunDLLPath, wintunPath);
      }
    }
  },
  mounted() {
    try {
      this.$crisp.$on('loaded', (e) => {
        const id = setInterval(() => {
          if (this.$crisp) {
            this.$crisp.push(['do', 'chat:hide']);
            clearInterval(id);
          }
        }, 500);
      });
    } catch (err) {
      console.log(err);
    }
    this.toUpdate();
  },
  async beforeMount() {
    setAuthFunction(
      _.debounce(
        () => {
          console.log('auth expired, do a login');
          const { email, password } =
          cache.get(storageKeys.USER_LOGIN_INFO) || {};
          if (email && password) {
            login({ email, password }).catch((e) => {
              this.goto('/index');
            });
          } else {
          }
        },
        5000,
        { leading: true, trailing: false }
      )
    );

    // add key to show devtools
    mousetrap.bind(['command+f12', 'ctrl+f12'], () => {
      ipcRenderer.invoke('webContent', 'toggleDevTools');
      return false;
    });

    ipcRenderer.on('console-message', (e, level, message) => {
      this.appendLog({
        level,
        message
      });
    });

    ipcRenderer.on('app-exit', this.cleanUpAndQuit);
    ipcRenderer.on('window-event', (_, type) => {
      if (type === 'show') {
        const { email, password } =
        cache.get(storageKeys.USER_LOGIN_INFO) || {};
        if (email && password && this.clashProfileUrl) {
          login({ email, password }).catch((e) => {
            this.$router.push('/login');
          });
        }
      }
    });

    const isDev = !(await ipcRenderer.invoke('app', 'isPackaged'));
    this.setIsDevMode(isDev);
    const userDataPath = await ipcRenderer.invoke('app', 'getPath', 'userData');
    this.setUserDataPath(userDataPath);
    const exePath = await ipcRenderer.invoke('app', 'getPath', 'exe');
    this.setStaticPath(
      isDev
        ? 'static'
        : path.join(
          path.dirname(exePath),
          isMac() ? '../Resources' : './resources',
          'static'
        )
    );

    this.$setSystemProxy(false, 0);

    const pid = cache.get(storageKeys.DEBUG_LAST_CLASH_PID);
    if (pid) {
      killProcess({ pid });
    }

    const ss = await statusService();
    this.setIsServiceConnecting(ss === serviceStatus.Active);

    await killClash();

    try {
      this.initClashFolder();
    } catch (e) {
      console.error('init clash folder failed with error:' + e);
    }

    // init user settings object
    const userSettingsObject = cache.get(storageKeys.USER_CONFIG);
    const defaultSettingsObject = {
      mixedPort: 26001,
      isAllowLAN: true,
      mode: 'rule',
      isLaunchAtLogin: false,
      isTUN: false,
      language: 'auto'
    };
    this.setUserSettingsObject({
      ...defaultSettingsObject,
      ...userSettingsObject
    });

    const controllerPort = await getPort();
    this.setCoreControllerPort(controllerPort);

    if (ss !== serviceStatus.Active && (isMac() || this.settings.isTUN)) {
      await installService();
      const isActive = (await statusService()) === serviceStatus.Active;
      this.setIsServiceConnecting(isActive);
      // if (!isActive) {
      //   if (
      //     await this.$dialog({
      //       title: '未能安装服务',
      //       message: isWin()
      //         ? '如多次出现次对话框，请在设置界面关闭 TUN 模式'
      //         : 'APP将无法设置系统代理及使用 TUN 模式',
      //       confirmText: '重新启动',
      //     })
      //   ) {
      //     this.reloadElectron();
      //   }
      // }
    }

    await spawnClash();
    setNowInterval(getConfigs, 2000);
  },
  beforeDestroy() {
  }
};
</script>

<style lang='scss'>
@font-face {
  font-family: 'TwemojiMozilla';
  src: url('assets/TwemojiMozilla.ttf') format('truetype');
}

.clickable {
  cursor: pointer;

  & * {
    cursor: pointer;
  }
}

*,
*::after,
{
  user-select: none;
  -webkit-user-drag: none;
  cursor: default;
  // overflow: hidden;

  font-family: 'Microsoft Yahei', 'PingFang SC', 'system-ui', 微软雅黑,
  'TwemojiMozilla';
}

.slide-enter-active {
  animation: slide-in 0.2s ease-in-out;
}

.slide-leave-active {
  // animation: slide-out 0.2s ease-in-out;
}

@keyframes slide-in {
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(0);
  }
}

@keyframes slide-out {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

::-webkit-scrollbar {
  width: 6px;
  border-radius: 10px;
  background-color: #F5F8FF;
}

::-webkit-scrollbar-thumb {
  background-color: #ADB2D7;
  border-radius: 10px;
}
</style>
