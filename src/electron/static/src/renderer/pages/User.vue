<template>
	<div>
		<Loading v-if="loadingShow" :content="$t('Loading')"></Loading>
		<div class="page">
			<div class="user-card">
				<div class="user-header">
					<img :src="info.gravatar" class="user-avatar" />
					<div class="user-infor">
						<div class="title">{{ $t('Account') }}</div>
						<div class="email-name">{{userInfo.user_name}}</div>
					</div>
					<div class="login-out-btn" @click="toExit()">
						<div class="exit-text">{{ $t('Logout') }}</div>
					</div>
				</div>
				<div class="line"></div>
				<div class="flex align-center m-t-5 m-l-14">
					<img class="rember-img" src='../../../static/index/User/rember.png' />
					<div class="rember-name rember-text" v-if="config&&config.node_class_name">{{ config.node_class_name[userInfo.class] }}</div>
					<div class="rember-time rember-text">{{userInfo.class_expire}}{{ $t('Expired') }}</div>
				</div>
			</div>
			<div class="items-bar">
				<div class="flex align-center">
					<img class="credit-img" src='../../../static/index/User/credit-cards.png' />
					<div class="items-name">{{ $t('Account Balance') }}</div>
				</div>
				<div class="flex align-center">
					<div class="items-sign">¥</div>
					<div class="price">{{userInfo.money}}</div>
				</div>
			</div>
			<div class="items-bar">
				<div class="flex align-center">
					<img class="water-img" src='../../../static/index/User/water.png' />
					<div class="items-name">{{ $t('Residual flow') }}</div>
				</div>
				<div class="byte-num">{{info.unUsedTraffic}}</div>
			</div>
			<div class="items-bar" v-if='config.login.telegram_url' @click="openExt(config.login.telegram_url)">
				<div class="flex align-center">
					<img class="question-img" src='../../../static/index/User/question.png' />
					<div class="items-name">{{ $t('Join Telegram') }}</div>
				</div>
				<img class="right-arrow-img" src='../../../static/index/User/right-arrow.png'/>
			</div>
			<div class="items-bar" @click="toPath('/order')">
				<div class="flex align-center">
					<img class="clipboard-img" src='../../../static/index/User/clipboard.png' />
					<div class="items-name">{{ $t('My Orders') }}</div>
				</div>
				<img class="right-arrow-img" src='../../../static/index/User/right-arrow.png'/>
			</div>
			<div class="items-bar" @click="$router.push('/ticket-create')"
				v-if="config&&config.hidden_ticket">
				<div class="flex align-center">
					<img class="question-img" src='../../../static/index/User/question.png' />
					<div class="items-name">{{ $t('Submit ticket') }}</div>
				</div>
				<img class="right-arrow-img" src='../../../static/index/User/right-arrow.png'/>
			</div>
		</div>
	</div>
</template>

<script>
import cache from '../commons/cache';
import Loading from '../components/Loading.vue'
import storageKeys from '../constant/storageKeys';
import { ipcRenderer, shell } from 'electron';
import {getUserInfo,logout} from '../commons/api.js'
import { mapMutations, mapState } from 'vuex';
export default{
	components:{
		Loading
	},
	data(){
		return{
			userInfo:{
				class:'',
				class_expire:"",
				money:''
			},
			info:{},
			config:{},
			loadingShow:false
		}
	},
	mounted() {
		this.getInfo()
		let config = localStorage.getItem('config')
		if(config){
			this.config = JSON.parse(config)
		}
	},
	methods:{
		...mapMutations(['resetAll']),
		toPath(e){
			this.$router.push(e)
		},
		async getInfo(){
			this.loadingShow =true
			const {info} = await getUserInfo()
			this.info = info
			this.userInfo = this.info.user
			this.loadingShow =false
		},
		async toExit(){
			await this.disconnect();
			this.resetAll();
			this.goto('/index');
			cache.put(storageKeys.IS_USER_LOGINED, false);
			ipcRenderer.invoke('window', 'reload');
		},
    openExt(url) {
      const {shell} = require('electron');
      shell.openExternal(url);
    }
	}
}
</script>

<style scoped="scoped">
.m-t-5{
	margin-top: 5px;
}
.m-l-14{
	margin-left: 14px;
}
.align-center{
	align-items: center;
}
.page{
	/* background: url(../../../static/index/User/bg.png);
	background-repeat: no-repeat;
	background-position:-104px 40px; */
	width: 700px;
	height: 520px;
}
.user-card{
	width: 400px;
	height: 100px;
	background: #24273F;
	box-shadow: 0px 8px 12px 0px rgba(0,0,0,0.05);
	border-radius: 4px 4px 4px 4px;
	opacity: 1;
	border: 1px solid rgba(128,134,187,0.05);
	margin: 0 auto;
	margin-top:26px;
	position: relative;
}
.user-header{
	height: 65px;
	display: flex;
	align-items: center;
}
.user-avatar{
	width: 40px;
	height: 40px;
	border-radius: 50%;
	/* background-color: #1A5EC5; */
	margin-left: 12px;
}
.avatar{
	width: 40px;
	height: 40px;
	border-radius: 50%;
}
.user-infor{
	margin-left: 9px;
	width: 271px;
}
.login-out-btn{
	width: 73px;
	height: 28px;
	background:#FFB800;
	border-radius: 50px 0px 0px 50px;
	opacity: 1;
	font-size: 12px;
	font-family: PingFang SC-Regular, PingFang SC;
	font-weight: 400;
	padding-left: 10px;
	color: #23253C;
	display: flex;
	justify-content: center;
	align-items: center;
	cursor: pointer;
	position: absolute;
	top: 12px;
	right: 0;
}
.title{
	font-size: 12px;
	font-family: PingFang SC-Regular, PingFang SC;
	font-weight: 400;
	color: #7B80B4;
}
.email-name{
	font-size: 14px;
	font-family: PingFang SC-Regular, PingFang SC;
	font-weight: 400;
	color: #FFFFFF;
}
.exit-text{
	font-size: 12px;
	font-family: PingFang SC-Regular, PingFang SC;
	font-weight: 600;
	color: #23253C;
	margin-right: 4px;
	cursor: pointer;
}
.exit-img{
	width: 10.4px;
	height: 10.4px;
	margin-top: -1px;
	cursor: pointer;
}
.line{
	width: 376px;
	height: 1px;
	background-color: #ECEEFF;
	margin: 0 auto;
}
.rember-img{
	width: 22px;
	height: 22px;
	margin-right: 7px;
	margin-top: -2px;
}
.rember-text{
	font-size: 14px;
	font-family: PingFang SC-Regular, PingFang SC;
	font-weight: 400;
	color: #FFFFFF;
}
.rember-name{
	
}
.rember-time{
	margin-left: 20px;
}
.items-bar{
	width: 400px;
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
	justify-content: space-between;
}
.credit-img{
	width: 19px;
	height: 19px;
	margin-left: 15px;
	margin-right: 9px;
}
.items-name{
	font-size: 14px;
	font-family: PingFang SC-Regular, PingFang SC;
	font-weight: 400;
	color: #A8A9B3;
}
.items-sign{
	font-size: 14px;
	font-family: PingFang SC-Regular, PingFang SC;
	font-weight: 400;
	color: #A8A9B3;
}
.price{
	font-size: 16px;
	font-family: Poppins-Bold, Poppins;
	font-weight: bold;
	color: #A8A9B3;
	margin-right:10px;
	margin-left: 5px;
}
.water-img{
	width: 20px;
	height: 20px;
	margin-right: 9px;
	margin-left: 14px;
}
.byte-num{
	font-size: 16px;
	font-family: Poppins-Bold, Poppins;
	font-weight: bold;
	color: #A8A9B3;
	margin-right: 12px;
}
.right-arrow-img{
	width: 16px;
	height: 16px;
	margin-right: 18px;
}
.clipboard-img{
	width: 17px;
	height: 17px;
	margin-left: 16px;
	margin-right: 10px;
}
.question-img{
	height: 18px;
	width: 18px;
	margin-left: 15px;
	margin-right: 12px;
}
</style>
