<template>
  <transition name="fade">
    <div
      v-if="pannelComponent"
      class="w-full h-full fixed top-0 left-0"
      @click.self="handleClose"
    >
      <transition name="slide">
        <component
          v-if="isShowPannel"
          v-bind="pannelProps"
          :is="pannelComponent"
          :style="{ height: height + 'px' }"
          class="w-full rounded-lg absolute bottom-0 left-0 bg-[#FDFDFE]"
          style="box-shadow: 0px -5px 10px #282c3444"
          v-on="$listeners"
          @deep-close="handleClose"
        />
      </transition>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'Slider',
  props: {
    pannelProps: {
      type: Object,
      default: () => ({}),
    },
    pannelComponent: {
      type: Object,
      default: () => ({}),
    },
    height: {
      type: Number,
      default: 400,
    },
  },
  data() {
    return {
      isShowPannel: false,
    };
  },
  watch: {
    pannelComponent(v) {
      if (v) {
        setTimeout(() => {
          this.isShowPannel = true;
        }, 10);
      }
    },
  },
  methods: {
    handleClose() {
      this.isShowPannel = false;
      setTimeout(() => {
        this.$emit('close');
      }, 200);
    },
  },
  mounted() {},
};
</script>

<style lang="scss" scoped>
.slide-enter-active {
  animation: slide-in 0.3s ease-in-out;
}

.slide-leave-active {
  animation: slide-out 0.2s ease-in-out;
}

@keyframes slide-in {
  0% {
    transform: translateY(100%);
  }
  100% {
    transform: translateY(0);
  }
}

@keyframes slide-out {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(100%);
  }
}

.fade-enter-active {
  animation: fade-in 0.3s ease-in-out;
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
