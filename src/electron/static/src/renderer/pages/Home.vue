<template>
  <div style='overflow: hidden;'>
    <div class='flex'>
      <div>
        <div class='left-header'></div>
        <div class='router-card'>
          <!-- <img class="logo" src="../../../static/index/Home/logo.png" /> -->
          <div class='app-title'>{{ name }}</div>
          <div class='card'>
            <div :class="[currentIndex===0?'router-items-act':'router-items']"
                 @click="toPath('/home',0)">
			        <i class="ri-shield-flash-line rocket-img"></i>
              <div class='items-text'>{{ $t('Accelerate') }}</div>
            </div>
            <div :class="[currentIndex===1?'router-items-act':'router-items']"
                 @click="toPath('/sub',1)"
				 v-if="config&&config.menu&&config.menu.shop">
			  <i class="ri-vip-crown-2-line shop-img"></i>
              <div class='items-text'>{{ $t('Shop') }}</div>
            </div>
            <div :class="[currentIndex===2?'router-items-act':'router-items']"
                 @click="toPath('/user',2)"
				 v-if="config&&config.menu&&config.menu.user">
			        <i class="ri-user-5-line user-img"></i>
              <div class='items-text'>{{ $t('Mine') }}</div>
            </div>
            <div :class="[currentIndex===3?'router-items-act':'router-items']"
                 @click="toPath('/invite',3)"
				 v-if="config&&config.menu&&config.menu.gift">
			  <i class="ri-gift-2-line shop-img" ></i>
              <div class='items-text'>{{ $t('Invite') }}</div>
            </div>
            <div class='router-items'
                 style='margin-top: 25px;'
                 @click="toPath('/setting')">
              <img class='set-img' src='../../../static/index/Home/settings.png' />
              <div class='set-version'>v{{ version }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="right-page">
        <div class='header-bar' style='background-color: rgb(23, 27, 55);'>
          <div class='checkout-card'>
            <div class='flex align-center m-t-12 m-l-51'>
              <div class='header-title'>{{ $t('Daily check-in') }}</div>
              <div class='header-btn' @click='getCheckout()' v-if='isCheckIn'>
                <div style='cursor: pointer;'>{{ $t('Receive traffic red envelope') }}</div>
              </div>
              <div class='header-btn' @click='getCheckout()' v-else>{{ $t('Received') }}</div>
            </div>
          </div>
		  <div style="display: flex;align-items: center;cursor: pointer;" @click="$router.push('/sub')">
			  <div class="vip-img">
				  <svg width="51" height="14" viewBox="0 0 51 14" fill="none" xmlns="http://www.w3.org/2000/svg">
				  <path fill-rule="evenodd" clip-rule="evenodd" d="M10.9729 0H49.9999C50.5522 0 50.9999 0.447715 50.9999 1V12.3243C50.9999 12.8766 50.5522 13.3243 49.9999 13.3243H10.9729V13.126C10.9747 13.1268 10.9765 13.1276 10.9782 13.1284C11.0225 13.1477 11.0704 13.1577 11.1187 13.1577C11.167 13.1577 11.2148 13.1477 11.2591 13.1284C11.3034 13.109 11.3432 13.0807 11.3761 13.0452L19.3391 4.41877C19.3941 4.35919 19.4267 4.28239 19.4314 4.20146C19.4362 4.12052 19.4127 4.04045 19.365 3.97486L16.6841 0.288936C16.619 0.199432 16.5337 0.126595 16.4351 0.0763789C16.3365 0.0261628 16.2274 -7.13342e-06 16.1167 8.25478e-06H10.9729V0ZM30.0501 2.8L28.1501 8.25H27.9201L27.9501 2.8H25.9901L26.0701 10H29.2701L32.0001 2.8H30.0501ZM33.4844 10L34.7444 2.8H32.9444L31.6744 10H33.4844ZM38.2771 7.81H37.0871L36.6971 10H34.8971L36.1671 2.8H39.2171C39.9704 2.8 40.5071 2.97333 40.8271 3.32C41.0604 3.58667 41.1771 3.92667 41.1771 4.34C41.1771 4.48 41.1638 4.62667 41.1371 4.78L40.9371 5.91C40.8371 6.46333 40.5438 6.92 40.0571 7.28C39.5704 7.63333 38.9771 7.81 38.2771 7.81ZM38.5871 4.36H37.6871L37.3571 6.25H38.2471C38.7938 6.25 39.1104 6.00667 39.1971 5.52L39.2671 5.11C39.2804 5.05 39.2871 4.97 39.2871 4.87C39.2871 4.77 39.2371 4.66 39.1371 4.54C39.0371 4.42 38.8538 4.36 38.5871 4.36Z" fill="url(#paint0_linear)"/>
				  <path d="M3.31551 0.70128H3.31561H13.3117H13.3118L13.3119 0.701433L15.8235 4.15456L8.31362 12.2901L0.80345 4.15495L3.3154 0.701433L3.31551 0.70128Z" stroke="#60E2FF" stroke-width="1.40256"/>
				  <path d="M8.766 3.50635H11.9218L7.36344 8.06467L8.06472 4.90891H6.31152L9.46728 0.350586L8.766 3.50635Z" fill="#60E2FF"/>
				  <defs>
				  <linearGradient id="paint0_linear" x1="19.5" y1="-8.31645e-08" x2="51" y2="13" gradientUnits="userSpaceOnUse">
				  <stop stop-color="#60E2FF"/>
				  <stop offset="1" stop-color="#60E2FF"/>
				  </linearGradient>
				  </defs>
				  </svg>
				  
			  </div>
			  <i class="ri-mail-line" style="color: #FFFFFF;margin-right: 20px;cursor: pointer;"></i>
			  <div class='right-icon' v-if="winShow">
			    <div class='flex align-center'>
			      <div @click='toMin' class='min-card'>
			        <img class='min-img' src='../../../static/index/Home/min.png' />
			      </div>
			      <img @click='toClose' class='close-img' src='../../../static/index/Home/close.png' />
			    </div>
			  </div>
		  </div>
		  
        </div>
        <keep-alive>
          <router-view></router-view>
        </keep-alive>
      </div>
    </div>
  </div>


</template>

<script>
import {
  getUserInfo, doCheckIn
} from '../commons/api';
import { ipcRenderer, shell, clipboard } from 'electron';
import { isLinux, isMac, isWin } from '../constant/platform.js';
import Dialog from '../components/Dialog.vue';
import pack from "../../../package";

export default {
  data() {
    return {
      currentIndex: 0,
      info: {},
      lastTime: 0,
      isCheckIn: false,
      isOpenCrisp: false,
      version: pack.version,
      name: pack.build.productName,
      isStart: false,
      winShow: false,
      routerName: '',
      config: {}
    };
  },
  components: {
    Dialog
  },
  beforeRouteEnter(to, from, next) {
    next(async (vm) => {
      vm.getPlat();
      setTimeout(() => {
        vm.getInfo();
      }, 4000);
    });
  },
  watch: {
    $route: {
      handler: function(val, oldVal) {
        this.routerName = val.name;
		if (['/', '/proxy', '/home'].includes(val.path)) {
		  this.currentIndex = 0;
		} else if (['/sub'].includes(val.path)) {
		  this.currentIndex = 1;
		} else if (['/user', '/order', '/ticket-create'].includes(val.path)) {
		  this.currentIndex = 2;
		} else if (val.path == '/invite') {
		  this.currentIndex = 3;
		}
      },
      // 深度观察监听
      deep: true
    }
  },
  methods: {
    getPlat() {
		let config = localStorage.getItem('config');
		if (config) {
		  this.config = JSON.parse(config);
		}
      this.routerName = this.$route.name;
      if (isWin()) {
        this.winShow = true;
      }
      
    },
    toPath(e, i) {
      this.currentIndex = i;
      this.$router.push(e);
    },
    async getInfo() {
      let { info } = await getUserInfo();
      this.info = info;
      this.lastTime = info.user.last_check_in_time;
      if (new Date(this.lastTime * 1000).toDateString() != new Date().toDateString()) {
        this.isCheckIn = true;
      } else {
        this.isCheckIn = false;
      }
      this.isOpenCrisp = this.config.crisp_enable;
    },
    async getCheckout() {
      let success = await doCheckIn();
      if (success) {
        this.$toast({
          message: success.msg
        });
        this.isCheckIn = false;
      }
    },
    handleOpenCrispChat() {
      try {
        this.$crisp.push([
          'on',
          'chat:closed',
          () => {
            this.$crisp.push(['do', 'chat:hide']);
          }
        ]);
        this.$crisp.push(['do', 'chat:show']);
        this.$crisp.push(['do', 'chat:open']);
      } catch (err) {
        console.log(err);
      }
    },
    toMin() {
      ipcRenderer.send('min');
    },
    toClose() {
      ipcRenderer.send('closewin');
    }
  }
};
</script>

<style scoped='scoped'>

.left-header {
  width: 100px;
  height: 30px;
  background-color: #1E213E;
  -webkit-app-region: drag;
}

.right-header {
  width: 700px;
  height: 30px;
  background-color: #FFFFFF;
}

.router-card {
  width: 100px;
  height: 520px;
  background-color: #1E213E;
  border-radius: 0px 0px 0px 0px;
  opacity: 1;
}

.logo {
  width: 73.64px;
  height: 49px;
  margin-left: 13px;
}

.align-center {
  align-items: center;
}

.router-items-act {
  width: 100%;
  height: 68px;
  background: #22264A;

  opacity: 1;
  margin-bottom: 18px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: #6F74FF;
}

.router-items {
  width: 100%;
  height: 68px;
  border-radius: 4px 4px 4px 4px;
  opacity: 1;
  margin-bottom: 18px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: #a8a9b3;
}

.card {

  margin-top: 29px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.rocket-img {
  font-size: 25px;
  margin-bottom: 6px;
  cursor: pointer;
}

.remeber-img {
  font-size: 26px;
  margin-bottom: 4px;
  cursor: pointer;
}

.user-img {
   font-size: 26px;
  margin-bottom: 5px;
  cursor: pointer;
}

.shop-img {
  font-size: 28px;
  margin-bottom: 1px;
  cursor: pointer;
}

.items-text {
  font-size: 14px;
  font-family: Inter-Regular, Inter;
  font-weight: 400;
  color: #FFFFFF;
  line-height: 16px;
  cursor: pointer;
}

.set-img {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.set-version {
  font-size: 16px;
  font-family: Inter-Regular, Inter;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
}

.setting-card {
  width: 30px;
  margin: 0 auto;

}

.server-img {
  width: 55px;
  height: 66px;

  position: absolute;
  bottom: 17px;
  right: 26px;
  background: url('../../../static/index/Main/server.png');
  background-repeat: no-repeat;
  background-size: cover;
  box-shadow: 0px 0px 0px 0px rgb(0 0 0 / 10%) !important;
  cursor: pointer;
}

.checkout-card {
  /* position: absolute;
  top:12px;
  left:157px; */
  margin-top: 12px;
  /* margin-left: 51px; */
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
  color: #FFFFFF;
  margin-left: 10px;
}

.right-icon {
  /* position: absolute;
  right: 16px;
  top: 13px; */
  cursor: pointer;
  margin-top: 17px;
  margin-right: 17px;
	display: flex;
	align-items: center;
  -webkit-app-region: no-drag;

}

.header-btn {
  margin-left: 20px;
  width: 98px;
  height: 21px;
  border-radius: 50px;
  opacity: 1;
  border: 1px solid #FFB800;
  font-size: 14px;
  font-family: Inter-Regular, Inter;
  font-weight: 400;
  color: #FFB800;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  -webkit-app-region: no-drag;
}

.min-img {
  width: 18px;
  height: 15px;


  cursor: pointer;
  -webkit-app-region: no-drag;

}

.close-img {
  width: 18px;
  height: 18px;


  cursor: pointer;
  -webkit-app-region: no-drag;

}

.min-card {
  width: 14px;
  height: 14px;
  margin-right: 30px;
  display: flex;
  align-items: center;

  cursor: pointer;
  -webkit-app-region: no-drag;

}

.header-bar {
  width: 700px;
  height: 44px;
  background-color: #0CBC8B;
  display: flex;
  justify-content: space-between;
  /* cursor: pointer; */
  -webkit-app-region: drag;
}

.app-title {
  color: #adadad;
  text-align: center;
}
.vip-img{
	margin-right: 20px;
}
.right-page{
	background-color: #171B37;
	background: url(../../../static/index/Home/home_bg.png);
	background-repeat: no-repeat;
}
</style>
