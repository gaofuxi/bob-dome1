<template>
  <div>
    <div class='page'>
      <Loading v-if='isLoading' :content="$t('Loading')"></Loading>
      <ModalTemp v-if='isModal' :title='modalTitle' :content='modalContent' @toClose='isModal=false'></ModalTemp>
      <!-- <div class='header-bar'>
        
      </div> -->
      <div class='main-card'>
        <div class='link-btn'
             v-if='!isConnecting' @click='handleConnect'
        >
		 <img src="../../../static/index/Main/btn-off.png" class="off-img"/>
          <div class='link-text'>{{ $t('Connect') }}</div>
        </div>
        <div style='position: relative;'
             @click='handleDisconnect'
             v-if='isConnecting'>
          <div class='nolink-btn'></div>
          <div class='nolink-text'>{{ $t('Disconnect') }}</div>
          <div class='link-time'>
            <div class='flex'>
              <div v-if='hour < 10'>{{ '0' + hour }}:</div>
              <div v-else>{{ hour }}:</div>
              <div v-if='min < 10'>{{ '0' + min }}:</div>
              <div v-else>{{ min }}:</div>
              <div v-if='second < 10'>{{ '0' + second }}</div>
              <div v-else>{{ second }}</div>
            </div>
          </div>
        </div>
        <div class='flex m-t-34'>
          <div class='flex align-center'>
            <i class="ri-upload-2-fill" style="color: #6F75FF;"></i>
            <div class='up-num'>{{ up || '0KB' }}</div>
          </div>
          <div class='flex align-center m-l-52'>
			      <i class="ri-download-2-fill" style="color: #6F75FF;"></i>
            <div class='up-num'>{{ down || '0KB' }}</div>
          </div>
        </div>
        <div class='proxy-bar' @click='toProxy'>
			<div style="display: flex;align-items: center;">
				<img class='country-img' v-if='currentProxyFlag'
				     :src='`../../../static/flags/${currentProxyFlag}.png`' />
				<div class='proxy-name' v-if='userInfo'>
				  {{ userInfo.user.class > 0 ? currentProxyName || $t('Loading') : $t('Choose proxy') }}
				</div>
			</div>
         
			<img class="arrow-icon" src="../../../static/index/User/right-arrow.png"/>
        </div>
        <div class='mode-bar' >
          <img class='root-img' src='../../../static/index/Main/root.png' />
          <div @click='changeMode()' class='mode-name'>{{ isGlobalMode ? $t('Global Model') : $t('Rule Model') }}</div>
          <img @click='changeMode()' class='refresh-img'
               src='../../../static/index/Main/refresh.png' />
        </div>
		<div class='expire-notice' v-if='expireNotice'>{{ expireNotice }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  clear,
  getSubscribe,
  getUserInfo,
  getProxy
} from '../commons/api';
import { showDialog, traffic } from '../commons/helper';
import Notification from './Main/Notification.vue';
import Setting from './Main/Setting.vue';
import Proxy from './Main/Proxy.vue';
import Slider from '../components/Slider.vue';
import { changeProxy, getProxies, requestTraffic } from '../commons/clashRestful';
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';
import { isMac, isWin } from '../constant/platform';
import { setDNS } from '../commons/dns';
import cache from '../commons/cache';

import storageKeys from '../constant/storageKeys';
import Hint from '../components/Hint.vue';
import { ipcRenderer } from 'electron';
import PingingDot from '../components/PingingDot.vue';
import { refreshInterval } from '../constant/shadowfly';
import Loading from '../components/Loading.vue';
import ModalTemp from '../components/PayModal.vue';

export default {
  name: 'MainPage',
  components: { Notification, Setting, Slider, Proxy, Hint, PingingDot, Loading, ModalTemp },
  data() {
    return {
      pannelComponent: null,
      pannelProps: null,
      pannelHeight: 400,
      userPlan: null,
      notifications: [],
      currentNotificationIndex: 0,
      notificationIntervalId: 0,
      isAnimate: false,
      currentProxyName: '',
      isConnectLoading: false,
      intervalID: null,
      lastUpdateTime: null,
      userInfo: null,
      isBackgroundLogin: false,

      isLink: false,
      up: '',
      down: '',
      proxyList: [],
      currentProxyFlag: '',
      btnTimer: null,
      time: 0,
      count: '00:00:00',
      second: 0,
      min: 0,
      hour: 0,
      getSpeed: null,
      isLoading: false,
      expireNotice: '',
      modalContent: '',
      modalTitle: '',
      isModal: false
    };
  },
  watch: {
    currentProxyName(to, from) {
      if (to !== '' && from !== '' && !this.isConnecting) {
        this.handleConnect();
      }
    },
    async clashProfileContent(c) {
      if (this.isConnecting) {
        this.handleDisconnect();
        await showDialog({
          message: this.$t('Profile has changed')
        });
        ipcRenderer.invoke('window-control', 'show');
      }
    },
    isConnecting: {
      immediate: true,
      handler: function(to) {
        ipcRenderer.invoke('connecting', to);
      }
    }
  },
  computed: {
    ...mapState({
      clashConfigs: (state) => state.app.clashConfigs,
      isConnecting: (state) => state.app.isConnecting,
      clashProfileContent: (state) => state.app.clashProfileContent,
      clashProfileUrl: (state) => state.app.clashProfileUrl,
      isTicketResponsed: (state) => state.app.isTicketResponsed
    }),
    ...mapGetters(['clashProfileObject'])
  },
  methods: {
    ...mapMutations([
      'setMixinObject',
      'setClashProfileContent',
      'setIsTicketResponsed'
    ]),
    ...mapActions(['doLogin', 'refreshClashProfile']),
    async getCurrentProxyName() {
      try {
        if (!this.currentProxyName) {
          const { proxies } = await getProxies();
          this.currentProxyName = proxies?.Proxy?.now || '';
        }
        if (!this.currentProxyFlag) {
          if (this.proxyList.length == 0) {
            let proxyList = await getProxy();
            this.proxyList = proxyList.data;
          }
          let node = this.proxyList.filter(item => {
            return item.name == this.currentProxyName;
          });
          this.currentProxyFlag = node[0].flag;
        }
        this.isLoading = false;
      } catch (e) {
        this.isLoading = false;
      }
      ipcRenderer.send('sync-clash-proxy-name', this.currentProxyName);
    },
    async handleConnect() {
      if(this.expireNotice){
        this.$toast({
          message: this.$t(this.expireNotice)
        });
        return
      }
      if (this.clashConfigs['mixed-port'] === 0 && !this.settings.isTUN) {
        try {
          await this.$dialog({
            title: this.$t('Fail to connect'),
            message: this.$t('Port is not listening please change a new one'),
            confirmText: this.$t('Go to setting page')
          });
          this.$router.push('/setting');
        } catch (e) {
        }
        return;
      }
      this.$toast({
        message: this.$t('Connecting')
      });
      this.isConnectLoading = true;
      let success = false;
      try {
        await changeProxy('GLOBAL', 'Proxy').catch((e) => {
        });
        if (this.settings?.isTUN) {
          this.setMixinObject({
            dns: {
              enable: true,
              'enhanced-mode': 'fake-ip',
              nameserver: ['114.114.114.114', '223.5.5.5', '8.8.8.8'],
              'fake-ip-filter': [
                '+.stun.*.*',
                '+.stun.*.*.*',
                '+.stun.*.*.*.*',
                '+.stun.*.*.*.*.*',
                '*.n.n.srv.nintendo.net',
                '+.stun.playstation.net',
                'xbox.*.*.microsoft.com',
                '*.*.xboxlive.com',
                ...(isWin()
                  ? ['*.msftncsi.com', '*.msftconnecttest.com', 'WORKGROUP']
                  : isMac()
                    ? ['apps.apple.com']
                    : [])
              ]
            },
            tun: {
              enable: true,
              stack: isWin() ? 'gvisor' : 'system',
              'dns-hijack': ['any:53'],
              'auto-route': true,
              'auto-detect-interface': true
            }
          });
          if (isMac()) {
            await setDNS(['114.114.114.114']);
          }
        }
        this.$setSystemProxy(true, this.clashConfigs['mixed-port']);
        success = true;
      } catch (e) {
        success = false;
        this.$dialog({
          title: this.$t('Fail to connect'),
          message: e.message
        });
      }
      setTimeout(() => {
        this.isConnectLoading = false;
        this.setIsConnecting(success);
        this.btnTimer = setInterval(() => {
          this.second += 1;
          if (this.second >= 60) {
            this.second = 0;
            this.min += 1;
          }
          if (this.min >= 60) {
            this.min = 0;
            this.hour += 1;
          }
        }, 1000);
      }, 2000);
    },
    async handleDisconnect() {
      this.$toast({
        message: this.$t('Disconnected')
      });
      this.disconnect();
      this.setIsConnecting(false);
      clearInterval(this.btnTimer);
      clearInterval(this.getSpeed);
      this.btnTimer = null;
      this.getSpeed = null;
      this.second = 0;
      this.min = 0;
      this.hour = 0;
    },
    getTraffic() {
      // 实时获取流量
      requestTraffic((chunk) => {
        if (chunk == null || chunk.length === 0) {
          return;
        }
        try {
          const traffic = JSON.parse(chunk);
          if (traffic.up < 1024) {
            this.up = traffic.up + 'B';
          } else if (traffic.up > 1024 && traffic.up < 1024 * 1024) {
            this.up = eval(traffic.up / 1024).toFixed(2) + 'KB';
          } else if (traffic.up > 1024 * 1024) {
            this.up = eval(traffic.up / (1024 * 1024)).toFixed(2) + 'MB';
          }
          if (traffic.down < 1024) {
            this.down = traffic.down + 'B';
          } else if (traffic.down > 1024 && traffic.down < 1024 * 1024) {
            this.down = eval(traffic.down / 1024).toFixed(2) + 'KB';
          } else if (traffic.down > 1024 * 1024) {
            this.down = eval(traffic.down / (1024 * 1024)).toFixed(2) + 'MB';
          }
          ipcRenderer.send('sync-local-flow', [this.up, this.down]);
        } catch (e) {
          // eat it
        }
      });
    },
    async windowsFocusHandler(e, type) {
      if (type !== 'focus') return;
      const now = new Date().getTime();
      if (this.lastUpdateTime === null) {
        this.lastUpdateTime = now;
        return;
      }
      if (this.lastUpdateTime < now - refreshInterval) {
        // this.$dialog({
        //   title: '测试',
        //   message: `上次更新时间：${moment(this.lastUpdateTime).format(
        //     'YYYY-MM-DD HH:mm:ss'
        //   )}`
        // });
        await clear();
        this.lastUpdateTime = now;
        await Promise.allSettled([this.setup(), this.refreshClashProfile()]);
      }
    },
    async silentLogin() {
      const logined = cache.get(storageKeys.IS_USER_LOGINED) || false;
      if (!logined) {
        this.goto('/index');
        return;
      }
      this.isBackgroundLogin = true;
      const c = cache.get(storageKeys.USER_LOGIN_INFO) || {};
      try {
        await this.doLogin({
          email: c?.email || '',
          password: c?.password || ''
        });
      } catch (e) {
        this.goto('/index');
      }
      this.isBackgroundLogin = false;
    },
    async setup() {
      const [uip] = await Promise.allSettled([
        getUserInfo()
      ]);
      let proxyList = await getProxy();
      this.getCurrentProxyName();
      this.proxyList = proxyList.data;
      if (uip.status === 'fulfilled') {
        this.userInfo = uip.value.info;
        if (this.userInfo.user.class_expire_notice) {
          this.expireNotice = this.userInfo.user.class_expire_notice;
        }
        if (this.userInfo) {
          if (this.userInfo.user.u + this.userInfo.user.d > this.userInfo.user.transfer_enable) {
            this.$toast({
              message: this.$t('Your account has expired')
            });
          }
          if (this.userInfo.user_expire) {
            this.$toast({
              message: this.$t('Your account has expired')
            });
          }
        }
      }
      let config = await getSubscribe();
      console.log("config", config);
      if (config) {
        this.modalContent = config.notice.content;
        this.modalTitle = config.notice.title;
        if (this.modalContent) {
          this.isModal = true;
        }
      }

      ipcRenderer.send('sync-clash-node', proxyList.data);

      if (!this.intervalID) {
        this.intervalID = setInterval(this.getCurrentProxyName, 3000);
      }
    },
    toProxy() {
      if(this.userInfo.user_expire){
        this.$toast({
          message: this.$t('Your account has expired')
        });
        return
      }
      this.$router.push('/proxy');
    },
    async getSetup() {
      ipcRenderer.on('window-event', this.windowsFocusHandler);
      await this.silentLogin();
      this.setup();
    },
    changeMode() {
      this.isGlobalMode = !this.isGlobalMode;
      if (this.isGlobalMode) {
        this.$toast({
          message: this.$t('Global mode is on')
        });
      }
    }
  },
  beforeRouteEnter(to, from, next) {
    next(async (vm) => {
      ipcRenderer.on('window-event', vm.windowsFocusHandler);
      if ([null, 'index-page'].includes(from.name)) {
        vm.isLoading = true;
        await vm.silentLogin();
        vm.setup();
        vm.getTraffic();
      }
    });
  },
  beforeRouteLeave(to, from, next) {
    ipcRenderer.removeListener('window-event', this.windowsFocusHandler);
    to.meta.keepAlive = true;
    next();
  },
  // created() {
  // 	this.getSetup()
  // },
  mounted() {
    this.$EventBus.$on('getFlag', (val) => {
      if (val) {
        this.currentProxyFlag = val;
      }
    });
    this.$EventBus.$on('getProxyName', (val) => {
      if (val) {
        this.currentProxyName = val;
      }
    });
	this.$EventBus.$on("refreshMain", (val) => {
	  if (val === true) {
		this.silentLogin();
		setTimeout(()=>{
			this.setup();
		},1000)
		
	  }
	});
    // ipcRenderer.on('window-event', this.windowsFocusHandler);
    // await this.silentLogin();
    // this.setup();
    ipcRenderer.on('startConnect', (event, data) => {
      if (data){
        this.handleConnect();
      } else {
        this.handleDisconnect()
      }
    });
    ipcRenderer.on('changeGlobalMode', (event, data) => {
      this.changeMode();
    });
    ipcRenderer.on('changeProxy', (event, data) => {
      const success = changeProxy("Proxy", data.name);
      if (success) {
        this.currentProxyName = data.name;
        this.currentProxyFlag = data.flag;
      }
    });
  },
  beforeDestroy() {
    if (this.intervalID) {
      clearInterval(this.intervalID);
    }
  }
};
</script>

<style lang='scss' scoped>
.slide-up {
  animation: slide-up 0.5s ease-in-out;
}

@keyframes slide-up {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-36px);
  }
}

.page {
  width: 700px;
  height: 520px;
}

.header-bar {
  width: 700px;
  height: 44px;
  -webkit-app-region: drag;
}

.link-btn {
  background: url(../../../static/index/Main/tg_loading.png);
  background-repeat: no-repeat;
  background-size: 162px 162px;
  width: 162px;
  height: 162px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.nolink-btn {
  background: url(../../../static/index/Main/tg_on.png);
  background-repeat: no-repeat;
  background-size: 162px 162px;
  width: 162px;
  height: 162px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  animation: rotation 8s linear infinite;
  cursor: pointer;
}

@keyframes rotation {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.main-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 64px;

}

.up-img {
  width: 19.76px;
  height: 19.76px;
  cursor: pointer;
}

.align-center {
  align-items: center;
}

.up-num {
  font-size: 18px;
  font-family: Sora-SemiBold, Sora;
  font-weight: 500;
  color: #6F75FF;
  margin-left: 8px;
}

.proxy-bar {
  width: 380px;
  height: 44px;
  /* background: #FFFFFF; */
  box-shadow: 0px 8px 12px 0px rgba(0, 0, 0, 0.05);
  border-radius: 4px 4px 4px 4px;
  border: 1px solid #44465B;
  margin-top: 18px;
  display: flex;
  align-items: center;
  cursor: pointer;
  justify-content: space-between;

}

.country-img {
  width: 24.26px;
  height: 24.26px;
  border-radius: 3px;
  margin-left: 17px;
  cursor: pointer;
}

.proxy-name {
  font-size: 15px;
  font-family: Poppins-SemiBold, Poppins;
  font-weight: 600;
  color: #6F75FF;
  margin-left: 19px;
  cursor: pointer;
}

.root-img {
  width: 29.53px;
  height: 16px;
}

.refresh-img {
  width: 18px;
  height: 18px;
  cursor:pointer;
}

.mode-bar {
  display: flex;
  align-items: center;
  margin-top: 24px;
}

.mode-name {
  margin-left: 12px;
  margin-right: 10px;
  font-size: 15px;
  font-family: Poppins-SemiBold, Poppins;
  font-weight: 600;
  color: #FFFFFF;
  cursor:pointer;
}

.server-img {
  width: 55px;
  height: 66px;
  // margin-left: 619px;
  position: absolute;
  bottom: 17px;
  right: 26px;
}

.nolink-text {
  font-size: 18px;
  font-family: Poppins-SemiBold, Poppins;
  font-weight: 600;
  color: #FFFFFF;
  position: absolute;
  top: 55px;
  left: 54px;
  cursor: pointer;
}

.link-text {
  font-size: 18px;
  font-family: Poppins-SemiBold, Poppins;
  font-weight: 600;
  color: #FFFFFF;
  cursor: pointer;
}

.link-time {
  font-size: 18px;
  font-family: Poppins-Light, Poppins;
  font-weight: 300;
  color: #FFFFFF;
  position: absolute;
  top: 80px;
  left: 46px;
  cursor: pointer;
}

.shuttle-img {
  width: 20px;
  height: 20px;
}

.header-title {
  font-size: 14px;
  font-family: Inter-Regular, Inter;
  font-weight: 400;
  color: #1E266E;
  margin-left: 10px;
}

.header-btn {
  margin-left: 20px;
  width: 98px;
  height: 21px;
  border-radius: 4px 4px 4px 4px;
  opacity: 1;
  border: 1px solid #1E266E;
  font-size: 14px;
  font-family: Inter-Regular, Inter;
  font-weight: 400;
  color: #1E266E;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.expire-notice {
  position: absolute;
  bottom: 30px;
  left: 260px;
  /* width: 700px;
  text-align: center; */
  width: 380px;
  height: 39px;
  background: #24273F;
  box-shadow: 0px 8px 12px 0px rgba(0,0,0,0.05);
  border-radius: 4px 4px 4px 4px;
  opacity: 1;
  border: 1px solid rgba(128,134,187,0.05);
  margin: 0 auto;
  margin-top: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(176,23,31);
}
.off-img{
	width: 24px;
	height: 24px;
	margin-bottom: 10px;
}
.arrow-icon{
	width: 20px;
	height: 20px;
	margin-right: 20px;
}

.m-l-52 {
  margin-left: 52px;
}

.m-t-34 {
  margin-top: 34px;
}

.m-t-12 {
  margin-top: 12px;
}

.m-l-51 {
  margin-left: 51px;
}
</style>
