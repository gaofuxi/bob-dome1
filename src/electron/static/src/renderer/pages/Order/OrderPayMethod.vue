<template>
  <div class="text-black">
    <div
      class="text-2xl font-bold h-[70px] border-b-[1px] flex items-center px-4"
    >
      {{ $t('Payment method') }}
    </div>
    <Load
      :loaded="isLoaded"
      class="h-full w-full text-xs p-4 grid grid-cols-2 gap-3"
    >
      <div
        v-for="method in methods"
        :key="method.id"
        class="flex items-center font-bold text-sm border-[#D7D7D8] border-[1px] rounded-lg w-full h-[70px] justify-center gap-2 relative"
        :style="selectedMethodID === method.id ? 'border-color: #509494' : ''"
        @click="selectedMethodID = method.id"
      >
        <img :src="method.icon" alt="" class="w-6 rounded-full" />
        <div>{{ method.name }}</div>
        <div
          v-if="selectedMethodID === method.id"
          class="w-[10px] h-[10px] rounded-full absolute right-2 top-2 bg-main"
        ></div>
      </div>
    </Load>
    <div
      class="bg-main text-white w-fit rounded-full px-4 py-2 absolute bottom-5 left-1/2 transform -translate-x-1/2"
      v-if="selectedMethodID > -1"
      @click="$emit('next', selectedMethodID)"
    >
      {{ $t('Confirm payment') }}
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import Slider from '../../components/Slider.vue';
import { cancelPlan, getPaymentMethods } from '../../commons/api';
import Load from '../../components/Load.vue';

export default {
  name: 'OrderPayMethod',
  props: {},
  components: { Slider, Load },
  data() {
    return {
      isLoaded: false,
      methods: [],
      selectedMethodID: -1,
    };
  },
  methods: {
    async setup() {
      try {
        this.methods = await getPaymentMethods();
      } catch (e) {
        this.$toast({
          message: this.$t('Fail to fetch pay methods'),
          type: 'error',
        });
        this.$emit('close');
      }
    },
  },
  mounted() {
    this.setup().finally(() => {
      this.isLoaded = true;
    });
  },
};
</script>
