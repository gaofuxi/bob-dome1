<template>
	<div>
		<div class="rightCard">
		  <div class="flex">
			  <div class="text" @click="toSwLogin">邮箱登录</div>
			  <div class="text-act" >扫码登录</div>
		  </div>
		 <Qrcode v-if="qrcodeShow" :id="'QrCode'" :text="qrcode"></Qrcode>
		</div>
	</div>
</template>

<script>
import Qrcode from '../../../components/Qrcode.vue'
import {getQrcode} from '../../../commons/api.js'
import { mapActions } from 'vuex';

export default{
	components:{
		Qrcode
	},
	data(){
		return{
			qrcode:'',
			tokenCode:"",
			qrcodeShow:false,
			timer:null
		}
	},
	created() {
		this.getCode()
	},
	beforeDestroy() {
		clearInterval(this.timer)
		this.timer = null
	},
	destroyed() {
		clearInterval(this.timer)
		this.timer = null
	},
	methods:{
    ...mapActions(['codeLogin']),
		async getCode(){
			 const res = await getQrcode()
			this.qrcode = res.data.token
			this.qrcodeShow = true
			if(this.qrcode){
				this.timer = setInterval(async ()=>{
					const success = await getQrcode(this.qrcode)
					if(success.data.user){
						clearInterval(this.timer)
						this.timer = null
						const successLogin = await this.codeLogin({
						  data: success.data.user,
						});
						if(successLogin){
							this.goto('/home');
							this.settings.mode = 'rule';
						}
					}
				},1000)
				this.$once('hook:beforeDestroy', () => {            
				        clearInterval(this.timer);                                    
				    })
			}
			// console.log(res)
		},
		toSwLogin(){
			this.$emit('getStep','1')
			clearInterval(this.timer)
			this.timer = null
		}
	}
	
}
</script>

<style scoped="scoped">
.rightCard{
	width: 381px;
	height: 317px;
	
	margin-top: 38px;
	margin-left: 65px;
	/* background-color: #171B37; */
	
}
.text-act{
	font-size: 18px;
	height: 30px;
	font-family: Inter-Bold, Inter;
	font-weight: bold;
	color: #FFFFFF;
	line-height: 21px;
	margin-top: 27px;
	margin-left:27px;
	border-bottom: 3px solid #4E55E8;
	cursor: pointer;
}
.text{
	font-size: 18px;
	font-family: Inter-Regular, Inter;
	font-weight: 400;
	color: #ADADAD;
	line-height: 21px;
	margin-top: 27px;
	margin-left: 40px;
	cursor: pointer;
}
</style>
