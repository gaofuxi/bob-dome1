<template>
	<div>
		<Loading v-if="loadingShow" :content="$t('Loading')"></Loading>
		<div class="page">
			<div class="flex align-center title-bar">
				<img @click="toBack" class="left-arrow-img" src='../../../static/index/Proxy/left-arrow.png' />
				<div class="title-text">我的訂單</div>
			</div>
			<div class="navbar">
				<div class="header-card">
					<div class="items-left font-text">商品名稱</div>
					<div class="items-text font-text justify-center">備註</div>
					<div class="items-price font-text justify-center">金額</div>
					<div class="items-time font-text">操作時間</div>
					<!-- <div class="items-status font-text">狀態</div> -->
				</div>
				<div class="line"></div>
			</div>
			
			<div class="card">
				<div v-for="item in orders" class="flex card-context">
					<div class="items-left font-text">{{item.shop||'暂无'}}</div>
					<div class="items-text font-text justify-center">{{item.renew||'-'}}</div>
					<div class="items-price font-text justify-center">{{item.total}}</div>
					<div class="items-time font-text">{{item.datetime}}</div>
					<!-- <div class="items-status font-text">
						<div class="items-btn">{{item.status}}</div>
					</div> -->
				</div>
			</div>
		</div>
	</div>	
</template>

<script>
import {
  checkoutPaytmen,
  checkPlan,
  getOrders,
  getPlans,
} from '../commons/api';
import Loading from '../components/Loading.vue'
import PageTitle from '../components/PageTitle.vue';
import Load from '../components/Load.vue';
import Slider from '../components/Slider.vue';
import OrderDetail from './Order/OrderDetail.vue';
import OrderPayMethod from './Order/OrderPayMethod.vue';
import { mapActions } from 'vuex';
import { setNowInterval } from '../commons/helper';
export default {
  name: 'OrderPage',
  components: { PageTitle, Load, Slider, OrderDetail, OrderPayMethod,Loading },
  data() {
    return {
      orders: [],
      isLoaded: false,
      pc: null,
      pp: null,
      pc2: null,
      pp2: null,
      checkIntervalId: null,
      payWindow: null,
      isAtBottom: false,
      isPaying: false,
	  list:[
		  {name:'AIR/入門版訂閱（30天）',label:'套餐購買',price:'¥25.00',time:'2023-02-07 10:35:00',status:0},
		  {name:'AIR/入門版訂閱（30天）',label:'套餐購買',price:'¥25.00',time:'2023-02-07 10:35:00',status:0},
		  {name:'AIR/入門版訂閱（30天）',label:'套餐購買',price:'¥25.00',time:'2023-02-07 10:35:00',status:0},
		  {name:'AIR/入門版訂閱（30天）',label:'套餐購買',price:'¥25.00',time:'2023-02-07 10:35:00',status:0},
		  {name:'AIR/入門版訂閱（30天）',label:'套餐購買',price:'¥25.00',time:'2023-02-07 10:35:00',status:0},
		  {name:'AIR/入門版訂閱（30天）',label:'套餐購買',price:'¥25.00',time:'2023-02-07 10:35:00',status:0},
		  {name:'AIR/入門版訂閱（30天）',label:'套餐購買',price:'¥25.00',time:'2023-02-07 10:35:00',status:0},
		  {name:'AIR/入門版訂閱（30天）',label:'套餐購買',price:'¥25.00',time:'2023-02-07 10:35:00',status:0},
		  {name:'AIR/入門版訂閱（30天）',label:'套餐購買',price:'¥25.00',time:'2023-02-07 10:35:00',status:0},
		  {name:'AIR/入門版訂閱（00天）',label:'套餐購買',price:'¥25.00',time:'2023-02-07 10:35:00',status:0}
	  ],
	  loadingShow:false
    };
  },
  watch: {
    orders: {
      deep: true,
      immediate: true,
      handler(os) {
        const unpay = os.find((o) => o.status === 0);
        if (unpay) {
          this.pp = {
            ...unpay,
            statusHint: this.statusHint(unpay.status),
          };
          this.pc = OrderDetail;
        }
      },
    },
    isPaying() {
      if (!this.isPaying) {
        if (this.checkIntervalId) {
          clearInterval(this.checkIntervalId);
          this.checkIntervalId = null;
        }
        if (this.payWindow) {
          this.payWindow.close();
          this.payWindow = null;
        }
      }
    },
  },
  methods: {
    ...mapActions(['refreshClashProfile']),
    statusHint(status) {
      return (
        [
          this.$t('Waiting payment'),
          '',
          this.$t('Has been cancelled'),
          this.$t('Has been completed'),
          this.$t('Has been deducted'),
        ]?.[status] || '未知'
      );
    },
    handleScroll(e) {
      // check is scroll to bottom
      this.isAtBottom =
        e.target.scrollTop + e.target.clientHeight >= e.target.scrollHeight;
    },
    handleOrderClick(order) {
      this.pp = {
        ...order,
        statusHint: this.statusHint(order.status),
      };
      this.pc = OrderDetail;
    },
    handleSelectPayMethod() {
      this.pc2 = OrderPayMethod;
    },
    async handleNext(id) {
      if (this.isPaying) return;
      this.isPaying = true;
      try {
        const tradeID = this.pp.trade_no;
        const url = await checkoutPaytmen(tradeID, id);
        if (/^http/.test(url)) {
          this.payWindow = window.open(
            url,
            '_blank',
            'nodeIntegration=no,width=1200,height=800,autoHideMenuBar=true'
          );
          const iid = setNowInterval(() => {
            if (this.payWindow.closed) {
              clearInterval(iid);
              this.isPaying = false;
            }
          }, 1000);
        }
        if (this.checkIntervalId) {
          return;
        }
        this.checkIntervalId = setNowInterval(async () => {
          const success = await checkPlan(tradeID);
          if (success === 1) {
            this.isPaying = false;

            // refresh profile
            this.refreshClashProfile();

            this.$dialog({
              title: this.$t('Pay success'),
              message: this.$t('Thank you for supporting'),
            });
            this.pc2 = null;
            this.pc = null;
            this.setup();
          }
        }, 2000);
      } catch (e) {
        this.isPaying = false;
        this.$dialog({
          type: 'fail',
          title: e.message,
        });
      }
    },
    async setup() {
		this.loadingShow= true
      const orders = await getOrders();
      this.orders = [...orders];
	  this.loadingShow= false
    },
	toBack(){
		this.$router.go(-1)
	}
  },
  mounted() {
    this.setup().finally(() => {
      this.isLoaded = true;
    });
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.setup().finally(() => {
        vm.isLoaded = true;
      });
    });
  },
  beforeRouteLeave(to, from, next) {
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
      this.checkIntervalId = null;
    }
    this.isPaying = false;
    next();
  },
};
</script>

<style scoped="scoped">

.align-center{
	align-items: center;
}
.title-bar{
	margin-top: 30px;
	margin-left: 45px;
}
.header{
	width: 700px;
	height: 44px;
	background: #F5F8FF;
	border-radius: 0px 0px 0px 0px;
	opacity: 1;
	-webkit-app-region: drag;
}
.page{
	width: 700px;
	height: 520px;
}
.left-arrow-img{
	width: 12.14px;
	height: 12px;
	margin-right: 10px;
}
.title-text{
	font-size: 18px;
	font-family: PingFang SC-Semibold, PingFang SC;
	font-weight: 600;
	color: #FFFFFF;
}
.card{
	width: 610px;
	height: 283px;
	margin: 0 auto;
	/* background-color: #7B80B4; */
	overflow: hidden;
	overflow-y: auto;
}

.navbar{
	width: 610px;
	margin-top: 11px;
	margin: 0 auto;
}
.header-card{
	width: 610px;
	height: 53px;
	display: flex;
	justify-content: center;
}
.items-left{
	width: 186px;
	padding-left: 14px;
}
.items-text{
	width: 67px;

}
.items-price{
	width: 77px;
	

}
.items-time{
	width: 162px;
	padding-left: 26px;

}
.items-status{
	width: 77px;
	/* padding-left: 36px; */
	
}
.items-btn{
	width: 40px;
	height: 20px;
	background: rgba(12,188,139,0.1);
	border-radius: 4px 4px 4px 4px;
	opacity: 1;
	border: 1px solid #0CBC8B;
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 12px;
	font-family: PingFang SC-Regular, PingFang SC;
	font-weight: 400;
	color: #0CBC8B;
	
}
.justify-center{
	justify-content: center;
}
.font-text{
	font-size: 12px;
	font-family: PingFang SC-Medium, PingFang SC;
	font-weight: 500;
	color: #FFFFFF;
	display: flex;
	align-items: center;
}
.line{
	width: 550px;
	height: 1px;
	background-color:#F5F8FF;
	margin: 0 auto;
}
.card-context{
	width: 610px;
	height: 48px;
	display: flex;
	justify-content: center;
}
</style>
