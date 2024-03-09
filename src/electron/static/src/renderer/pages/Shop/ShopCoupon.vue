<template>
  <div class="text-black">
    <div
      class="text-2xl font-bold h-[70px] border-b-[1px] flex items-center px-4"
    >
      {{ $t('have coupon') }}
    </div>
    <div class="h-fit w-full text-xs p-4 flex flex-col items-center">
      <img :src="img('taocan.png')" alt="" class="w-3/4" />
      <input
        type="text"
        v-model="couponCode"
        :placeholder="$t('Enter coupon')"
        class="text-center w-full border-b-[1px] pb-3 outline-none text-base"
      />
      <div class="text-main text-sm text-center mt-3">
        {{ $t('coupon valid automaticallyapplied order placed') }}
      </div>
    </div>

    <div
      class="flex justify-between w-[calc(100%)] px-4 text-sm absolute bottom-3"
    >
      <div
        class="bg-main text-white w-fit rounded-full px-4 py-2"
        @click="$emit('close')"
      >
        {{ $t('return') }}
      </div>
      <div
        class="bg-main text-white w-fit rounded-full px-4 py-2"
        @click="handleCheckCoupon"
      >
        {{ $t('Create order') }}
      </div>
    </div>
  </div>
</template>

<script>
import { checkCoupon } from '../../commons/api';

export default {
  name: 'ShopCoupon',
  props: {
    plan: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      couponCode: '',
    };
  },
  computed: {
    periods() {
      const keys = [
        'month',
        'quarter',
        'half_year',
        'year',
        'two_year',
        'three_year',
        'onetime',
      ].map((k) => `${k}_price`);
      return keys.reduce((acc, key, index) => {
        if (key in this.plan && this.plan[key]) {
          acc.push({
            key,
            value: this.plan[key],
            label: this.periodStr(key),
          });
        }
        return acc;
      }, []);
    },
  },
  methods: {
    async handleCheckCoupon() {
      if (!this.couponCode) {
        this.$emit('commit', this.couponCode);
        return;
      }
      try {
        if (await checkCoupon(this.plan.id, this.couponCode)) {
          this.$emit('commit', this.couponCode);
        }
      } catch (e) {
        this.$toast({
          type: 'error',
          message: e.message || this.$t('Fail to verify coupon code'),
        });
      }
    },
  },
};
</script>
