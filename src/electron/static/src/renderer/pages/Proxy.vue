<template>
  <div class='page'>
    <Loading v-if='loadingShow' :content="$t('Loading')"></Loading>
    <div class='flex align-center m-t-30 h-59'>
      <img class='left-arrow-img' @click='toBack' src='../../../static/index/Proxy/left-arrow.png' />
      <div class='header-title' @click='toBack'>{{ $t('Line node selection') }}</div>
      <div class='refresh-btn' @click='refreshList()'>
        <img class='refresh-img' src='../../../static/index/Proxy/refresh.png' />
        <div>{{ $t('Update subscription') }}</div>
      </div>
    </div>
    <div class='item-card'>
      <div class='item-header'>
        <div class='header-name header-text'>{{ $t('Service node') }}</div>
        <div class='header-status header-text'>{{ $t('Proxy State') }}</div>
        <div class='header-speed header-text' style='display: flex;justify-content: center;align-items: center;'>
          <span style='margin-right: 10px'>{{ $t('Proxy Delay') }}</span>
        </div>
      </div>
      <div>
        <div v-for='item in list' class='item-content item-header' @click='changeProxy(item)'>
          <div class='header-name header-text flex align-center'>
            <img class='country-img' :src='`../../../static/flags/${item.flag}.png`' />
            <div>{{ item.name }}</div>
          </div>
          <div class='header-status header-text flex align-center justify-center'>
            <!-- <img class="online-img" src="../../../static/index/Proxy/online.png" /> -->
            <div>{{ item.text }}</div>
          </div>
          <div class='colu-box'>
            <div class='colu-bar'
                 v-for='(e,index) in 5'
                 :style="{background:getColor(item.delay,index),
			  height:8+2*index+'px'}"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getProxy } from '../commons/api.js';
import Loading from '../components/Loading.vue';
import { changeProxy, getProxies, requestDelay, testProxy } from '../commons/clashRestful';

const mainGroupName = 'Proxy';
export default {
  components: {
    Loading
  },
  data() {
    return {
      list: [],
      currentProxyName: '',
      intervalID: '',
      loadingShow: false
    };
  },
  created() {
    this.getList();
    // this.intervalID = setInterval(this.getList, 5000);
  },
  beforeRouteEnter(to, from, next) {
    next(async (vm) => {
      vm.getList();
    });
  },
  methods: {
    async getList() {
      let that = this;
      const { proxies } = await getProxies();
      const { [mainGroupName]: mg } = proxies;
      that.currentProxyName = mg.now;
      console.log(proxies);
      this.loadingShow = true;
      let list = await getProxy();
      that.list = list.data;
      that.list.map(item => {
        const core = proxies[item.name] || [];
        const history = core.history || [];
        item.delay = history.length === 0 ? 0 : history[history.length - 1].delay;
        // if (item.text.indexOf('维护') > -1) {
        //   this.$set(item, 'delay', 0);
        // } else {
        //   this.$set(item, 'delay', Math.round(Math.random() * 120 + 30));
        // }
      });
      console.log(that.list)
      that.loadingShow = false;
    },
    toBack() {
      this.$router.go(-1);
    },
    refreshList() {
      this.getList();
      this.$toast({
        message: this.$t('Update Success')
      });
    },
    async changeProxy(item) {
      const success = await changeProxy(mainGroupName, item.name);
      if (success) {
        this.currentProxyName = item.name;
        this.$EventBus.$emit('getFlag', item.flag);
        this.$EventBus.$emit('getProxyName', item.name);
        this.$router.go(-1);
      }
    },
    getColor(e, i) {
      let color = e ?
        (e / 3).toFixed(0) >= 1000 ? (i === 0 ? '#F88282' : '') :
          (e / 3).toFixed(0) >= 500 ? ([0, 1].includes(i) ? '#F88282' : '') :
            (e / 3).toFixed(0) >= 200 ? ([0, 1, 2].includes(i) ? '#F8C563' : '') :
              (e / 3).toFixed(0) >= 100 ? ([0, 1, 2, 3].includes(i) ? '#0CBC8B' : '') :
                (e / 3).toFixed(0) >= 0 ? '#0CBC8B' : ''
        : '';

      return color;
    }
  }
};
</script>

<style scoped='scoped'>
.page {
  background-color: #131626;
  height: 100vh;
  overflow: hidden;
}

.align-center {
  align-items: center;
}

.header {
  width: 700px;
  height: 44px;
  background: #F5F8FF;
  border-radius: 0px 0px 0px 0px;
  opacity: 1;
  -webkit-app-region: drag;
}

.left-arrow-img {
  width: 15px;
  height: 12px;
  margin-left: 45px;
  cursor: pointer;
}

.header-title {
  font-size: 18px;
  font-family: PingFang SC-Semibold, PingFang SC;
  font-weight: 600;
  color: #FFFFFF;
  margin-left: 10px;
}

.refresh-btn {
  width: 100px;
  height: 34px;
  background: #60E1FF;
  box-shadow: 0px 8px 12px 0px rgba(0, 0, 0, 0.05);

  opacity: 1;
  border: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  font-family: PingFang SC-Regular, PingFang SC;
  font-weight: 400;
  color: #131626;
  margin-left: 347px;
}

.refresh-img {
  width: 16px;
  height: 16px;
  margin-right: 4px;
}

.item-card {
  width: 629px;
  /* box-shadow: 0px 4px 10px 4px rgba(231, 233, 255, 0.2); */
  margin-left: 29px;
  height: 342px;
  overflow: hidden;
  overflow-y: auto;

}

.item-header {
  width: 629px;
  height: 38px;
  display: flex;
  align-items: center;
  background-color: #1B1D31;
}

.header-name {
  width: 420px;
  padding-left: 29px;

}

.header-text {
  font-size: 14px;
  font-family: PingFang SC-Regular, PingFang SC;
  font-weight: 400;
  color: #FFFFFF;
}

.header-status {
  width: 120px;
  text-align: center;

}

.header-speed {
  width: 90px;
  text-align: center;
}

.item-content:nth-child(even) {
  background-color: #1B1D31;
}

.item-content:nth-child(odd) {

  background: #131626;
}

.country-img {
  width: 24px;
  height: 24px;
  border-radius: 3px;
  margin-right: 10px;
}

.online-img {
  width: 20.1px;
  height: 14.37px;
  margin-right: 7px;
}

.m-t-30 {
  margin-top: 30px;
}

.h-59 {
  height: 59px;
}

.colu-box {
  display: flex;
  align-items: flex-end;
  margin-left: 23px;
}

.colu-bar {
  width: 3px;
  height: 10px;
  background: rgba(225, 225, 225, 0.3);
  margin-right: 3px;
}
</style>
