<template>
  <div v-if='isShowLoading' class='loading-container'>
    <div class='loading-box'>
      <img class='loading-img' src='../../../static/index/Main/loading.png'>
      <!-- 这里content为双花括号 -->
      <span class='loading-txt'>{{ content }}</span>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isShowLoading: true
    };
  },
  props: {
    content: {
      type: String,
      default: 'Loading'
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 100px;
  width: 700px;
  height: 100%;

  background: rgba(0, 0, 0, 0);
  z-index: 1000;
}

.loading-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 130px;
  height: 130px;
  border-radius: 10px;
  background: rgba(0, 0, 0, .5);
}

.loading-img {
  width: 50px;
  height: 50px;
  margin-bottom: 10px;
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(1turn);
  }
}

.loading-txt {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  color: #FFFFFF;
}
</style>