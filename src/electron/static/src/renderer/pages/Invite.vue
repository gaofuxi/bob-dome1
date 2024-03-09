<template>
	<div>
		<Loading v-if="loadingShow" :content="$t('Loading')"></Loading>
		<div class="page" style="display: flex;">
			<div>
				<div class="header-card">
					<img class="invite-img" src='../../../static/index/Invite/gift.png' />
          <p class="invite-title"  v-html="this.info.invite_gift"></p>
					<div class="invite-btn" @click="modalShow = true">{{ $t('Recommend to a friend') }}</div>
				</div>
				<div class="footer-card">
					<div class="items">
						<div class="flex items-num">
							<div class="man-num" >{{info.user_num||0}}</div>
							<div class="man">{{ $t('Peoples') }}</div>
						</div>
						<div class="items-bottom-text">{{ $t('Successful recommendation') }}</div>
					</div>
					<div class="items">
						<div class="flex items-num">
							<div class="man" style="margin-right: 4px;">¥</div>
							<div class="man-num">{{info.back_sum||0}}</div>
							<div class="man" style="margin-right: 6px;">{{ $t('Yuan') }}</div>
						</div>
						<div class="items-bottom-text">{{ $t('Current commission') }}</div>
					</div>
				</div>
			</div>
			<div class="right-card">
				<div class="right-title">{{ $t('Rebate record') }}（{{ $t('Only show the last 10') }}）</div>
				<div class="right-line"></div>
				<div class="content" v-if="info&&info.list&&info.list.length==0">
					<div class="right-nodata-text" >{{ $t('No reward') }}</div>
				</div>
				<div v-else>
					<div class="table-text">
						<div>{{ $t('Amount') }}</div>
						<div>{{ $t('Creation time') }}</div>
					</div>
					<div v-for="(item,index) in info.list" :key="info.list.id" class="table-text">
						<div>¥{{item.total}}</div>
						<div>{{item.datetime|formatDate}}</div>
					</div>
				</div>
			</div>
		</div>
		<div class="modal-card" v-if="modalShow==true">
			<div>{{ $t('My Invite') }}</div>
			<textarea class="modal-text" v-model="textValue"></textarea>
			<div class="model-btn" v-clipboard:copy="invite_url"
					v-clipboard:success="copyInviteUrl">{{ $t('One-click copy') }}</div>
		</div>
	</div>	
</template>

<script>
import Collapse from '../components/Collapse.vue'
import Loading from '../components/Loading.vue'
import {getInviteDetail} from '../commons/api.js'

export default {
  components:{
	  Collapse,Loading
  },
  data() {
    return {
		info:{},
		invite_url:'',
		textValue:'(复制整段文字到浏览器打开即可访问)，找梯子最重要的就是稳定，这个已经上线三年了，一直稳定没有被封过，赶紧下载备用吧！',
		modalShow:false,
		loadingShow:false,
    };
  },
  mounted() {
		this.getDetail()
  },
  methods: {  
	toBack(){
		this.$router.go(-1)
	},
	async getDetail(){
		this.loadingShow = true
		this.info = await getInviteDetail()
		this.invite_url = this.info.invite_url
		this.textValue = this.invite_url + this.textValue
		this.loadingShow = false
	},
	copyInviteUrl(){
		this.$toast({
		  message: '复制成功',
		  type: 'success',
		});
		this.modalShow = false
	}
  },
  filters: {
		formatDate(value) {
		  if (! value){
			return "暂无数据";
		  }
		  if (value.toString().length === 10) {
			value = value * 1000;
		  }
		  let date = new Date(value);
		  let y = date.getFullYear();
		  let MM = date.getMonth() + 1;
		  MM = MM < 10 ? ('0' + MM) : MM;
		  let d = date.getDate();
		  d = d < 10 ? ('0' + d) : d;
	  
		  return y + '-' + MM + '-' + d;
		},
	}
};
</script>

<style scoped="scoped">
.page{
	/* background: url(../../../static/index/User/bg.png);
	background-repeat: no-repeat;
	background-position:-104px 40px; */
	width: 700px;
	height: 520px;
	display: flex;
	justify-content: center;
}
.header-card{
	width: 320px;
	height: 273px;
	background-color: #2C2E44;
	box-shadow: 0px 8px 12px 0px rgba(0,0,0,0.05);
	border-radius: 4px 4px 4px 4px;
	opacity: 1;
	border: 1px solid rgba(128,134,187,0.05);
	margin: 0 auto;
	margin-top: 26px;
}
.invite-img{
	width: 70px;
	height: 70px;
	margin: 0 auto;
	margin-top: 26px;
}
.invite-title{
	width: 273px;
	font-size: 14px;
	font-family: PingFang SC-Regular, PingFang SC;
	font-weight: 400;
	color: #FFFFFF;
	margin: 0 auto;
	margin-top: 39px;
}
.invite-title-two{
	width: 191px;
	font-size: 12px;
	font-family: PingFang SC-Regular, PingFang SC;
	font-weight: 400;
	color: #FFFFFF;
	margin: 0 auto;
	margin-top: 2px;
}
.invite-btn{
	width: 98px;
	height: 32px;
	background: #6F74FF;
	border-radius: 50px;
	opacity: 1;
	font-size: 12px;
	font-family: PingFang SC-Regular, PingFang SC;
	font-weight: 400;
	color: #FFFFFF;
	display: flex;
	justify-content: center;
	align-items: center;
	margin: 0 auto;
	margin-top: 12px;
	cursor: pointer;
}
.footer-card{
	display: flex;
	width: 320px;
	height: 120px;
	margin: 0 auto;
	margin-top: 13px;
	justify-content: space-between;
}
.items{
	width: 155px;
	height: 106px;
	background-color: #2C2E44;
	box-shadow: 0px 8px 12px 0px rgba(0,0,0,0.05);
	border-radius: 4px 4px 4px 4px;
	opacity: 1;
	border: 1px solid rgba(128,134,187,0.05);
}
.items-num{
	justify-content: center;
	margin-top: 28px;
}
.man-num{
	height: 20px;
	font-size: 24px;
	font-family: Poppins-Bold, Poppins;
	font-weight: bold;
	color: #6F74FF;
	line-height: 20px;
}
.man{
	height: 20px;
	font-size: 14px;
	font-family: PingFang SC-Regular, PingFang SC;
	font-weight: 400;
	color: #6F74FF;
	margin-left: 3px;
}
.right-card{
	background: #2C2E44;
	width:300px;
	height: 393px;
	margin-top: 26px;
	margin-left: 15px;
}
.items-bottom-text{
	color: #FFFFFF;
	font-size: 14px;
	text-align: center;
	margin-top: 15px;
}
.right-title{
	color: #FFFFFF;
	font-size: 12px;
	margin-top: 30px;
	margin-left: 10px;
}
.right-line{
	width:280px;
	background-color: #FFFFFF;
	height: 1px;
	margin-left: 10px;
	margin-top: 10px;
}
.right-nodata-text{
	color: #FFFFFF;
	font-size: 12px;
}
.content{
	display: flex;
	justify-content: center;
	align-items: center;
	height: 300px;
}
.modal-card{
	position: absolute;
	top:30%;
	left: 30%;
	width: 380px;
	height: 220px;
	border-radius: 5px;
	background-color: #FFFFFF;
	text-align: center;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding-top: 10px;
}
.modal-text{
	border: 1px solid #adadad;
	width: 320px;
	height: 100px;
	margin-top: 20px;
	font-size: 14px;
	/* padding: 10px; */
	padding-left: 10px;
	padding-bottom: 0px;
	overflow:scroll;
}
.model-btn{
	background: #6F74FF;
	width: 200px;
	height: 40px;
	color: #FFFFFF;
	font-size: 12px;
	display: flex;
	margin-top: 12px;
	justify-content: center;
	align-items: center;
	cursor: pointer;
}

.table-text{
	display: flex;
	width: 100%;
	justify-content: space-between;
	color: #FFFFFF;
	font-size: 14px;
	height: 30px;
	align-items: center;
	padding-left: 10px;
	padding-right: 10px;
}
</style>
