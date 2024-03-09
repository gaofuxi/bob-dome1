<template>
	<div class="rightCard-resgiter" >
		  <div class="flex" style="margin-bottom: 30px;">
			  <div class="text" @click="$emit('getStep','1')">邮箱登录</div>
			  <div class="text-act">立即注册</div>
		  </div>
		  <div class="input-card">
			  <div class="input-title">*邮箱</div>
			  <input class="email-Input-res"
			  v-model="email"
			   type="email"
			   :placeholder="'请输入您的邮箱'"
			   :errorHint="emailErrorHint"
			  />
		  </div>
		  <div class="input-card" v-if="configlist.enable_email_verify">
			  <div class="input-title">*验证码</div>
			  <input class="email-Input-res"
			  v-model="code"
			  style="width: 200px;"
			   :placeholder="'请输入您的验证码'"
			  />
			  <div class="code-btn" @click="handleSendCode">{{sendCodeCounter === 0?'获取验证码':sendCodeCounter+'s'}}</div>
		  </div>
		  <div class="input-card">
			  <div class="input-title">*密码</div>
			  <input class="email-Input-res"
			  v-model="password"
			   type="password"
			   :placeholder="'请输入您的密码'"
			  />
		 </div>
		 <div class="input-card">
			  <div class="input-title">*确认密码</div>
			  <input class="email-Input-res"
			  v-model="confirmPassword"
			  type="password"
			   :placeholder="'请确认您的密码'"
			   :type="passwordInputType"
			   :errorHint="confirmPasswordErrorHint"
			  />
		 </div>
		  <div class="input-card">
			  <div class="input-title">*邀请码</div>
			  <input class="email-Input-res"
			   v-model="inviteCode"
			    :placeholder="'请输入您的邀请码（选填）'"
			   />
		  </div>
		 
		  <div class="login-btn"  @click="handleRegister">
			  <img
				v-if="isLogining"
				class="w-[20px] h-[20px] animate-spin"
				src="static/imgs/logo-empty.png"
			  />
			  <span v-else>注册</span>
			</div>
		<div class="back-text" @click="$emit('getStep','1')">返回登录</div>
	</div>
</template>

<script>
import Input from '../../../components/Input.vue';
import {
  getGuestConfig,
  register,
  sendValidateCode,
} from '../../../commons/api';
import { setNowInterval } from '../../../commons/helper';
import cache from '../../../commons/cache';
import storageKeys from '../../../constant/storageKeys';
import {
  checkCode,
  checkEmail,
  checkPassword,
} from '../../../commons/validator';
export default {
  name: 'RegisterPage',
  components: { Input },
  props:{
	  configlist:{
		  type:Object,
		  default:{}
	  }
  },
  data() {
    return {
      passwordVisible: false,
      password: '',
      confirmPasswordVisible: false,
      confirmPassword: '',
      inviteCode: '',
      email: '',
      code: '',
      name:'',
      repasswd:'',
      emailErrorHint: '',
      codeErrorHint: '',
      confirmPasswordErrorHint: '',
      sendCodeCounter: 0,
      passwordErrorHint: '',
      guestConfig: null,
	    isLogining:false,
    };
  },
  computed: {
    passwordInputType() {
      return this.passwordVisible ? 'text' : 'password';
    },
    confirmPasswordInputType() {
      return this.confirmPasswordVisible ? 'text' : 'password';
    },
  },
  methods: {
    isEmailLegal(email) {
      if (!this.guestConfig) {
        return false;
      }
      if (this.guestConfig?.email_whitelist_suffix) {
        return (this.guestConfig?.email_whitelist_suffix).some((suffix) =>
          email.endsWith(suffix)
        );
      }
      return true;
    },
    async handleSendCode() {
      const showErrorDialog = (err) => {
        this.$toast({
          message: err,
          type: 'error',
        });
      };
      // if (!this.isEmailLegal(this.email)) {
      //   showErrorDialog(this.$t('Email type is not allow'));
      //   return;
      // }
      const emailError = checkEmail(this.email);
      if (emailError) {
        showErrorDialog(this.$t(emailError));
        return;
      }
      this.emailErrorHint = '';
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
    async handleRegister() {
      let error = '';
      if (this.confirmPassword !== this.password) {
        error = this.$t('Password different');
      }
      const passwordError = checkPassword(this.password);
      if (passwordError) {
        error = this.$t(passwordError);
      }
	  if(this.configlist.enable_email_verify){
		  const codeError = checkCode(this.code);
		  if (codeError) {
		    error = this.$t(codeError);
		  }
	  }
     
      const emailError = checkEmail(this.email);
      if (emailError) {
        error = this.$t(emailError);
      }
      if (error) {
        this.$toast({
          message: error,
          type: 'error',
        });
        return;
      }
	  this.isLogining = true
	  const res = await register({
	    name:this.name,
	    email: this.email,
	    code: this.code,
	    password: this.password,
	  	repasswd:this.confirmPassword,
	    inviteCode: this.inviteCode,
	  });
	  this.isLogining = false
	  if(res.ret==0){
		  this.$toast({
		    message:res.msg,
		  });
		  return
	  }else{
		  cache.put(storageKeys.USER_LOGIN_INFO, {
		    email: this.email,
		    password: '',
		  });
		   
		   this.$toast({
		     message:'注册成功',
		   });
		  this.$emit('getStep','1')
	  }
    },
    async setup() {
      try {
        this.guestConfig = await getGuestConfig();
      } catch (e) {}
    },
  },
  mounted() {
    this.setup();
  },
};
</script>

<style scoped="scoped">
.rightCard-resgiter{
	width: 421px;
	height: 454px;
	margin-top: -28px;
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
.back-text{
	color: #ADADAD;
	cursor: pointer;
	margin-top: 10px;
	text-align: center;
	margin-left: -30px;
	font-size: 14px;
}
</style>
