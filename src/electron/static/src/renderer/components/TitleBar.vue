<template>
  <div
    class="w-full h-[40px] flex items-center px-4 justify-between drag  text-white"
  >
    <div v-if="isMacOS" class=""></div>
    <div class="text-sm flex items-center gap-1"></div>
    <div v-if="!isMacOS" class="flex gap-[10px] items-center">
      <div class="button" @click="handleMinimize">
        <div class="h-[2px] w-[12px] bg-[#B8BABE]"></div>
      </div>
      <div class="button relative" @click="handleClose">
        <div class="h-[2px] w-[12px] bg-[#B8BABE] rotate-45"></div>
        <div class="h-[12px] w-[2px] bg-[#B8BABE] absolute rotate-45"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron';
import { isMac } from '../constant/platform';
export default {
  name: 'TitleBar',
  methods: {
    handleMinimize() {
      ipcRenderer.invoke('window', 'minimize');
    },
    handleClose() {
      ipcRenderer.invoke('window', 'close');
    },
  },
};
</script>

<style scoped lang="scss">
.drag {
  -webkit-app-region: drag;
}

.button {
  width: 25px;
  height: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  -webkit-app-region: no-drag;
}
</style>
