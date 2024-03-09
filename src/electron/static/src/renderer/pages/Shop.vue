<template>
  <div class="bg-main text-white">
    <PageTitle :title="$t('Select subscription')" />
    <span class="text-xs text-[#CFE0E0] ml-9">{{
      $t('Choose a perfect subscription plan')
    }}</span>
    <Load
      :loaded="isLoaded"
      class="h-[calc(100%)] mt-[10px] text-black -translate-y-1 pl-4 pr-2 pb-[100px] scrolly"
    >
      <div
        v-for="plan in plans"
        :key="plan.id"
        class="flex flex-col items-center justify-between px-5 bg-white rounded-lg mt-3 py-4"
      >
        <div class="flex items-center justify-between w-full">
          <div class="font-bold text-xl">{{ plan.name }}</div>
          <div
            class="text-sm flex flex-shrink-0 flex-col items-center bg-[#D5E4E4] rounded-lg px-3 py-1"
          >
            <div class="font-bold text-lg">
              ¥ {{ ((plan.month_price || plan.year_price) / 100).toFixed(2) }}
            </div>
            <div class="">
              {{ isMonthly(plan) ? $t('Monthly') : $t('Annual') }}
            </div>
          </div>
        </div>
        <div class="flex flex-col w-full gap-2 mt-3 text-sm">
          <div
            class="flex justify-between w-full"
            v-for="desc in plan.descriptions"
            :key="desc.title"
          >
            <div>{{ desc.title }}</div>
            <div>{{ desc.content }}</div>
          </div>
        </div>
        <div
          class="text-white bg-main rounded-full w-full flex items-center justify-center h-10 text-sm mt-3"
          @click="handleCommitPlan(plan)"
        >
          {{ $t('Subscribe now') }}
        </div>
      </div>
    </Load>
    <Slider
      :pannelComponent="pc"
      :pannelProps="pp"
      @next="handleNext"
      @close="
        pc = null;
        selectedPeriod = '';
      "
    />
    <Slider
      :pannelComponent="pc2"
      :pannelProps="pp2"
      @commit="handleCommit"
      @close="pc2 = null"
    />
  </div>
</template>

<script>
import {
  cancelPlan,
  commitPlan,
  getOrders,
  getPlans,
  getStatus,
  getUserPlan,
} from '../commons/api';
import PageTitle from '../components/PageTitle.vue';
import Load from '../components/Load.vue';
import Slider from '../components/Slider.vue';
import OrderDetail from './Order/OrderDetail.vue';
import ShopPeriod from './Shop/ShopPeriod.vue';
import ShopCoupon from './Shop/ShopCoupon.vue';
import moment from 'moment';
export default {
  name: 'PlanPage',
  components: { PageTitle, Load, Slider, OrderDetail, ShopPeriod, ShopCoupon },
  data() {
    return {
      userPlan: {},
      plans: [],
      selectedPlan: null,
      selectedPeriod: '',
      isLoaded: false,
      pc: null,
      pp: null,
      pc2: null,
      pp2: null,
    };
  },
  computed: {
    expiredDays() {
      if (this.userPlan?.expired_at) {
        const dur = moment.duration(
          moment(this.userPlan?.expired_at * 1000).diff(moment())
        );
        const days = dur.asDays();
        return days <= 0 ? 0 : parseInt(days);
      }
      return 0;
    },
  },
  methods: {
    isMonthly(plan) {
      return plan?.name === 'A套餐';
    },
    async handleCommitPlan(plan) {
      if (!this.userPlan) {
        if (
          await this.$dialog({
            title: this.$t('Notice'),
            message: this.$t('Try again to fetch subscriptions info'),
            confirmText: this.$t('Retry'),
          })
        ) {
          this.setup();
          return;
        }
      }
      if (
        this.expiredDays > 0 &&
        !this.isMonthly(this.userPlan?.plan) &&
        this.isMonthly(plan)
      ) {
        await this.$dialog({
          title: this.$t('Notice'),
          message: this.$t(
            'Annual fee plans do not apply to monthly fee plans'
          ),
          confirmText: this.$t('Sure'),
        });
        return;
      }
      if (
        this.expiredDays > 0 &&
        this.userPlan?.plan_id > 0 &&
        this.userPlan?.plan_id !== plan.id
      ) {
        if (
          !(await this.$dialog({
            title: this.$t('Changes prompt'),
            message: this.$t(
              'Note that changing causes current subscription overwritten new subscription'
            ),
          }))
        ) {
          return;
        }
      }
      this.selectedPlan = plan;
      this.pc = ShopPeriod;
      this.pp = {
        plan,
        userPlan: this.userPlan,
      };
    },
    async handleCommit(coupon) {
      try {
        const orderID = await commitPlan({
          priceKey: this.selectedPeriod,
          id: this.selectedPlan.id,
          coupon,
        });
        this.$router.replace({ path: '/order', query: { orderID } });
        this.pc2 = null;
        this.pc = null;
      } catch (e) {
        console.error(e);
        this.$toast({
          type: 'error',
          message: e.message || 'Error',
        });
      }
    },
    handleNext(period) {
      this.selectedPeriod = period;
      this.pc2 = ShopCoupon;
    },
    async setup() {
      const [pp, upp, op] = await Promise.allSettled([
        getPlans(),
        getUserPlan(),
        getOrders(),
      ]);
      if (op.status === 'fulfilled') {
        const unpayOrder = op.value.find((o) => o.status === 0);
        if (unpayOrder) {
          if (
            await this.$dialog({
              title: this.$t('Notice'),
              message: this.$t(
                'You still have unpaid orders Do you want to continue paying'
              ),
              confirmText: this.$t('Go to order detail'),
              cancelText: this.$t('Cancel order'),
            })
          ) {
            this.$router.replace({
              path: '/order',
            });
            return;
          } else {
            try {
              await cancelPlan(unpayOrder.trade_no);
              this.$toast({
                message: this.$t('Order has been canceled'),
              });
            } catch (e) {
              this.$toast({
                message: e,
                type: 'error',
              });
            }
          }
        }
      }
      if (pp.status === 'fulfilled') {
        this.plans = pp.value.map((plan) => {
          return {
            ...plan,
            descriptions: this.parseContent(plan.content),
          };
        });
      }
      if (upp.status === 'fulfilled') {
        this.userPlan = upp.value;
      }
    },
    parseContent(html) {
      const res = html.match(/<li>.+?<\/li>/g);
      const items = res.slice(1, 4).map((item) => {
        const el = document.createElement('div');
        el.innerHTML = item;
        return el.innerText;
      });
      return [
        {
          title: this.$t('Traffic'),
          content: items[0],
        },
        {
          title: this.$t('Reset Type'),
          content: items[1],
        },
        {
          title: this.$t('Device Num'),
          content: items[2],
        },
      ];
    },
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
};
</script>
