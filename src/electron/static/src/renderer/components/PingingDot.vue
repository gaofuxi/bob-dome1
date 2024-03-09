<template>
  <div v-if="isTicketResponsed" class="absolute overflow-visible">
    <div
      class="w-[7px] h-[7px] animate-ping rounded-full absolute"
      :style="{
        backgroundColor: '#FF0000',
      }"
    ></div>
    <div
      class="bg-red-600 w-[5px] h-[5px] absolute mt-[1px] ml-[1px] rounded-full"
    ></div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
  name: 'PingingDot',
  props: {},
  computed: {
    ...mapState({
      isTicketResponsed: (state) => state.app.isTicketResponsed,
    }),
  },
};
</script>
