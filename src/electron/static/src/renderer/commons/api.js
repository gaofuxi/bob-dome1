  import axios from 'axios';
  import { apiTimeout } from '../constant/shadowfly.js';
  import util from '../plugins/utils';
  import pack from '../../../package.json';
  import store from '../store';

  export let chosenDomain = '';
  export let chosenDomainIndex = 0;
  let site = util.decrypt(pack.grant_code, 'fuckyou');
  let authToken = '';
  let baseURLs = [];
  const fetchURLs = async () => {
    if (baseURLs.length < 1) {
      try {
        const { data } = await axios.get(
          site + '/config.json'
        );
        if (data) {
          console.log('urls from config.json', data);
          baseURLs = [...Object.entries(data).map(([key, value]) => value)];
        }
      } catch (e) {
        baseURLs = [site];
      }
    }
  };

  export const clear = async () => {
    baseURLs = [];
    chosenDomain = '';
    chosenDomainIndex = 0;
    await fetchURLs();
  };

  const validateStatus = (status) => {
    if (status === 403) {
      needAuthFunction();
    }
    return true;
  };

  let client = {
    async get(url, options) {
      await fetchURLs();
      if (chosenDomain) {
        return await axios.get(url, {
          baseURL: `https://${chosenDomain}/api/v1`,
          timeout: apiTimeout,
          validateStatus,
          headers: {
            Authorization: authToken,
          },
          ...options,
        });
      }
      for (const idx in baseURLs) {
        try {
          const resp = await axios.get(url, {
            baseURL: `${baseURLs[idx]}/api/v1`,
            timeout: apiTimeout,
            validateStatus,
            headers: {
              Authorization: authToken,
            },
            ...options,
          });
          if (![200, 500].includes(resp.status)) {
            continue;
          }
          const baseURL = resp.config.baseURL;
          if (baseURL) {
            chosenDomain = new URL(baseURL).hostname;
            chosenDomainIndex = idx;
          }
          return resp;
        } catch (e) {
          console.log(e);
        }
      }
      throw new Error('no available server');
    },
    async post(url, data, options) {
      await fetchURLs();
      if (chosenDomain) {
        return await axios.post(url, data, {
          baseURL: `https://${chosenDomain}/api/v1`,
          validateStatus,
          headers: {
            Authorization: authToken,
          },
          timeout: apiTimeout,
          ...options,
        });
      }
      for (const idx in baseURLs) {
        try {
          const resp = await axios.post(url, data, {
            baseURL: `${baseURLs[idx]}/api/v1`,
            validateStatus,
            headers: {
              Authorization: authToken,
            },
            timeout: apiTimeout,
            ...options,
          });
          if (![200, 500].includes(resp.status)) {
            continue;
          }
          const baseURL = resp.config.baseURL;
          if (baseURL) {
            chosenDomain = new URL(baseURL).hostname;
            chosenDomainIndex = idx;
          }
          return resp;
        } catch (e) {
          console.log(e);
        }
      }
      throw new Error('no available server');
    },
  };

  let needAuthFunction = () => {};

  export const init = async () => {};

  export const setAuthFunction = (func) => {
    needAuthFunction = func;
  };

  export const login = async ({ email, password }) => {
    if (!client) {
      await init();
    }
    const { data, status } = await client.post('/login', {
      email,
      passwd:password,
    });
    if (status !== 200) {
      console.log(data,'datalogin')
      throw new Error(data.message || `网络错误，状态码： ${status}`);
    }
    if(!data.data){
      throw new Error(data.msg);
    }

    authToken = data.data.token;

    return data.data;
  };

  export const logout = async () => {
    if (!client) {
      await init();
    }
    authToken = '';
    const { status } = await client.get('/logout');
    if (status !== 200) {
      throw new Error(`网络错误，状态码： ${status}`);
    }
    return true;
  };

  export const getSubscribe = async () => {
    if (!client) {
      await init();
    }
    let configData = store.getters.getConfigs;
    if (configData.name){
      return configData;
    }
    const { status, data } = await client.get('/getconfig');
    if (status !== 200) {
      throw new Error(`网络错误，状态码： ${status}`);
    }
    store.commit('setConfigs', data.config);

    return data.config;
  };

  export const downloadClashProfile = async (url) => {
    if (!client) {
      await init();
    }
    // no-cache
    const { status, data } = await client.get(url + '&flag=clash');
    if (status !== 200) {
      throw new Error(`网络错误，状态码： ${status}`);
    }
    return data;
  };

  export const getUserInfo = async () => {
    if (!client) {
      await init();
    }
    const { data, status } = await client.get('/getuserinfo');
    if (status !== 200) {
      throw new Error(`网络错误，状态码： ${status}`);
    }
    return data;
  };

  export const getUserPlan = async () => {
    if (!client) {
      await init();
    }
    const { data, status } = await client.get('/getconfig');
    if (status !== 200) {
      throw new Error(`网络错误，状态码： ${status}`);
    }
    return data.data;
  };

  export const getPlans = async () => {
    if (!client) {
      await init();
    }
    const { data, status } = await client.get('/user/plan/fetch');
    if (status !== 200) {
      throw new Error(`网络错误，状态码： ${status}`);
    }
    return data.data;
  };

  export const getPlan = async (id) => {
    if (!client) {
      await init();
    }
    const { data, status } = await client.get(`/user/plan/fetch?id=${id}`);
    if (status !== 200) {
      throw new Error(`网络错误，状态码： ${status}`);
    }
    return data.data;
  };

  export const getConfig = async () => {
    if (!client) {
      await init();
    }
    const { data, status } = await client.get('/config');
    if (status !== 200) {
      throw new Error(`网络错误，状态码： ${status}`);
    }
    return data.data;
  };

  export const getInvites = async () => {
    if (!client) {
      await init();
    }
    const { data, status } = await client.get('/user/invite/fetch');
    if (status !== 200) {
      throw new Error(`网络错误，状态码： ${status}`);
    }
    return data.data;
  };

  export const getInviteDetail = async () => {
    if (!client) {
      await init();
    }
    const { data, status } = await client.get('/invite/gift');
    if (status !== 200) {
      throw new Error(`网络错误，状态码： ${status}`);
    }
    return data;
  };

  export const saveInvite = async () => {
    if (!client) {
      await init();
    }
    const { data, status } = await client.get('/user/invite/save');
    if (status !== 200) {
      throw new Error(`网络错误，状态码： ${status}`);
    }
    return data.data;
  };

  export const getNoitice = async () => {
    if (!client) {
      await init();
    }
    const { data, status } = await client.get('/user/notice/fetch');
    if (status !== 200) {
      throw new Error(`网络错误，状态码： ${status}`);
    }
    return data.data;
  };

  export const getStatus = async () => {
    if (!client) {
      await init();
    }
    const { data, status } = await client.get('/user/getStat');
    if (status !== 200) {
      throw new Error(`网络错误，状态码： ${status}`);
    }
    return data.data;
  };

  export const commitPlan = async ({ id, coupon = '', priceKey }) => {
    if (!client) {
      await init();
    }
    const { data, status } = await client.post('/user/order/save', {
      plan_id: id,
      coupon_code: coupon,
      period: priceKey,
    });
    if (status !== 200) {
      throw new Error(data.message || `网络错误，状态码： ${status}`);
    }
    return data.data;
  };

  export const checkPlan = async (tradeId) => {
    if (!client) {
      await init();
    }
    const { data, status } = await client.get(
      `/user/order/check?trade_no=${tradeId}`
    );
    if (status !== 200) {
      throw new Error(`网络错误，状态码： ${status}`);
    }
    return data.data;
  };

  export const getPaymentMethods = async () => {
    if (!client) {
      await init();
    }
    const { data, status } = await client.get('/user/order/getPaymentMethod');
    if (status !== 200) {
      throw new Error(`网络错误，状态码： ${status}`);
    }
    return data.data;
  };

  export const checkoutPaytmen = async (tradeId, methodId) => {
    if (!client) {
      await init();
    }
    const { data, status } = await client.post('/user/order/checkout', {
      trade_no: tradeId,
      method: methodId,
    });
    if (status !== 200) {
      throw new Error(`网络错误，状态码： ${status}`);
    }
    return data.data;
  };

  export const cancelPlan = async (tradeId) => {
    if (!client) {
      await init();
    }
    const { data, status } = await client.post('/user/order/cancel', {
      trade_no: tradeId,
    });
    if (status !== 200) {
      throw new Error(data.message || `网络错误，状态码： ${status}`);
    }
    return data.data;
  };

  export const checkCoupon = async (planId, coupon) => {
    if (!client) {
      await init();
    }
    const { data, status } = await client.post(`/user/coupon/check`, {
      plan_id: planId,
      code: coupon,
    });
    if (status !== 200) {
      throw new Error(data.message || `网络错误，状态码： ${status}`);
    }
    return data.data;
  };

  export const sendValidateCode = async (email) => {
    if (!client) {
      await init();
    }
    const { data, status } = await client.post('/send', {
      email,
    });
    if (status !== 200) {
      throw new Error(data.message || `网络错误，状态码： ${status}`);
    }
    return data.data;
  };

  export const register = async ({ name,email,code, password,repasswd, inviteCode }) => {
    if (!client) {
      await init();
    }
    const { data, status } = await client.post('/register', {
      name,
      email,
      emailcode: code,
      password,
      repasswd,
      code: inviteCode,
    });
    if (status !== 200) {
      throw new Error(data.message || `网络错误，状态码： ${status}`);
    }
    return data;
  };

  export const getAPPVersion = async (token) => {
    if (!client) {
      await init();
    }
    if (!token) {
      throw new Error('token 不能为空');
    }
    const { data, status } = await client.get(
      `/client/app/getVersion?token=${token}`
    );
    if (status !== 200) {
      throw new Error(`网络错误，状态码： ${status}`);
    }
    return data.data;
  };

  export const getGuestConfig = async () => {
    if (!client) {
      await init();
    }
    const { data, status } = await client.get('/guest/comm/config');
    if (status !== 200) {
      throw new Error(`网络错误，状态码： ${status}`);
    }
    return data.data;
  };

  export const getWebUrl = async (redirect, token) => {
    if (!client) {
      await init();
    }
    const { data, status } = await client.post(
      '/passport/auth/getQuickLoginUrl',
      {
        redirect,
        auth_data: token,
      }
    );
    if (status !== 200) {
      throw new Error(`网络错误，状态码： ${status}`);
    }
    return data.data;
  };

  // let serversCache = () => null;
  export const getServers = async () => {
    // let cache = serversCache();
    // if (cache) {
    //   return cache;
    // }
    if (!client) {
      await init();
    }
    const { data, status } = await client.get('/user/server/fetch');
    if (status !== 200) {
      throw new Error(`网络错误，状态码： ${status}`);
    }
    const res = data.data;
    // serversCache = cachey(res);
    return res;
  };

  export const getOrders = async () => {
    if (!client) {
      await init();
    }
    const { data, status } = await client.get('/order');
    if (status !== 200) {
      throw new Error(`网络错误，状态码： ${status}`);
    }
    return data.data;
  };

  export const resetPassword = async (email, code, password) => {
    if (!client) {
      await init();
    }
    const { data, status } = await client.post('/passport/auth/forget', {
      email,
      email_code: code,
      password,
    });
    if (status !== 200) {
      throw new Error(data.message || `网络错误，状态码： ${status}`);
    }
    return data.data;
  };

  export const getTickets = async () => {
    if (!client) {
      await init();
    }
    const { data, status } = await client.get('/user/ticket/fetch');
    if (status !== 200) {
      throw new Error(`网络错误，状态码： ${status}`);
    }
    return data.data;
  };

  export const getTicket = async (id) => {
    if (!client) {
      await init();
    }
    const { data, status } = await client.get(`/user/ticket/fetch?id=${id}`);
    if (status !== 200) {
      throw new Error(`网络错误，状态码： ${status}`);
    }
    return data.data;
  };

  export const replyTicket = async (id, message) => {
    if (!client) {
      await init();
    }
    const { data, status } = await client.post('/user/ticket/reply', {
      id: id + '',
      message,
    });
    if (status !== 200) {
      throw new Error(data.message || `网络错误，状态码： ${status}`);
    }
    return data.data;
  };

  export const closeTicket = async (id) => {
    if (!client) {
      await init();
    }
    const { data, status } = await client.post('/user/ticket/close', {
      id: id + '',
    });
    if (status !== 200) {
      throw new Error(data.message || `网络错误，状态码： ${status}`);
    }
    return data.data;
  };

  export const createTicket = async (title, message) => {
    if (!client) {
      await init();
    }
    const { data, status } = await client.post('/user/ticket/save', {
      subject: title,
      level: '0',
      message,
    });
    if (status !== 200) {
      throw new Error(data.message || `网络错误，状态码： ${status}`);
    }
    return data.data;
  };

  export const getProxy = async () => {
    if (!client) {
      await init();
    }
    const { data, status } = await client.get('/proxy');
    if (status !== 200) {
      throw new Error(`网络错误，状态码： ${status}`);
    }
    return data;
  };

  export const doCheckIn = async () => {
    if (!client) {
      await init();
    }
    const { data, status } = await client.post('/doCheckIn');
    if (status !== 200) {
      throw new Error(data.message || `网络错误，状态码： ${status}`);
    }
    return data;
  };


  export const getQuestion =  async () => {
    if (!client) {
      await init();
    }
    const { data, status } = await client.get('/question');
    if (status !== 200) {
      throw new Error(`网络错误，状态码： ${status}`);
    }
    return data;
  };

  export const getUpdate =  async (version,type) => {
    if (!client) {
      await init();
    }
    const { data, status } = await client.get(`/version/update?version=${version}&type=${type}`);
    if (status !== 200) {
      throw new Error(`网络错误，状态码： ${status}`);
    }
    return data;
  };

  export const getShop =  async () => {
    if (!client) {
      await init();
    }
    const { data, status } = await client.get(`/shop`);
    if (status !== 200) {
      throw new Error(`网络错误，状态码： ${status}`);
    }
    return data;
  };

  export const getCoupon =  async (shopcoupon,shopid) => {
    if (!client) {
      await init();
    }
    const { data, status } = await client.get(`/coupon?shopcoupon=${shopcoupon}&shopid=${shopid}`);
    if (status !== 200) {
      throw new Error(`网络错误，状态码： ${status}`);
    }
    return data;
  };



  export const getPurchase = async (price, shopid,shopcoupon,type) => {
    if (!client) {
      await init();
    }
    const { data, status } = await client.post('/bob/payment/purchase', {
      price: price,
      shopid: shopid,
      shopcoupon:shopcoupon,
    type:type,
    });
    if (status !== 200) {
      throw new Error(data.message || `网络错误，状态码： ${status}`);
    }
    return data;
  };


  export const getWallet = async (shopid,shopcoupon) => {
    if (!client) {
      await init();
    }
    const { data, status } = await client.post('/bob/payment/wallet', {
      shopid: shopid,
      shopcoupon:shopcoupon,
    });
    if (status !== 200) {
      throw new Error(data.message || `网络错误，状态码： ${status}`);
    }
    return data;
  };

  export const getQrcode =  async (token) => {
    if (!client) {
      await init();
    }
    let url
    if(token){
      url = `/qrcode_token?token=${token}`
    }else{
      url = `/qrcode_token`
    }
    const { data, status } = await client.get(url);
    if (status !== 200) {
      throw new Error(`网络错误，状态码： ${status}`);
    }
    return data;
  };
