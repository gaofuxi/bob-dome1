<template>
  <div v-if="isShowLoading" class="loading-container">
		<div class="pay-card">
			<img @click="toClose()" class="close-img" src='../../../static/index/Home/close-blue.png' />
			<!-- <img class="logo" src="../../../static/kuaiyun/Sub/logo.png"/> -->
			<div class="title">{{title}}</div>
			
			<div class="flex" style="margin-top: 10px;padding: 20px;">
				<div v-html="content" style="height: 80px;overflow-y: auto;"></div>
			</div>
		</div>
  </div>
</template>

<script>

export default {
  data () {
    return {
      isShowLoading: true,
	  timer:null,
    }
  },
  props:{
	  id:{
		  type:String,
		  default:''
	  },
	  title:{
		  type:String,
		  default:''
	  },
	  content:{
		  type:String,
		  default:''
	  }
  },
  created() {
  },
  methods:{
	  toClose(){
		  this.$emit('toClose',false)
	  },
	  async toCancel(){
		  console.log(this.id)
		  let list = await cancelPlan(this.id)
		  console.log(list)
		  if(list){
			  this.$toast({
			    message:'取消成功',
			  });
			  this.$emit('toClose',true)
		  }
	  },
	  async toPay(){
		  this.$router.push({path:'/subDetail',query:{trade_no:this.id}})
	  }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 100px;
  width: 700px;
  height: 100%;

  background: rgba(0, 0, 0, 0.5);
  z-index: 99;
}
.loading-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 130px;
  height: 130px;
  border-radius: 10px;
  background: #FFFFFF;
}
.loading-img {
  width: 50px;
  height: 50px;
  margin-bottom: 10px;
  animation: rotating 2s linear infinite;
}
@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(1turn);
  }
}
.loading-txt {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  color: #FFFFFF;
}
.flex{
	display: flex;
}
.pay-card{
	width: 400px;
	height: 164px;
	display: flex;
	flex-direction: column;
	align-items: center;
	background: #FFFFFF;
	border-radius: 10px;
	opacity: 1;
	position: relative;
	box-shadow: 0px 4px 8px -2px rgba(0,0,0,0.03), 0px 8px 12px -2px rgba(0,0,0,0.06);
}
.close-img{
	position: absolute;
	top:24px;
	right: 28px;
	width: 20px;
	height: 20px;
	cursor: pointer;
	
}
.cancel-btn{
	width: 104px;
	height: 34px;
	background: linear-gradient(90deg, rgba(127,227,177,0) 40%, #7FE3B1 20%, rgba(127,227,177,0) 40%);
	box-shadow: 0px 8px 12px 0px rgba(0,0,0,0.05);
	border-radius: 0px 0px 0px 0px;
	opacity: 1;
	border: 1px solid;
	border-image: linear-gradient(90deg, rgba(7, 63, 94, 0), rgba(0, 162, 248, 1), rgba(0, 0, 0, 0)) 1 1;
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 14px;
	font-family: PingFang SC-Regular, PingFang SC;
	font-weight: 400;
	color: rgba(0, 162, 248, 1);
	cursor: pointer;
}
.pay-btn{
	width: 104px;
	height: 34px;
	background: linear-gradient(90deg, rgba(127,227,177,0) 40%, #7FE3B1 20%, rgba(127,227,177,0) 40%);
	box-shadow: 0px 8px 12px 0px rgba(0,0,0,0.05);
	border-radius: 0px 0px 0px 0px;
	opacity: 1;
	border: 1px solid;
	border-image: linear-gradient(90deg, rgba(127, 227, 177, 0), rgba(127, 227, 177, 1), rgba(127, 227, 177, 0)) 1 1;
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 14px;
	font-family: PingFang SC-Regular, PingFang SC;
	font-weight: 400;
	color: #88F3BE;
	cursor: pointer;
}
.logo{
	width: 98px;
	height: 68px;
	margin-top: 44px;
}
.title{
	font-size: 16px;
	font-family: Poppins-SemiBold, Poppins;
	font-weight: 600;
	margin-left: -260px;
	line-height: 20px;
	margin-top: 24px;
}
.line{
	width: 100%;
	height: 0px;
	opacity: 1;
	margin-top: 30px;
	border: 1px solid #EBEBEB;
}
</style>