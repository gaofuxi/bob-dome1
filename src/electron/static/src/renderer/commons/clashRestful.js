import storageKeys from '../constant/storageKeys';
import store from '../store';

export const getProxies = async () => {
  if (store.getters.clashHttpClient) {
    const { status, data } = await store.getters.clashHttpClient({
      method: 'GET',
      url: '/proxies',
    });
    if (status === 200) {
      return data;
    }
  }
  return {};
};

//GET 获取单个代理的延迟
export const requestDelay = async (proxy) => {
  if (store.getters.clashHttpClient) {
    const { status, data } = await store.getters.clashHttpClient({
      method: 'GET',
      url: `/proxies/${proxy}/delay?timeout=10000&url=https%3A%2F%2Fwww.google.com`,
    });
    if (status === 200) {
      store.commit('setClashConfigs', data);
      return data;
    }
  }
  return {};
};

export const getConfigs = async () => {
  if (store.getters.clashHttpClient) {
    const { status, data } = await store.getters.clashHttpClient({
      method: 'GET',
      url: '/configs',
    });
    if (status === 200) {
      store.commit('setClashConfigs', data);
      return data;
    }
  }
  return {};
};

export const requestTraffic = async (onReceive) => {
  requestChunk('/traffic', 'GET', onReceive)
};

export const patchConfigs = async (configs) => {
  if (store.getters.clashHttpClient) {
    const { status } = await store.getters.clashHttpClient({
      method: 'PATCH',
      url: '/configs',
      data: configs,
    });
    if (status === 204) {
      return true;
    }
  }
  return false;
};

export const putConfigs = async (payload) => {
  const e = '载入配置文件失败，请重启APP';
  if (store.getters.clashHttpClient) {
    const { status, data } = await store.getters.clashHttpClient({
      method: 'PUT',
      url: '/configs',
      data: {
        payload,
      },
    });
    return status === 204 ? '' : data?.message || e;
  }
  return e;
};

export const changeProxy = async (group, proxy) => {
  if (store.getters.clashHttpClient) {
    const { status } = await store.getters.clashHttpClient({
      method: 'PUT',
      url: `/proxies/${encodeURIComponent(group)}`,
      data: {
        name: proxy,
      },
    });
    return status === 204;
  }

  return false;
};

export const testProxy = async (name) => {
  if (store.getters.clashHttpClient) {
    const {
      status,
      data: { delay = 0 },
    } = await store.getters.clashHttpClient({
      method: 'GET',
      url: `/proxies/${encodeURIComponent(
        name
      )}/delay?timeout=5000&url=${encodeURIComponent(
        'http://www.gstatic.com/generate_204'
      )}`,
    });
    if (status === 200) {
      return delay;
    }
  }

  return 0;
};

export const testGroup = async (groupName) => {
  if (store.getters.clashHttpClient) {
    const {
      status,
      data: { delay = 0 },
    } = await store.getters.clashHttpClient({
      method: 'GET',
      url: `/providers/proxies/${groupName}/healthcheck`,
    });
    if (status === 204) {
      return true;
    }
  }

  return false;
};

export const closeAllConnections = async () => {
  if (store.getters.clashHttpClient) {
    const { status } = await store.getters.clashHttpClient({
      method: 'DELETE',
      url: '/connections',
    });
    return status === 204;
  }
  return false;
};

export const getAllRuleProviders = async () => {
  if (store.getters.clashHttpClient) {
    const { status, data } = await store.getters.clashHttpClient({
      method: 'GET',
      url: '/providers/rules',
    });
    if (status === 200) {
      return data?.providers || {};
    }
  }
  return {};
};

export const updateRuleProvider = async (name) => {
  if (store.getters.clashHttpClient) {
    const { status } = await store.getters.clashHttpClient({
      method: 'PUT',
      url: `/providers/rules/${encodeURIComponent(name)}`,
    });
    return status === 204;
  }
  return false;
};

export const updateAllRuleProviders = async () => {
  if (store.getters.clashHttpClient) {
    const providers = await getAllRuleProviders();
    const missions = Object.entries(providers)
      .filter(([_, { vehicleType }]) => vehicleType === 'HTTP')
      .map(([name]) => updateRuleProvider(name));
    await Promise.allSettled(missions);
  }
  return false;
};

const getHeader = () => {
  return {
    'Content-Type': 'application/json; charset=utf-8'
  }
}
export async function requestChunk(url, method, onReceive, header, body, cors = true) {
  const mergedHeaders = Object.assign(getHeader(), header)
  const BASE_URL = `http://127.0.0.1:${store.getters.coreControllerPort}`;
  const params = {
    method: method,
    headers: new Headers(mergedHeaders),
    mode: cors ? 'cors' : 'same-origin'
  }
  if (body !== undefined) {
    params.body = JSON.stringify(body)
  }
  const resp = await fetch(BASE_URL + url, { ...params })
  if (resp.body == null) {
    return Promise.reject()
  }
  const reader = resp.body.getReader()
  let done = false
  while (!done) {
    const result = await reader.read()
    done = result.done
    const value = result.value || []
    let str = ''
    for (let i = 0; i < value.length; i++) {
      str += String.fromCharCode(value[i])
    }
    onReceive(str)
  }
}