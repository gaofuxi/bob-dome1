<template>
	<div>
		
		<div class="page">
			<div class='flex align-center m-t-30 h-59'>
			  <img class='left-arrow-img' @click='toBack' src='../../../static/index/Proxy/left-arrow.png' />
			  <div class='header-title' @click='toBack'>创建工单</div>
			</div>
			
			<div class="card">
				<div >
				  <div class="input-title">标题</div>
				  <input class="input-bar" 
				  v-model="title"
				  :placeholder="'請輸入工单主题'"/>
				</div>
				<div  style="margin-top: 20px;">
				  <div class="input-title">内容</div>
				  <textarea class="input-bar-content" 
				 
				  v-model="message"
				  :placeholder="'請輸入工单内容'"/>
				</div>
				<div class="login-btn"
				@click="save()"
				>
					  <span>保存</span>
				</div>
			</div>
		</div>
	</div>	
</template>

<script>
import Collapse from '../components/Collapse.vue'
import {createTicket} from '../commons/api.js'


export default {
  components:{
	  Collapse
  },
  data() {
    return {
		itemsOne:false,
		list:[],
		loading:false,
		isShowTypes:false,
		types: ['Mac使用问题','其他设备使用问题','套餐问题','其他问题'],
		message:'',
		title:'',
		level:'',
		prefix:'',
		context:'',
    };
  },
  created() {
	  
  },
  methods: {  
	toBack(){
		this.$router.go(-1)
	},
	async save(){
		if (this.title === '' || this.message === '') {
		  this.$dialog({
		    title: this.$t('Fail to submit'),
		    message: this.$t('Please fill up the form first'),
		  });
		  return;
		}
		try {
		  await createTicket(this.title === '', this.message);
		  this.$router.go(-1);
		} catch (e) {
		  this.$dialog({
		    title: this.$t('Fail to create ticket'),
		    message: e.message,
		  });
		}
		
	},
  },
  filters: {
  	formatDate: function(value) {
  		if (!value) {
  			return false;
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
  		let h = date.getHours();
  		h = h < 10 ? ('0' + h) : h;
  		let m = date.getMinutes();
  		m = m < 10 ? ('0' + m) : m;
  		let s = date.getSeconds();
  		s = s < 10 ? ('0' + s) : s;
  
  		return y + '-' + MM + '-' + d + ' ' + h + ':' + m + ':' + s;
  	},
  	money(value) {
  		return '￥' + (value / 100).toFixed(2);
  	}
  },
  beforeRouteEnter(to, from, next) {
    next(async (vm) => {
  		
      vm.loading = true
    
    });
  },
  beforeRouteLeave(to, from, next) {
	this.loading = false
    next();
  },
};
</script>

<style scoped="scoped">
input{
	outline: none;
}
textarea{
	outline: none;
}
.align-center{
	align-items: center;
}
.title-bar{
	margin-top: 50px;
	margin-left: 45px;
}

.page{
	
	width: 700px;
	height: 520px;
	position: relative;
}
.flex{
	display: flex;
}
.align-center{
	align-items: center;
}

.card{
	margin-top: 18px;
	margin-left: 146px;
	width: 643px;
	height: 422px;
	overflow: hidden;
	overflow-y: auto;
}
.input-title{
	font-size: 14px;
	font-family: Poppins-Medium, Poppins;
	font-weight: 500;
	color: #CCE3FA;
	line-height: 20px;
	margin-top: 9px;
	margin-bottom: 5px;
}
.input-bar{
	/* background: url(../../../static/kuaiyun/Login/Rectangle.png); */
	background-repeat: no-repeat;
	background-size: cover;
	width: 370px;
	height: 45px;
	background: #171B37;
	border-radius: 4px 4px 4px 4px;
	border: 1px solid #2C2F49;
	color: #FFFFFF;
	opacity: 1;
	padding-left: 19px;
	font-size: 12px;
	
}
.input-bar-content{
	/* background: url(../../../static/kuaiyun/Login/Rectangle.png); */
	background-repeat: no-repeat;
	background-size: 370px 140px;
	width: 370px;
	height: 108px;
	padding-left: 26px;
	font-family: Poppins-Regular, Poppins;
	font-weight: 400;
	color: #FFFFFF;
	border: 1px solid #2C2F49;
	border-radius: 4px 4px 4px 4px;
	background: #171B37;
	padding-top: 15px;
	font-size: 12px;
}
.login-btn{
	width: 370px;
	height: 44px;
	background: #6F74FF;
	border-radius: 4px 4px 4px 4px;
	opacity: 1;
	font-size: 16px;
	font-family: Roboto-Medium, Roboto;
	font-weight: 500;
	color: #FFFFFF;
	line-height: 17px;
	display: flex;
	justify-content: center;
	align-items: center;
	margin-top: 22px;
	
	cursor: pointer;
}
.content-text{
	font-size: 15px;
	font-family: Poppins-Regular, Poppins;
	font-weight: 400;
	color: #FFFFFF;
	margin-top: 20px;
}
.left-arrow-img {
  width: 12px;
  height: 12px;
  margin-left: 45px;
}

.header-title {
  font-size: 18px;
  font-family: PingFang SC-Semibold, PingFang SC;
  font-weight: 600;
  color: #FFFFFF;
  margin-left: 10px;
}
.m-t-30{
	margin-top: 30px;
}
</style>
