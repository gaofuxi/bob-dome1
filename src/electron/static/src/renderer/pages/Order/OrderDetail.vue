<template>
  <div class="text-black px-4">
    <div class="text-2xl font-bold h-[70px] border-b-[1px] flex items-center">
      {{ statusHint }}
    </div>
    <div
      class="h-fit text-xs border-b-[1px] justify-between flex flex-col py-2 gap-2"
    >
      <div class="flex justify-between">
        <div>{{ $t('Product') }}</div>
        <div>
          {{ plan.name }} / {{ periodStr(period) }} /
          {{ plan.transfer_enable }} GB
        </div>
      </div>
      <div class="flex justify-between">
        <div>{{ $t('Product price') }}</div>
        <div>¥ {{ (plan[period] / 100).toFixed(2) }}</div>
      </div>
      <div
        v-if="status !== 2 && surplus_amount > 0"
        class="flex justify-between"
      >
        <div>{{ $t('Deduction amount') }}</div>
        <div>¥ {{ (surplus_amount / 100).toFixed(2) }}</div>
      </div>
      <div
        v-if="status !== 2 && discount_amount > 0"
        class="flex justify-between"
      >
        <div>{{ $t('Discount amount') }}</div>
        <div>¥ {{ (discount_amount / 100).toFixed(2) }}</div>
      </div>
      <div
        v-if="status !== 2 && balance_amount > 0"
        class="flex justify-between"
      >
        <div>{{ $t('Balance payment') }}</div>
        <div>¥ {{ (balance_amount / 100).toFixed(2) }}</div>
      </div>
      <div class="flex justify-between">
        <div>{{ $t('Creation time') }}</div>
        <div>{{ created_at | formatDate }}</div>
      </div>
    </div>
    <div class="py-2 text-xs">
      <div class="flex justify-between">
        <div>{{ $t('Order number') }}</div>
        <div>{{ trade_no }}</div>
      </div>
    </div>
    <div v-if="status === 0" class="text-xs">
      <div class="font-bold flex justify-between text-main">
        <div>{{ $t('Still need to pay') }}</div>
        <div>¥ {{ (total_amount / 100).toFixed(2) }}</div>
      </div>
    </div>
    <div
      v-if="status === 0"
      class="flex justify-between w-full left-0 px-4 text-sm absolute bottom-3"
    >
      <div
        v-if="isCanceling"
        class="bg-secondary rounded-full text-white px-3 py-1"
      >
        {{ $t('Canceling order') }}
      </div>
      <div
        v-else
        class="bg-main rounded-full text-white px-3 py-1"
        @click="handleCancel"
      >
        {{ $t('Cancel order') }}
      </div>
      <div
        v-if="isPaying"
        class="bg-secondary rounded-full text-white px-3 py-1"
      >
        {{ $t('Wait for pay result') }}
      </div>
      <div
        v-else-if="total_amount === 0"
        @click="$emit('pay-with-remain')"
        class="bg-main rounded-full text-white px-3 py-1"
      >
        {{ $t('Balance payment') }}
      </div>
      <div
        v-else
        @click="handleSelectPayMethod"
        class="bg-main rounded-full text-white px-3 py-1"
      >
        {{ $t('Select period') }}
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import Slider from '../../components/Slider.vue';
import { cancelPlan } from '../../commons/api';

export default {
  name: 'OrderDetail',
  props: {
    statusHint: {
      type: String,
      default: '',
    },
    status: {
      type: Number,
      default: 0,
    },
    plan: {
      type: Object,
      default: () => ({}),
    },
    created_at: {
      type: Number,
      default: 0,
    },
    total_amount: {
      type: Number,
      default: 0,
    },
    trade_no: {
      type: String,
      default: '',
    },
    period: {
      type: String,
      default: '',
    },
    surplus_amount: {
      type: Number,
      default: 0,
    },
    balance_amount: {
      type: Number,
      default: 0,
    },
    trade_no: {
      type: String,
      default: '',
    },
    discount_amount: {
      type: Number,
      default: 0,
    },
    isPaying: {
      type: Boolean,
      default: false,
    },
  },
  filters: {
    formatDate(date) {
      return moment(date * 1000).format('YYYY-MM-DD HH:mm:ss');
    },
  },
  data() {
    return {
      isCanceling: false,
    };
  },
  components: { Slider },
  methods: {
    async handleCancel() {
      if (this.isCanceling) return;
      this.isCanceling = true;
      try {
        if (await cancelPlan(this.trade_no)) {
          this.$emit('cancel');
        }
      } catch (e) {
        this.$toast({ message: e.message, type: 'error' });
      }
      this.isCanceling = false;
    },
    handleSelectPayMethod() {
      this.$emit('select-pay-method');
    },
  },
};
</script>
