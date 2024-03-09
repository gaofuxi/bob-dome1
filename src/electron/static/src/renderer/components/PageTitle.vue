<template>
  <div class="flex items-center text-2xl w-fit" @click="handleClick">
    <img :src="img('goBack.png')" alt="" class="w-5 ml-4" />
    <div>{{ title }}</div>
  </div>
</template>

<script>
export default {
  name: 'PageTitle',
  props: {
    title: {
      type: String,
      default: '',
    },
  },
  methods: {
    handleClick() {
      this.$router.go(-1);
      this.$emit('click');
    },
  },
};
</script>
