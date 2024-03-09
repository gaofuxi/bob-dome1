<template>
  <div class="flex flex-col w-full relative">
    <input
      class="h-30px] outline-none w-full text-sm"
      :style="{ borderColor: errorHint !== '' ? '#F65064' : '#B8BABE' }"
      :type="finalType"
      :value="value"
      :placeholder="placeholder"
      @change="handleChange"
      ref="input"
    />
    <div class="absolute right-0 flex items-center gap-3">
      <span
        @click="passwordVisible = !passwordVisible"
        class="icon"
        v-if="type === 'password'"
        >{{ passwordVisible ? 'visibility' : 'visibility_off' }}</span
      >
      <span
        @click="handleClear"
        class="icon"
        v-if="!['password', 'code'].includes(this.type) && value !== ''"
        >cancel</span
      >
    </div>
    <div class="w-full h-[1px] bg-border mt-2"></div>
  </div>
</template>

<script>
export default {
  name: 'Input',
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    type: {
      type: String,
      default: 'text',
    },
    value: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
    errorHint: {
      type: String,
      default: '',
    },
    iconSrc: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      passwordVisible: false,
    };
  },
  computed: {
    finalType() {
      return this.type === 'password'
        ? this.passwordVisible
          ? 'text'
          : 'password'
        : this.type;
    },
  },
  methods: {
    handleChange(e) {
      this.$emit('change', e.target.value);
    },
    handleClear() {
      this.$refs.input.focus();
      this.$emit('change', '');
    },
  },
};
</script>
