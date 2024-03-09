<template>
  <div class="relative" v-on="$listeners">
    <slot class="" />
    <div
      class="absolute w-full text-disabled h-full flex items-center justify-center top-0 left-0 pointer-events-none"
      v-if="isEmpty"
    >
      {{ loaded ? $t('no more') : $t('Loading') }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'Load',
  props: {
    loaded: Boolean,
    staticCount: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      isEmpty: true,
    };
  },
  watch: {},
  updated() {
    this.isEmpty =
      this.$slots?.default === undefined ||
      this.$slots.default.filter((vnode) => vnode.tag).length <=
        this.staticCount;
  },
  mounted() {
    this.isEmpty =
      this.$slots?.default === undefined ||
      this.$slots.default.filter((vnode) => vnode.tag).length <=
        this.staticCount;
  },
};
</script>
