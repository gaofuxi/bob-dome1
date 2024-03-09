<template>
  <div class="w-full h-full bg-[#F4F2F8] pt-8 flex flex-col">
    <div class="text-2xl font-bold text-black flex-shrink-0 px-4">
      {{ notice.title }}
    </div>
    <div class="text-[#747373] text-xs px-4 pt-2 pb-5">
      {{ $t('Publish time') }}{{ notice.created_at | formatDate }}
    </div>
    <div class="w-full h-[1px] bg-border"></div>
    <div
      class="text-[#5B5D5D] text-[13px] whitespace-pre-line text scrolly select-text px-4 break-words flex-grow pb-16"
    >
      {{ notice.content }}
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import { getNoitice } from '../../commons/api';
import Load from '../../components/Load.vue';
export default {
  name: 'NotificationPage',
  props: {
    notice: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      notices: '',
      isLoaded: true,
    };
  },
  filters: {
    formatDate(s) {
      if (!s) return '';
      return moment(s * 1000).format('YYYY/MM/DD');
    },
  },
  methods: {
    async setup() {},
  },
  mounted() {
    this.setup();
  },
  components: { Load },
};
</script>
