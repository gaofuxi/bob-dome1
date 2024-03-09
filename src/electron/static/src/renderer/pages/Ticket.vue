<template>
  <div class="bg-main text-white">
    <PageTitle :title="$t('My question')" />
    <div
      class="text-3xl absolute right-5 top-[40px]"
      @click="$router.push('/ticket-create')"
    >
      +
    </div>
    <div class="h-3 bg-black bg-opacity-20 mx-3 rounded-full mt-3"></div>
    <Load
      :loaded="isLoaded"
      class="h-fit pb-5 max-h-[calc(100%-33px)] rounded-b-lg bg-white text-black -translate-y-1 mx-5 scrolly min-h-[60px]"
    >
      <div
        v-for="ticket in tickets"
        :key="ticket.id"
        @click="
          $router.push({ path: '/ticket-chat', query: { id: ticket.id } })
        "
        class="flex items-center justify-between h-[45px] pr-5 pl-2 border-b border-border relative"
      >
        <pinging-dot
          v-if="ticket.status === 0"
          class="absolute top-[18px] left-2"
        />
        <div class="text-sm ml-4 flex-grow text-ellipsis">
          {{ ticket.subject }}
        </div>
        <div class="flex flex-shrink-0 text-sm text-secondary items-center">
          {{ statusHint(ticket) }}
        </div>
        <img
          class="w-4 flex-shrink-0 rotate-180 ml-1 h-4"
          :src="img('fanhui.png')"
          alt=""
        />
      </div>
    </Load>
  </div>
</template>

<script>
import {
  checkoutPaytmen,
  checkPlan,
  getOrders,
  getPlans,
  getStatus,
  getTickets,
} from '../commons/api';
import PageTitle from '../components/PageTitle.vue';
import Load from '../components/Load.vue';
import Slider from '../components/Slider.vue';
import OrderDetail from './Order/OrderDetail.vue';
import OrderPayMethod from './Order/OrderPayMethod.vue';
import PingingDot from '../components/PingingDot.vue';
import { mapMutations } from 'vuex';
export default {
  name: 'TicketPage',
  components: {
    PageTitle,
    Load,
    Slider,
    OrderDetail,
    OrderPayMethod,
    PingingDot,
  },
  data() {
    return {
      tickets: [],
      isLoaded: false,
    };
  },
  watch: {},
  methods: {
    ...mapMutations(['setIsTicketResponsed']),
    statusHint({ status, reply_status }) {
      if (status === 0) {
        if (reply_status === 0) {
          return this.$t('Replied');
        } else {
          return this.$t('Waiting');
        }
      }
      if (status === 1) {
        return this.$t('Closed');
      }
      return 'unknown';
    },
    async setup() {
      const [tp, sp] = await Promise.allSettled([getTickets(), getStatus()]);
      if (tp.status === 'fulfilled') {
        this.tickets = tp.value;
      }
      if (sp.status === 'fulfilled') {
        this.setIsTicketResponsed(sp.value[1] === 1);
      }
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
