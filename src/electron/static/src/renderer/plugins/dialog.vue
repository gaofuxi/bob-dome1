<template>
  <div
    v-if="isShow"
    class="w-full h-[calc(100%-40px)] z-10 fixed top-[40px] left-0 bg-black bg-opacity-40 flex items-center justify-center"
  >
    <div
      class="rounded-lg w-[300px] bg-white shadow-card flex items-center flex-col gap-2 relative"
    >
      <div class="px-5 py-4 items-center flex flex-col">
        <div class="text-lg font-bold">{{ title }}</div>
        <div
          class="text-secondary text-center w-full break-all max-h-[300px] scrolly"
        >
          {{ message }}
        </div>
      </div>
      <div class="w-full flex justify-between h-[50px] border-t-[1px]">
        <div
          @click="handleCancel"
          class="w-1/2 h-full border-r-[1px] grid items-center text-center hover:bg-gray-200"
        >
          {{ cancelText }}
        </div>
        <div
          @click="handleConfirm"
          class="w-1/2 h-full grid items-center text-center hover:bg-gray-200"
        >
          {{ confirmText }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DialogPlugin',
  data() {
    return {
      isShow: false,
      type: '',
      title: '',
      message: '',
      resolve: () => {},
      confirmText: '',
      cancelText: '',
    };
  },
  methods: {
    show({
      title = '',
      message = '',
      type = 'success',
      confirmText,
      cancelText,
    }) {
      this.isShow = true;
      this.title = title;
      this.message = message;
      this.confirmText = confirmText || this.$t('Dialog Confirm');
      this.cancelText = cancelText || this.$t('Dialog Cancel');
      this.type = type;
      return new Promise((resolve) => {
        this.resolve = resolve;
      });
    },
    handleConfirm() {
      this.isShow = false;
      this.resolve(true);
    },
    handleCancel() {
      this.isShow = false;
      this.resolve(false);
    },
  },
};
</script>
