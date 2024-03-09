<template>
  <div
    class="w-fit min-w-[43px] gap-1 h-[21px] rounded-full relative shadow flex items-center px-[2px] justify-between"
    @click="handleClick"
    :style="{
      backgroundColor: backgroundColor || (checked ? '#2F3990' : '#A3A3A3'),
      opacity: disabled ? 0.5 : 1,
    }"
  >
    <div v-if="c[0] !== null" class="text-white ml-1">{{ c[0] }}</div>
    <div class="w-[17px] h-[17px] bg-white rounded-full top-[2px]"></div>
    <div v-if="c[1] !== null" class="text-white mr-1">{{ c[1] }}</div>
  </div>
</template>

<script>
export default {
  name: 'Radio',
  model: {
    prop: 'checked',
    event: 'change',
  },
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    checked: {
      type: Boolean,
      default: false,
    },
    onText: {
      type: String,
      default: '',
    },
    offText: {
      type: String,
      default: '',
    },
    backgroundColor: {
      type: String,
      default: '',
    },
  },
  computed: {
    c() {
      return this.checked ? [this.onText, null] : [null, this.offText];
    },
  },
  methods: {
    handleClick() {
      if (this.disabled) {
        this.$emit('disabled-click');
        return;
      }
      this.$emit('change', !this.checked);
    },
  },
};
</script>
