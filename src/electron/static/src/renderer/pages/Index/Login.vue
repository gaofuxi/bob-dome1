<template>
  <div class='page'>
    <div class='header'>
      <div class='right-icon'>
        <div class='flex align-center'>
          <div @click='toMin' class='min-card' v-if='winShow'>
            <img class='min-img' src='../../../../static/index/Home/min.png' />
          </div>

          <img v-if='winShow' @click='toClose' class='close-img' src='../../../../static/index/Home/close.png' />
        </div>

      </div>
    </div>
    <!-- <img class="logo" src="../../../../static/index/Login/logo.png" /> -->
    <div style='display: flex;height: 100vh;'>
      <div class='left-bg'>
        <img v-if='configlist.login' class='left-logo-bg' :src='configlist.login.background_img'>
        <div v-if='configlist.login' class='left-text' v-html='configlist.login.text'
             :style='{color:configlist.login.text_color}'></div>
      </div>

      <div class='flex'>
        <!-- <img class="leftImg" src="../../../../static/index/Login/bg2.png" /> -->
        <div style='width: 100%;'>
          <div class='rightCard' v-if='step==0'>
            <div class='flex'>
              <div class='text-act'>邮箱登录</div>
              <div class='text' @click='step=3'>扫码登录</div>
            </div>
            <input class='email-Input'
                   v-model='email'
                   type='email'
                   @keyup.enter='handleLogin'
                   :placeholder="'请输入您的邮箱'"
                   :errorHint='emailErrorHint'
            />
            <input class='password-Input'
                   @keyup.enter='handleLogin'
                   v-model='password'
                   type='password'
                   :placeholder="'请输入您的密码'"
            />
            <div class='login-btn' @keyup.enter.native='handleLogin' @click='handleLogin'>
              <img
                v-if='isLogining'
                class='w-[20px] h-[20px] animate-spin'
                src='../../../../static/index/Main/loading.png'
              />
              <span v-else>立即登录</span>
            </div>
            <div v-if='step==0' class='flex footer-card'>
              <div class='footer-text' @click='toResigter' style='cursor: pointer;'>忘记密码</div>
              <div class='footer-text' @click='step=1'>没有帐号？<span class='footer-text-span'>立即注册</span></div>
            </div>
          </div>
          <Register v-if='step==1' @getStep='getStep' :configlist='configlist'></Register>
          <ResetPassword v-if='step==2' @getStep='getStep'></ResetPassword>
          <LoginCode v-if='step==3' @getStep='getStep'></LoginCode>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Input from '../../components/Input.vue';
import cache from '../../commons/cache';
import storageKeys from '../../constant/storageKeys';
import { mapActions, mapMutations } from 'vuex';
import Slider from '../../components/Slider.vue';
import ResetPassword from './Login/ResetPassword.vue';
import Register from './Login/Register.vue';
import LoginCode from './Login/LoginCode.vue';
import { checkEmail, checkPassword } from '../../commons/validator';
import { ipcRenderer, shell, clipboard } from 'electron';
import { isLinux, isMac, isWin } from '../../constant/platform.js';

import {
  chosenDomain,
  chosenDomainIndex,
  getAPPVersion,
  getSubscribe
} from '../../commons/api';

export default {
  name: 'LoginPage',
  components: { Input, Slider, ResetPassword, Register, LoginCode },
  data() {
    return {
      passwordVisible: false,
      password: '',
      email: '',
      emailErrorHint: '',
      isLogining: false,
      pn: null,
      step: 0,
      winShow: false,
      configlist: ''
    };
  },
  watch: {
    pn() {
      this.setup();
    }
  },
  computed: {
    passwordInputType() {
      return this.passwordVisible ? 'text' : 'password';
    }
  },
  methods: {
    ...mapMutations([
      'setClashProfileUrl',
      'setClashProfileContent',
      'setAPPUpdateInfo',
      'setUserAuthInfo'
    ]),
    ...mapActions(['doLogin']),
    handleIconClick() {
      this.passwordVisible = !this.passwordVisible;
    },
    handleResetClick() {
      this.pn = ResetPassword;
    },
    handleRegisterClick() {
      this.pn = Register;
    },
    async handleLogin() {
      if (this.isLogining) return;
      const emailError = checkEmail(this.email);
      if (emailError) {
        this.$toast({
          message: this.$t(emailError),
          type: 'error'
        });
        return;
      }
      // const passwordError = checkPassword(this.password);
      // if (passwordError) {
      //   this.$toast({
      //     message: this.$t(passwordError),
      //     type: 'error',
      //   });
      //   return;
      // }
      this.isLogining = true;
      // console.log('登陆')
      // return
      try {
        const { hasPlan, token, authData } = await this.doLogin({
          email: this.email,
          password: this.password
        });
        // this.$toast({
        //   message: `使用第${chosenDomainIndex}个地址${chosenDomain}登陆`,
        // });
        this.goto('/home');
        this.settings.mode = 'rule';
      } catch (e) {
        this.$toast({
          message: e.message,
          type: 'error'
        });
      }
      this.isLogining = false;
    },
    setup() {
      const { email, password } = cache.get(storageKeys.USER_LOGIN_INFO) || {};
      this.email = email;
      this.password = password;
      this.getConfig();
    },
    toMin() {
      ipcRenderer.send('min');
    },
    toClose() {
      ipcRenderer.send('closewin');
    },
    toResigter() {
      window.open(this.configlist.baseUrl);
    },
    async getConfig() {
      let configlist = localStorage.getItem('config');
      if (configlist) {
        configlist = JSON.parse(configlist);
      } else {
        configlist = await getSubscribe();
      }
      this.configlist = configlist;

    },
    getStep(e) {
      this.step = 0;
    }
  },
  async mounted() {
    if (isWin()) {
      this.winShow = true;
    }
    this.setup(true);
  }
};
</script>

<style scoped='scoped'>
input {
  outline: none;
}

.logo {
  width: 216.83px;
  height: 43px;
  margin-top: 4px;
  margin-left: 49px;
}

.header {
  height: 44px;
  -webkit-app-region: drag;
}

.page {
  width: 100%;
  height: 520px;
  overflow: hidden;
  background-color: #171B37;
  background: url(../../../../static/index/Home/home_bg.png);
  background-repeat: no-repeat;
}

.leftImg {
  width: 231px;
  height: 323.58px;
  margin-top: 110px;
  margin-left: 63px;
}

.rightCard {
  width: 381px;
  height: 317px;

  margin-top: 38px;
  margin-left: 65px;
  /* background-color: #171B37; */

}

.text-act {
  font-size: 18px;
  height: 30px;
  font-family: Inter-Bold, Inter;
  font-weight: bold;
  color: #FFFFFF;
  line-height: 21px;
  margin-top: 27px;
  margin-left: 27px;
  border-bottom: 3px solid #4E55E8;
  cursor: pointer;
}

.text {
  font-size: 18px;
  font-family: Inter-Regular, Inter;
  font-weight: 400;
  color: #ADADAD;
  line-height: 21px;
  margin-top: 27px;
  margin-left: 40px;
  cursor: pointer;
}

.email-Input {
  width: 320px;
  height: 45px;
  background: #171B37;
  border-radius: 4px 4px 4px 4px;
  border: 1px solid #2C2F49;
  color: #FFFFFF;
  opacity: 1;
  margin-top: 26px;
  margin-left: 32px;
  padding-left: 19px;
}

.password-Input {
  width: 320px;
  height: 45px;
  background: #171B37;
  border-radius: 4px 4px 4px 4px;
  border: 1px solid #2C2F49;
  color: #FFFFFF;
  border-radius: 4px 4px 4px 4px;
  opacity: 1;
  margin-top: 18px;
  margin-left: 32px;
  padding-left: 19px;
}

.login-btn {
  width: 320px;
  height: 45px;
  background: #6F74FF;
  border-radius: 4px 4px 4px 4px;
  opacity: 1;
  font-size: 14px;
  font-family: Inter-Bold, Inter;
  font-weight: bold;
  color: #FFFFFF;
  line-height: 21px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 23px;
  margin-left: 32px;
  cursor: pointer;
}

.m-l-65 {
  margin-left: 65px;
}

.footer-card {
  width: 317px;
  justify-content: space-between;
  margin-top: 20px;
  margin-left: 32px;
}

.footer-text {
  font-size: 14px;
  font-family: Inter-Regular, Inter;
  font-weight: 400;
  color: #adadad;
  line-height: 16px;
}

.right-icon {
  /* position: absolute;
  right: 33px;
  top: 25px; */
  margin-left: 686px;
  margin-top: 15px;
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
  -webkit-app-region: no-drag;
}

.min-img {
  width: 18px;
  height: 5px;

  pointer-events: auto;

  -webkit-app-region: no-drag;
  cursor: pointer;
}

.close-img {
  width: 18px;
  height: 18px;
  pointer-events: auto;

  -webkit-app-region: no-drag;
  cursor: pointer;
}

.min-card {
  width: 22px;
  height: 18px;
  margin-right: 40px;
  display: flex;
  align-items: center;

  -webkit-app-region: no-drag;
  cursor: pointer;
}

.left-bg {
  width: 258px;
  background-color: #191D36;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.left-text {
  color: #FFFFFF;
  font-size: 24px;
  text-align: center;
  line-height: 38px;
}

.left-logo-bg {
  width: 150px;
  height: 150px;
  margin-bottom: 93px;
}

.footer-text-span {
  cursor: pointer;
  color: #6F74FF;
}
</style>
