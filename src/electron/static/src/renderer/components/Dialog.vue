<template>
  <div
    class="dialog-card"
  >
    <div
      class="rounded-lg w-[300px] bg-white shadow-card flex items-center flex-col gap-2 relative"
    >
      <div class="px-5 py-4 items-center flex flex-col">
        <div class="text-lg font-bold" style="color: #0C172E;">{{ title }}</div>
        <div
          class="text-secondary text-center w-full break-all max-h-[300px]"
		  style="color: #0C172E;"
        >
          {{ content }}
        </div>
      </div>
      <div class="w-full flex justify-between h-[50px] border-t-[1px]">
        <div
          @click="onCancel"
          class="w-1/2 h-full border-r-[1px] grid items-center text-center hover:bg-gray-200"
		  style="color: #0C172E;"
        >
          {{ cancelText }}
        </div>
        <div
          @click="onConfirm"
          class="w-1/2 h-full grid items-center text-center hover:bg-gray-200 "
		  style="color: #0C172E;"
        >
          {{ confirmText }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
	export default{
		data(){
			return{
				
			}
		},
		props: {
		    title: { // 标题
		      type: String,
		      default: '提示'
		    },
		    content: { // 内容
		      type: String,
		      default: ''
		    },
		    cancelText: { // 取消按钮文字
		      type: String,
		      default: '取消'
		    },
		    confirmText: { // 确认按钮文字
		      type: String,
		      default: '确定'
		    },
		},
		methods:{
			onClose() {
			  this.$emit('close')
			},
			onCancel() {
			  this.$emit('cancel')
			},
			onConfirm() {
			  this.$emit('confirm')
			}
		}
	}
</script>

<style scoped="scoped">
.dialog-card{
	display: flex;
	justify-content: center;
	align-items: center;
	position: fixed;
	top: 0;
	left: 100px;
	width: 700px;
	height: 100%;
	
	background: rgba(0, 0, 0, 0.5);
	z-index: 1000;
}
</style>
