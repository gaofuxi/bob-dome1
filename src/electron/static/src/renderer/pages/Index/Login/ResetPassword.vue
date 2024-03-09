<template>
	<div class="rightCard-resgiter" >
		  <div class="flex" style="margin-bottom: 40px;">
			  <div class="text" @click="$emit('getStep','1')">郵箱登錄</div>
			  <div class="text-act">忘记密码</div>
		  </div>
		  <div class="input-card">
			  <div class="input-title">*邮箱</div>
			  <input class="email-Input-res"
			  v-model="email"
			   type="email"
			   :placeholder="'請輸入您的郵箱'"
			  
			  />
		  </div>
		  <div class="input-card">
			  <div class="input-title">*验证码</div>
			  <input class="email-Input-res"
			  v-model="emailCode"
			  style="width: 200px;"
			   :placeholder="'請輸入您的验证码'"
			  />
			  <div class="code-btn" @click="handleSendCode">{{sendCodeCounter === 0?'获取验证码':sendCodeCounter+'s'}}</div>
		  </div>
		  <div class="input-card">
			  <div class="input-title">*密码</div>
			  <input class="email-Input-res"
			  v-model="password"
			   type="password"
			   :placeholder="'請輸入您的密碼'"
			  />
		 </div>
		 <div class="input-card">
			  <div class="input-title">*确认密码</div>
			  <input class="email-Input-res"
			  v-model="confirmPassword"
			  type="password"
			   :placeholder="'請确认您的密码'"
			   :type="passwordInputType"
			   :errorHint="confirmPasswordErrorHint"
			  />
		 </div>
		 
		  <div class="login-btn"  @click="handleReset">
			  <img
				v-if="isLogining"
				class="w-[20px] h-[20px] animate-spin"
				src="static/imgs/logo-empty.png"
			  />
			  <span v-else>重置密码</span>
			</div>
	</div>
</template>

<script>
import Input from '../../../components/Input.vue';
import cache from '../../../commons/cache';
import storageKeys from '../../../constant/storageKeys';
import { mapActions, mapMutations } from 'vuex';
import { resetPassword, sendValidateCode } from '../../../commons/api';
import { setNowInterval } from '../../../commons/helper';
import {
  checkCode,
  checkEmail,
  checkPassword,
} from '../../../commons/validator';
export default {
  name: 'ResetPasswordPage',
  components: { Input },
  data() {
    return {
      passwordVisible: false,
      password: '',
      confirmPassword: '',
      emailCode: '',
      email: '',
      sendCodeCounter: 0,
      isRequesting: false,
	  emailErrorHint: '',
	  codeErrorHint: '',
	  confirmPasswordErrorHint: '',
	  passwordErrorHint: '',
	  guestConfig: null,
    };
  },
  computed: {
    passwordInputType() {
      return this.passwordVisible ? 'text' : 'password';
    },
  },
  methods: {
    ...mapMutations([
      'setClashProfileUrl',
      'setClashProfileContent',
      'setAPPUpdateInfo',
      'setUserAuthInfo',
    ]),
    ...mapActions(['doLogin']),
    async handleSendCode() {
      const showErrorDialog = (err) => {
        this.$dialog({
          title: this.$t('Fail to send validate code'),
          message: err,
          type: 'fail',
        });
      };
      if (!this.email) {
        showErrorDialog(this.$t('Email can not be empty'));
        return;
      }
      if (this.sendCodeCounter !== 0) {
        return;
      }
      this.sendCodeCounter = 60;
      const intervalId = setNowInterval(() => {
        this.sendCodeCounter--;
        if (this.sendCodeCounter === 0) {
          clearInterval(intervalId);
        }
      }, 1000);
      try {
        if (await sendValidateCode(this.email)) {
          this.$dialog({
            title: this.$t('Pay attention'),
            message: this.$t('Invalid code Send Success'),
            type: 'success',
          });
        }
      } catch (e) {
        this.sendCodeCounter = 0;
        clearInterval(intervalId);
        showErrorDialog(e.message);
      }
    },
    handleIconClick() {
      this.passwordVisible = !this.passwordVisible;
    },
	async handleReset() {
      const showErrorDialog = (err) => {
        this.$toast({
          message: err,
          type: 'error',
        });
      };
      const emialError = checkEmail(this.email);
      if (emialError) {
        showErrorDialog(this.$t(emialError));
        return;
      }
	 
      const codeError = checkCode(this.emailCode);
      if (codeError) {
        showErrorDialog(this.$t(codeError));
        return;
      }
      const passwordError = checkPassword(this.password);
      if (passwordError) {
        showErrorDialog(this.$t(passwordError));
        return;
      }
      if (this.password !== this.confirmPassword) {
        showErrorDialog(this.$t('Passwords do not match'));
        return;
      }
      if (this.isRequesting) return;
      this.isRequesting = true;
      try {
        await resetPassword(this.email, this.emailCode, this.password);
		this.$toast({
		  message: '操作成功',
		  type: 'success',
		});
		this.$emit('getStep','1')
      } catch (e) {
        showErrorDialog(e.message);
      }
      this.isRequesting = false;
    },
    setup() {},
  },
  async mounted() {
    this.setup(true);
  },
};
</script>

<style scoped="scoped">
.rightCard-resgiter{
	width: 421px;
	height: 454px;
	margin-top: -22px;
	margin-left: 65px;
	
	
}
.text-act{
	font-size: 18px;
	font-family: Inter-Bold, Inter;
	font-weight: bold;
	color: #FFFFFF;
	line-height: 21px;
	margin-top: 27px;
	margin-left:27px;
	height: 30px;
	border-bottom: 3px solid #4E55E8;
}
.text{
	font-size: 18px;
	font-family: Inter-Regular, Inter;
	font-weight: 400;
	color: #ADADAD;
	line-height: 21px;
	margin-top: 27px;
	margin-left: 0px;
}
.email-Input-res{
	width: 300px;
	height: 45px;
	background: #171B37;
	border-radius: 4px 4px 4px 4px;
	border: 1px solid #2C2F49;
	color: #FFFFFF;
	border-radius: 4px 4px 4px 4px;
	opacity: 1;
	margin-left: 22px;
	padding-left: 19px;
}
.password-Input-res{
	width: 300px;
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
.login-btn{
	width: 317px;
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
.m-l-65{
	margin-left: 65px;
}
.footer-card{
	width: 381px;
	justify-content: space-between;
	margin-top: 20px;
}
.footer-text{
	font-size: 14px;
	font-family: Inter-Regular, Inter;
	font-weight: 400;
	color: #3E435C;
	line-height: 16px;
}
.input-card{
	display: flex;
	align-items: center;
	margin-left: 0px;
	margin-top: 15px;
}
.input-title{
	width: 78px;
	color: #ADADAD;
}
.code-btn{
	width: 92px;
	height: 26px;
	display: flex;
	justify-content: center;
	align-items: center;
	background: #6F74FF;
	color: #FFFFFF;
	font-size: 12px;
	margin-left: 10px;
	border-radius: 4px;
}
</style>
