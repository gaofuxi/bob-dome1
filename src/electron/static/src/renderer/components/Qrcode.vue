<template>
	<div class="qrcode-page">
		<div style="width: 100%;height: 100%;" :id="id" :ref="id"></div>
	</div>
 
</template>
<script>
import QRCode from 'qrcodejs2'
export default {
  data() {
    return {
      qrcode: '',
	  isShowLoading:true
    }
  },
  props: {
    id: {
      type: String,
      required: true
    },
    text: {  // 后端返回的二维码地址
      type: String,
      default: ''
    },
    width: {
      type: String,
      default: '200'
    },
    height: {
      type: String,
      default: '200'
    },
    colorDark: {
      type: String,
      default: '#ffffff'
    },
    colorLight: {
      type: String,
      default: '#191D36'
    }
  },
  watch: {
    text(newText) {
      this.createQrcode()
    }
  },
  mounted() {
    this.createQrcode()
  },
  methods: {
    createQrcode() {
      // if(this.qrcode) {  // 有新的二维码地址了，先把之前的清除掉
      //   this.$refs[this.id].innerHTML = ''
      // }
      this.qrcode = new QRCode(this.$refs[this.id], {
        text: this.text, //页面地址 ,如果页面需要参数传递请注意哈希模式#
        width: this.width, // 二维码宽度 （不支持100%）
        height: this.height, // 二维码高度 （不支持100%）
        colorDark: this.colorDark,
        colorLight: this.colorLight,
        correctLevel: QRCode.CorrectLevel.H,
      })
    },
    // 制作另一个二维码
   
  }
}
</script>

<style scoped="scoped">
.qrcode-page{
	margin-top: 70px;
	margin-left: 100px;
}
</style>
