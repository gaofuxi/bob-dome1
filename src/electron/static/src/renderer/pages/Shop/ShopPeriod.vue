<template>
  <div class="text-black">
    <div
      class="text-2xl font-bold h-[70px] border-b-[1px] flex items-center px-4"
    >
      {{ $t('Select Period') }}
    </div>
    <div class="h-fit w-full text-xs p-4 grid grid-cols-3 gap-3">
      <div
        v-for="period in periods"
        :key="period.key"
        class="flex items-center flex-col font-bold text-sm border-[#D7D7D8] border-[1px] rounded-lg w-full h-[70px] justify-center gap-2 relative"
        :style="period.key === selectedPeriod ? 'border-color: #509494' : ''"
        @click="selectedPeriod = period.key"
      >
        <div>{{ period.label }}</div>
        <div>¥ {{ (period.value / 100).toFixed(2) }}</div>
        <div
          v-if="period.key === selectedPeriod"
          class="w-[10px] h-[10px] rounded-full absolute right-2 top-2 bg-main"
        ></div>
        <div
          class="absolute top-0 left-0 text-[10px] text-white bg-red-600 px-5 -translate-x-[18px] translate-y-[2px] -rotate-45"
        >
          {{ period.discount }}
        </div>
      </div>
    </div>
    <div
      class="bg-main text-white w-fit rounded-full px-4 py-2 absolute bottom-5 left-1/2 transform -translate-x-1/2"
      v-if="selectedPeriod"
      @click="$emit('next', selectedPeriod)"
    >
      {{ $t('Next step') }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'ShopPeriod',
  props: {
    plan: {
      type: Object,
      default: () => ({}),
    },
    userPlan: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      selectedPeriod: '',
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
      const yearTimes = {
        two_year_price: 2,
        three_year_price: 3,
      };
      const oneYearPrice = this.plan['year_price'];
      const resetPrice = this.plan['reset_price'];
      const periods = keys.reduce((acc, key, index) => {
        if (key in this.plan && this.plan[key]) {
          acc.push({
            key,
            value: this.plan[key],
            label: this.periodStr(key),
            discount:
              oneYearPrice &&
              ['two_year_price', 'three_year_price'].includes(key)
                ? this.$t('Discount number', {
                    number: (
                      (this.plan[key] / (oneYearPrice * yearTimes[key])) *
                      100
                    ).toFixed(0),
                  })
                : '',
          });
        }
        return acc;
      }, []);

      const trafficUsage =
        (this.userPlan?.d + this.userPlan?.u) / this.userPlan?.transfer_enable;
      if (
        this.userPlan?.plan?.id === this.plan.id &&
        resetPrice > 0 &&
        trafficUsage > 0.85
      ) {
        const resetPeriod = {
          key: 'reset_price',
          value: resetPrice,
          label: this.periodStr('reset_price'),
          discount: '',
        };

        return [...periods, resetPeriod];
      }

      return [...periods];
    },
  },
  watch: {
    periods: {
      immediate: true,
      handler(ps) {
        if (ps.length === 1) {
          this.selectedPeriod = ps[0].key;
        }
      },
    },
  },
};
</script>
