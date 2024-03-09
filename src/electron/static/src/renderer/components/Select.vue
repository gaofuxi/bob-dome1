<template>
  <div class="flex items-center w-fit h-[37px]">
    <div
      class="w-[89px] text-center h-full flex items-center justify-center border-[#E4E4E4]"
      :style="{
        backgroundColor: keys[idx] === now ? '#0DB8BF' : '#fff',
        color: keys[idx] === now ? '#fff' : '#000',
        borderWidth:
          keys[idx] === now
            ? '0'
            : idx === 0
            ? '2px 0 2px 2px'
            : idx === items.length - 1
            ? '2px 2px 2px 0'
            : '2px 0 2px 0',
        borderRadius:
          idx === 0
            ? '8px 0 0 8px'
            : idx === items.length - 1
            ? '0 8px 8px 0'
            : '0',
      }"
      v-for="(item, idx) of items"
      :key="item"
      @click="handleSelect(idx)"
    >
      {{ item }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'Select',
  model: {
    prop: 'now',
    event: 'change',
  },
  props: {
    items: {
      type: Array,
      default: () => [],
    },
    now: {
      type: String,
      default: '',
    },
    keys: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    handleSelect(index) {
      this.$emit('change', this.keys[index]);
    },
  },
};
</script>
