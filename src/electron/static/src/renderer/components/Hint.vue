<template>
  <div
    class="relative overflow-visible"
    ref="hint"
    @mouseenter="startCounting"
    @mouseleave="stopCounting"
    v-on="$listeners"
  >
    <transition name="popup">
      <div
        class="fixed w-fit -translate-x-[calc(100%+5px)] text-white bg-black px-2 py-1 rounded bg-opacity-95 max-w-[200px] z-50"
        ref="hint-text"
        v-if="isShowHint"
      >
        {{ hint }}
      </div>
    </transition>
    <slot />
  </div>
</template>

<script>
export default {
  name: 'Hint',
  props: {
    hint: {
      type: String,
      default: '',
    },
    position: {
      type: String,
      default: 'left',
    },
  },
  data() {
    return {
      timeoutID: null,
      isShowHint: false,
    };
  },
  methods: {
    startCounting() {
      this.timeoutID = setTimeout(() => {
        this.isShowHint = true;
      }, 200);
    },
    stopCounting() {
      if (this.timeoutID) {
        clearTimeout(this.timeoutID);
        this.timeoutID = null;
        this.isShowHint = false;
      }
    },
  },
  updated() {},
};
</script>

<style lang="scss" scoped>
.popup-enter-active {
  animation: fade-in 0.2s ease-in-out;
}

.popup-leave-active {
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
