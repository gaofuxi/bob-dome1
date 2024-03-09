<template>
  <div class='page'>
    <div>
      <div class='header-tab'>
        <div class='tab-items' v-for='(item,index) in tab' :key='index'
             :class="currentIndex===index?'active':''"
             @click='getTab(item,index)'>{{ item }}
        </div>

      </div>
      <div class='buy-card'>
        <swiper :options='swiperOption' ref='mySwiper' style='width: 420px;'>
          <swiper-slide v-for='(item2,index2) in tab' :key='index2'
            style='display: flex;justify-content: space-between;'>
            <div class='buy-items' v-for='(item,index) in plan[tab[index2]]'
                 :class="selectPlan===item?'active':''"
                 @click.stop='getPlan(item,index)'>
              <div class='buy-name'>{{ item.name }}</div>
              <div class='buy-price'><span style='font-size: 11px;margin-right: 3px;'>¥</span>{{ item.price }}</div>
              <div class='buy-trans'>{{ item.transfer_enable }}</div>
            </div>
          </swiper-slide>

        </swiper>
      </div>
      <div class='mode-card'>
        <div class='mode-items'
             v-if='payment.alipay'
             :class="selectPay==='alipay'?'active':''"
             @click="selectPay='alipay'"
        >
          <i class='ri-alipay-fill pay-img'
             :style="{color:selectPay==='alipay'?'#00a1e9':''}"
          ></i>
          {{ $t('Alipay') }}
        </div>
        <div class='mode-items'
             v-if='payment.wechat'
             :class="selectPay==='wechat'?'active':''"
             @click="selectPay='wechat'"
        >
          <i class='ri-wechat-fill pay-img'
             :style="{color:selectPay==='wechat'?'#53c22b':''}"
          ></i>
          {{ $t('WeChat') }}
        </div>
        <div class='mode-items'
             :class="selectPay==='wallet'?'active':''"
             @click="selectPay='wallet'"

        >
          <i class='ri-wallet-2-fill pay-img'
             :style="{color:selectPay==='wallet'?'#029edc':''}"

          ></i>
          {{ $t('Balance payment') }}
        </div>
      </div>
      <div class='coupon-card'>
        <div class='coupon-title'>{{ $t('Coupon') }}</div>
        <input class='coupon-input' :placeholder="$t('Enter coupon')" v-model='couponValue' />
        <div class='cou-btn' @click='toCoupon'>{{ $t('Use') }}</div>
      </div>
      <div class='pay-card'>
        <div style='display: flex;align-items: center;'>
          <div class='pay-title'>{{ $t('Product price') }}：</div>
          <div class='pay-price'>¥{{ totalPrice }}</div>
        </div>
        <div class='pay-btn' @click='submit'>{{ $t('Confirm payment') }}</div>
      </div>
    </div>
    <div class='right-card'>
      <div class='right-header'>{{ tab[currentIndex] }}特权</div>
      <div class='right-items' v-for='(item,index) in desc[currentIndex]' :key='index'>
        <i v-if='index==0' class='ri-broadcast-fill ic-large'></i>
        <i v-if='index==1' class='ri-hd-line ic-large'></i>
        <i v-if='index==2' class='ri-chat-smile-2-line ic-large'></i>
        <i v-if='index==3' class='ri-device-line ic-large'></i>
        <div style='margin-top: 8px;'>{{ item }}</div>
      </div>
      <div class='right-footer'></div>
    </div>
	<Dialog
	    v-if="dialogShow"
	    :confirmText="$t('Pay success')"
	    :content="$t('正在支付中')+'...'"
	    @confirm="confirmBtn(1)"
	    @cancel="confirmBtn(0)"
			  
	></Dialog>
  </div>
</template>

<script>
import { getShop, getCoupon, getPurchase, getWallet,checkPlan } from '../commons/api.js';
import 'swiper/dist/css/swiper.css';
import { swiper, swiperSlide } from 'vue-awesome-swiper';
import Dialog from '../components/Dialog.vue'

export default {
  components: {
    swiper, swiperSlide, Dialog
  },
  data() {
    return {
      tab: [],
      plan: [],
      currentIndex: 0,
      currentPriceItem: 0,
      desc: [],
      payment: {},
      selectPay: '',
      selectPlan: {},
      couponValue: '',
      swiperOption: {
        loop: false, //是否循环播放
        speed: 1000, // 发生页面切换动画时，动画的切换速度
        autoplay: false,
        observeParents: true,
        // shortSwipes: false,
        // longSwipesRatio: 0//长滑动距离比
      },
      timer: null,
      form: {
        price: '',
        cycle: '',
        shopcoupon: '',
        shopid: '',
        type: '',
      },
	  totalPrice:0,
	  dialogShow:false,
    };
  },
  mounted() {
    this.getInfo();
  },
  beforeRouteEnter(to, from, next) {
    next(async (vm) => {
      vm.timer = setInterval(() => {
        vm.currentIndex = vm.swiper.activeIndex;
      }, 1000);
    });
  },
  beforeRouteLeave(to, from, next) {
    clearInterval(this.timer);
    next();
  },
  computed: {
    swiper() {
      return this.$refs.mySwiper.swiper;
    }
  },
  methods: {
    async getInfo() {
      const list = await getShop();
      this.plan = list.shops.data;
      this.desc = list.shops.desc;
      this.tab = list.shops.keys;
      this.selectPlan = this.plan[this.tab[this.currentIndex]][0];
	  this.totalPrice = this.selectPlan.price
      let config = localStorage.getItem('config');
      if (config) {
        config = JSON.parse(config);
      }
      this.payment = config.payment;
      this.selectPay = this.payment.alipay === config.payment.default ? 'alipay' :
        this.payment.wechat === config.payment.default ? 'wechat' : '';
    },
    async toCoupon() {
      if (!this.couponValue) {
        this.$toast({
          message: '请输入优惠码'
        });
        return;
      }
      let result = await getCoupon(this.couponValue, this.selectPlan.id);
	  
      if (result.msg) {
        this.$toast({
          message: result.msg
        });
		return
      }
	  this.$toast({
	    message: '使用成功'
	  });
	  this.totalPrice = result.data.total
    },
    getPlan(item, index) {
      this.selectPlan = item;
	  this.couponValue = ''
	  this.totalPrice = item.price
    },
    getTab(item, index) {
      this.swiper.slideTo(index, 1000, false);
      this.currentIndex = index;
    },
    async submit() {
		if(this.selectPay ==='wallet'){
			const res = await getWallet(this.selectPlan.id, this.couponValue);
			if(res.msg){
				this.$toast({
				  message: res.msg
				});
				return
			}
		  this.$toast({
			  message: '支付成功',
		  });
		  this.$router.push({path:'/'})
		}else{
			const result = await getPurchase(this.totalPrice, this.selectPlan.id, this.couponValue, this.selectPay);
			console.log(result);
			if (result.msg) {
			  this.$toast({
			    message: result.msg
			  });
				return
			}
			if(result.url){
				 this.dialogShow = true;
				 window.open(result.url);  
			}
		}
    },
	async confirmBtn(e) {
	  this.dialogShow = false;
	  if (e == 0) {

	  } else {
	    this.$EventBus.$emit("refreshMain", true);
	    this.$router.push('/');
	  }
	}
  }
};
</script>

<style scoped='scoped' lang='scss'>
input {
  outline: none;
}

.page {
  display: flex;
  width: 700px;
  height: 520px;
}

.header-tab {
  width: 415px;

  height: 40px;
  margin-left: 56px;
  border: 1px solid #2C2F49;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;

}

.tab-items {
  width: 33%;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  color: #FFFFFF;
  font-size: 14px;
  cursor: pointer;
  position: relative;

  &.active {
    background-color: #2C2F49;
    position: relative;

    &::before {
      position: absolute;
      bottom: -16px;
      left: 45%;
      content: '';
      width: 0px;

      border: 8px solid transparent;
      border-top: 8px solid #60E1FF;
      z-index: 1;


    }
  }

}

.buy-card {
  display: flex;
  margin-left: 56px;
  margin-top: 30px;
  justify-content: space-between;
  width: 415px;
}

.buy-items {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 95px;
  height: 106px;
  border: 1px solid #2C2F49;
  cursor: pointer;
  position: relative;

  &.active {
    border: 1px solid #60E1FF;

    &::before {
      position: absolute;
      top: -10px;

      left: -10px;
      content: '';
      width: 0px;

      border: 10px solid transparent;
      border-bottom: 10px solid #60E1FF;
      transform: rotate(-45deg);
      z-index: 1;
    }
  }

  .buy-name {
    font-size: 14px;
    color: #FFFFFF;
    cursor: pointer;
  }

  .buy-price {
    font-size: 18px;
    color: #60E1FF;
    margin-top: 8px;
    margin-bottom: 8px;
    cursor: pointer;
  }

  .buy-trans {
    font-size: 12px;
    color: #adadad;
    cursor: pointer;
  }
}

.mode-card {
  display: flex;
  /* justify-content: space-between; */
  margin-left: 56px;
  margin-top: 30px;

  .mode-items {
    border: 1px solid #2C2F49;
    width: 132px;
    height: 40px;
    font-size: 14px;
    color: #FFFFFF;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    cursor: pointer;
	margin-right: 10px;
    &.active {
      border: 1px solid #60E1FF;

      &::before {
        position: absolute;
        top: -10px;

        left: -10px;
        content: '';
        width: 0px;

        border: 10px solid transparent;
        border-bottom: 10px solid #60E1FF;
        transform: rotate(-45deg);
        z-index: 1;
      }
    }
  }
}

.coupon-card {
  display: flex;
  align-items: center;
  margin-left: 56px;
  margin-top: 30px;

  .coupon-title {
    font-size: 14px;
    color: #FFFFFF;
  }

  .coupon-input {
    width: 240px;
    height: 32px;
    border-radius: 50px;
    background-color: transparent;
    border: 1px solid #2C2F49;
    font-size: 14px;
    color: #FFFFFF;
    padding-left: 20px;
    margin-left: 10px;
    margin-right: 10px;
  }

  .cou-btn {
    width: 52px;
    height: 22px;
    background-color: #60E1FF;
    border-radius: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
	cursor: pointer;
  }
}

.pay-card {
  width: 420px;
  height: 50px;
  background-color: #2C2F49;
  margin-left: 56px;
  margin-top: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .pay-title {
    color: #FFFFFF;
    font-size: 16px;
    margin-left: 18px;
  }

  .pay-price {
    color: #FFB800;
    font-size: 16px;
    margin-left: 8px;
  }
}

.pay-btn {
  width: 80px;
  height: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #60E1FF;
  border-radius: 2px;
  margin-right: 22px;
  font-size: 14px;
  cursor: pointer;
}

.right-card {
  width: 140px;
  height: 388px;
  border: 1px solid #2C2F49;
  margin-top: 20px;
  margin-left: 33px;

  .right-header {
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #FFFFFF;
    font-size: 14px;
    border-bottom: 1px solid #2C2F49;
    margin-bottom: 20px;
  }

  .right-items {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #adadad;
    font-size: 14px;
    margin-bottom: 14px;
  }

  .right-footer {
    width: 100%;
    height: 26px;
    background-color: #2C2F49;
    margin-top: 33px;
  }
}

.pay-img {
  font-size: 23px;
  margin-right: 10px;
}


</style>
