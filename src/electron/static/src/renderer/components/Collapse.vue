<template>
	<div>
		<div  class="item-card" @click="toDetail">
			<div class="items">
				<div class="items-name">{{title}}</div>
				<img :class="[isLoading?(expend?'arrow-img-down':'arrow-img-up'):'']" class="arrow-img" src='../../../static/index/User/right-arrow.png' />
			</div>
			<div class="line"></div>
			<div class="context"  
			:style="{maxHeight:expend?`${Number(lineNum)*20+28}px`:'0px',
			transition:`max-height 0.2s linear`}"

			>
				<div class="text" v-html="content"></div>
			</div>
		</div>
	</div>
</template>

<script>
export default{
	data(){
		return{
			expend:false,
			isLoading:false
		}
	},
	props:{
		title:{
			type:String,
			default:'',
		},
		content:{
			type:String,
			default:''
		},
		lineNum:{
			type:Number,
			default:0
		}
	},
	methods:{
		toDetail(){
			this.isLoading = true
			this.expend = !this.expend
		}
	}
}
</script>

<style scoped="scoped">
.line{
	width: 550px;
	height: 1px;
	background-color:#F5F8FF;
	margin: 0 auto;
}
.items{
	width: 610px;
	height: 48px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin: 0 auto;
}
.items-name{
	font-size: 12px;
	font-family: PingFang SC-Medium, PingFang SC;
	font-weight: 500;
	color: #324766;
	margin-left: 37px;
}
.arrow-img{
	width: 16px;
	height: 16px;
	margin-right: 34px;
}
.arrow-img-down{
	animation: rotate 0.2s linear;
	transform:rotate(90deg);
}
@keyframes rotate {
    0%{transform:rotate(0deg);}
    50%{transform:rotate(45deg);}
    100%{transform:rotate(90deg);}
}

.arrow-img-up{
	animation: rotateDown 0.2s linear;
	transform:rotate(0deg);
}
@keyframes rotateDown{
	0%{transform:rotate(90deg);}
	50%{transform:rotate(45deg);}
	100%{transform:rotate(0deg);}
}
.text{
	margin-top: 14px;
	margin-bottom: 14px;
}
.context{
	/* margin-top: 14px;
	margin-bottom: 14px;
	margin-left: 37px; */
	/* padding-top: 14px;
	padding-bottom: 14px; */
	margin-left: 37px;
	font-size: 12px;
	font-family: PingFang SC-Regular, PingFang SC;
	font-weight: 400;
	color: #324766;
	max-height: 0px;
	overflow: hidden;
	/* transition: max-height .2s linear; */
	/* animation: expend 2.5 linear; */
}
@keyframes expend{
	0%{transform:translateY(0);}
	50%{transform:translateY(30px);}
	100%{transform:translateY(50px);}
}


/* .context::active {
    max-height: 666px;    
} */

</style>
