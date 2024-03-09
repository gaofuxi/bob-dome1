<template>
  <div class="bg-bg text-black">
    <div
      class="text-2xl font-bold flex flex-col h-[90px] border-b-[1px] justify-center pl-5"
    >
      <span>Hi!</span>
      <span v-if="userInfo">{{ parseEmail(userInfo.email) }}</span>
    </div>
    <div class="grid grid-cols-4 grid-rows-4 text-xs border-l-[1px]">
      <div
        class="item"
        @click="
          openWeb('dashboard');
          $emit('deep-close');
        "
      >
        <img
          class="w-7"
          style="filter: brightness(0%)"
          :src="img('person.png')"
          alt=""
        />
        <span>{{ $t('My account') }}</span>
      </div>
      <div
        class="item"
        @click="
          $router.push('/order');
          $emit('deep-close');
        "
      >
        <img class="w-7" :src="img('dingdan.png')" alt="" />
        <span>{{ $t('My Orders') }}</span>
      </div>
      <div
        class="item"
        @click="
          openWeb('invite');
          $emit('deep-close');
        "
      >
        <img class="w-7" :src="img('yaoqing.png')" alt="" />
        <span>{{ $t('Award') }}</span>
      </div>
      <div class="item">
        <Hint
          :hint="
            isGlobalMode
              ? $t('Global mode All Websites Will be proxied')
              : $t(
                  'Rule mode Websites outside of Mainland China Will be proxied'
                )
          "
        >
          <Radio v-model="isGlobalMode" />
        </Hint>
        <span>{{ isGlobalMode ? $t('Global Model') : $t('Rule Model') }}</span>
      </div>
      <div
        class="item"
        @click="
          handleOpenCrispChat();
          $emit('deep-close');
        "
      >
        <img class="w-7" :src="img('kefu.png')" alt="" />
        <span>{{ $t('Support') }}</span>
        <span class="text-[10px] absolute translate-y-8 translate-x-[1px]">{{
          $t('Support time')
        }}</span>
      </div>
      <div
        class="item relative"
        @click="
          $router.push('/extra-setting');
          $emit('deep-close');
        "
      >
        <PingingDot class="absolute right-7 top-2" />
        <img class="w-7" :src="img('setting.png')" alt="" />
        <span>{{ $t('Settings') }}</span>
      </div>
      <div class="item">
        <Radio v-model="settings.isLaunchAtLogin" />
        <span>{{ $t('Open at launch') }}</span>
      </div>
      <div class="item" @click="handleLogout">
        <img class="w-7" :src="img('quit.png')" alt="" />
        <span>{{ $t('Logout') }}</span>
      </div>
    </div>
    <div class="fixed bottom-1 left-6 text-gray-400">V{{ version }}</div>
  </div>
</template>

<script>
import {
  getConfigs,
  patchConfigs,
  putConfigs,
} from '../../commons/clashRestful';
import { ipv4Interfaces } from '../../commons/interfaceNameDetection';
import _ from 'lodash';
import Radio from '../../components/Radio.vue';
import Select from '../../components/Select.vue';
import storageKeys from '../../constant/storageKeys';
import cache from '../../commons/cache';
import { mapMutations, mapState } from 'vuex';
import { ipcRenderer, shell, clipboard } from 'electron';
import { readFileSync, writeFileSync } from 'original-fs';
import { join } from 'path';
import {
  chosenDomain,
  getUserInfo,
  getWebUrl,
  logout,
} from '../../commons/api';
import Hint from '../../components/Hint.vue';
import PingingDot from '../../components/PingingDot.vue';
export default {
  name: 'SettingPage',
  components: { Radio, Select, Hint, PingingDot },
  props: {
    userInfo: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      checked: false,
      localIP: '',
      version: '',
      webWindow: null,
    };
  },
  watch: {
    async 'settings.isTUN'(val) {
      if (val) {
        if (
          await this.$dialog({
            title: this.$t('Pay attention'),
            message: this.$t('Reboot is required to run TUN mode'),
            confirmText: this.$t('Restart the APP'),
            cancelText: '稍后重启',
          })
        ) {
          this.reloadElectron();
        }
      }
    },
  },
  computed: {
    ...mapState({
      coreControllerPort: (state) => state.app.coreControllerPort,
      clashConfigs: (state) => state.app.clashConfigs,
      isConnecting: (state) => state.app.isConnecting,
      upgradeDownloadProgress: (state) => state.app.upgradeDownloadProgress,
      userAuthInfo: (state) => state.app.userAuthInfo,
      logs: (state) => state.app.logs,
      logFilePath: (state) => state.app.logFilePath,
    }),
    upgradeProgressHint() {
      const p = this.upgradeDownloadProgress;
      return p ? `${(p * 100).toFixed(1)}%` : '';
    },
  },
  methods: {
    ...mapMutations(['setClashProfileUrl', 'resetAll']),
    parseEmail(email) {
      return email.replace(/@.*/, '');
    },
    handleOpenCrispChat() {
      this.$crisp.push([
        'on',
        'chat:closed',
        () => {
          this.$crisp.push(['do', 'chat:hide']);
        },
      ]);
      this.$crisp.push(['do', 'chat:show']);
      this.$crisp.push(['do', 'chat:open']);
    },
    async openWeb(redirect) {
      if (this.isLoadingWeb) {
        return;
      }
      this.isLoadingWeb = true;
      const url = await getWebUrl(redirect, this.userAuthInfo?.authData);
      this.isLoadingWeb = false;
      if (this.webWindow) {
        this.webWindow.close();
        this.webWindow = null;
      }
      if (url && this.webWindow === null) {
        this.webWindow = window.open(
          url,
          '_blank',
          'nodeIntegration=no,width=1200,height=800,autoHideMenuBar=true'
        );
      }
    },
    async handleLogout() {
      await this.disconnect();
      await logout().catch(() => {});
      this.resetAll();
      this.goto('/index');
      cache.put(storageKeys.IS_USER_LOGINED, false);
      ipcRenderer.invoke('window', 'reload');
    },
    async exportLogs() {
      const electronLogs = this.logs.reduce((acc, log) => {
        const levels = ['verbose', 'info', 'warning', 'error'];
        return acc + `\n\n${levels[log.level]} ${log.message}`;
      }, '');
      const clashLogs = this.logFilePath
        ? readFileSync(this.logFilePath).toString()
        : '';
      const tempPath = await ipcRenderer.invoke('app', 'getPath', 'temp');
      const destPath = join(tempPath, 'shadowfly-log.txt');
      writeFileSync(destPath, electronLogs + '\n\nclash:\n' + clashLogs);
      shell.showItemInFolder(destPath);
    },
    handleChangeMode() {
      console.log('handleChangeMode', this.settings.mode);
      this.settings.mode = this.settings.mode === 'rule' ? 'global' : 'rule';
    },
    async setup() {
      const guessNames = ['以太网', 'WLAN', 'en0', 'en1'];
      const ifs = ipv4Interfaces().sort((a, b) => {
        const aIndex = guessNames.indexOf(a.name);
        const bIndex = guessNames.indexOf(b.name);
        return bIndex - aIndex;
      });

      this.localIP = ifs[0].address;
      const version = await ipcRenderer.invoke('app', 'getVersion');
      this.version = version;
    },
  },
  mounted() {
    this.setup();
  },
};
</script>

<style scoped>
.item {
  @apply h-[85px] hover:bg-[#E3E3E3] border-b-[1px] border-r-[1px] flex items-center flex-col justify-center gap-2;
}

.card {
  @apply w-full  bg-white rounded-lg shadow-card mt-5 pl-[33px] pt-[21px];
}

.title {
  @apply text-lg border-b-[1px] border-[#F8F8F8]  w-[511px] h-[45px] flex gap-7;
}

.hint {
  @apply text-[#8A8C91];
}

input {
  @apply outline-none border-[#E4E4E4] border-[2px] h-[37px] w-[138px] rounded-lg text-center;
}
</style>
