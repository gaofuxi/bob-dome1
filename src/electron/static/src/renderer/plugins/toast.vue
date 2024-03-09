<template>
  <transition name="fade">
    <div
      v-if="isShow && message"
      class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-7 bg-[#373737eb] rounded px-3 py-2 max-w-[300px] text-white flex flex-col items-center justify-center min-w-[100px] gap-1"
		style="margin-left: 50px;z-index: 9999999999999999;"
	>
      <span v-if="type === 'error'" class="icon text-3xl">error</span>
      {{ message }}
    </div>
  </transition>
</template>

<script>
export default {
  name: 'ToastPlugin',
  data() {
    return {
      isShow: false,
      message: 'hello world',
      timeoutID: null,
      type: 'info',
    };
  },
  methods: {
    show({ message = '', timeout = 2000, type = 'info' }) {
      if (this.timeoutID) {
        clearTimeout(this.timeoutID);
      }
      this.isShow = true;
      this.message = message;
      this.type = type;
      this.timeoutID = setTimeout(() => {
        this.isShow = false;
        this.timeoutID = null;
      }, timeout);
    },
  },
};
</script>

<style lang="scss" scoped>
.fade-enter-active {
  animation: fade-in 0.2s ease-in-out;
}

.fade-leave-active {
  animation: fade-out 0.1s ease-in-out;
}

@keyframes fade-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes fade-out {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
