<template>
  <div class="bg-main text-white h-full">
    <PageTitle :title="$t('Question Detial')" />
    <div class="text-sm mx-5 mb-2 flex justify-between">
      <div>
        {{ formatDate(ticket.created_at) }}
      </div>
      <div v-if="isOpen" @click="handleClose">
        {{ $t('Close') }}
      </div>
    </div>
    <Load
      :loaded="isLoaded"
      class="h-[calc(100%-60px)] bg-[#F1F2F6] text-black py-5 px-3 pb-[60px] scrolly"
    >
      <div v-for="(msg, idx) in ticket.message" :key="msg.id" class="mb-2">
        <div
          :ref="idx === ticket.message.length - 1 ? 'last' : ''"
          v-if="msg.is_me"
          class="mb-1 flex flex-col items-end"
        >
          <div class="text-xs text-secondary mb-[2px]">
            {{ formatDate(msg.updated_at) }}
          </div>
          <div
            class="bg-white w-fit p-3 border-r-[3px] break-all text-sm border-main"
          >
            {{ msg.message }}
          </div>
        </div>
        <div
          :ref="idx === ticket.message.length - 1 ? 'last' : ''"
          v-else
          class="mb-1"
        >
          <div class="text-xs text-secondary mb-[2px]">
            {{ formatDate(msg.updated_at) }}
          </div>
          <div class="bg-white w-fit p-3 border-l-[3px] text-sm border-black">
            {{ msg.message }}
          </div>
        </div>
      </div>
    </Load>
    <div
      v-if="isOpen"
      class="fixed bottom-0 h-[50px] gap-2 bg-[#EBEBEB] left-0 w-full flex justify-between items-center px-3"
    >
      <input
        type="text"
        v-model="responseText"
        class="outline-none flex-grow text-sm h-[34px] text-black rounded px-2"
        :placeholder="$t('Input content reply work order')"
      />
      <span class="text-main text-sm w-fit" @click="handleSendResponse">{{
        $t('send')
      }}</span>
    </div>
  </div>
</template>

<script>
import {
  checkoutPaytmen,
  checkPlan,
  closeTicket,
  getOrders,
  getPlans,
  getTicket,
  getTickets,
  replyTicket,
} from '../commons/api';
import PageTitle from '../components/PageTitle.vue';
import Load from '../components/Load.vue';
import Slider from '../components/Slider.vue';
import OrderDetail from './Order/OrderDetail.vue';
import OrderPayMethod from './Order/OrderPayMethod.vue';
import moment from 'moment';
export default {
  name: 'TicketChatPage',
  components: { PageTitle, Load, Slider, OrderDetail, OrderPayMethod },
  data() {
    return {
      ticket: {},
      isLoaded: false,
      responseText: '',
      intervalID: null,
    };
  },
  watch: {},
  computed: {
    isOpen() {
      return this.ticket.status === 0;
    },
  },
  methods: {
    formatDate(date) {
      if (date) {
        return moment(date * 1000).format('YYYY-MM-DD HH:mm');
      }
      return this.$t('unknown');
    },
    async handleClose() {
      if (
        await this.$dialog({
          title: this.$t('Notice'),
          message: this.$t('Are you sure to close ticket'),
          confirmButtonText: this.$t('Confirm'),
        })
      ) {
        try {
          await closeTicket(this.ticket.id);
          this.$router.go(-1);
        } catch (e) {
          this.$dialog({
            title: this.$t('Fail to close ticket'),
            message: e.message || this.$t('Unknown error please try again'),
          });
        }
      }
    },
    async handleSendResponse() {
      if (this.responseText) {
        try {
          if (await replyTicket(this.ticket.id, this.responseText)) {
            this.responseText = '';
          } else {
            this.$dialog({
              title: this.$t('Fail to reply ticket'),
              message: this.$t('Please try again later'),
            });
          }
        } catch (e) {
          this.$dialog({
            title: this.$t('Fail to reply ticket'),
            message: e.message,
          });
        }
      }
    },
    async setup(id) {
      const fetch = async (id) => {
        this.ticket = await getTicket(id);
      };

      if (id) {
        await fetch(id);
        this.intervalID = setInterval(() => {
          fetch(id);
        }, 2000);
      } else {
        this.$router.go(-1);
      }
      this.$nextTick(() => {
        if (this.isOpen) {
          this.$refs?.last[0].scrollIntoView({ behavior: 'smooth' });
        }
      });
    },
  },
  mounted() {},
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.setup(to.query?.id).finally(() => {
        vm.isLoaded = true;
      });
    });
  },
  beforeRouteLeave(to, from, next) {
    this.intervalID && clearInterval(this.intervalID);
    next();
  },
};
</script>
