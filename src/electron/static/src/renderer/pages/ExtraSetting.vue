<template>
  <div class="bg-main text-white text-sm">
    <PageTitle :title="$t('Settings')" />
    <div class="px-4 pt-4 h-[calc(100%-25px)] scrolly">
      <div class="section">
        <span>{{ $t('Problem') }}</span>
        <div class="section-card" @click="$router.push('/ticket')">
          <div class="item relative">
            <span>{{ $t('Feedback') }}</span>
            <PingingDot class="absolute right-7 top-[6px]" />
            <img class="w-4 rotate-180 ml-1" :src="img('right-arrow.png')" alt="" />
          </div>
        </div>
      </div>
      <div class="section">
        <span>{{ $t('Theme') }}</span>
        <div class="section-card">
          <div class="item" @click="$router.push('/language')">
            <span>{{ $t('Language') }}</span>
            <div class="flex items-center">
              <span>{{ currentLanguage }}</span>
              <img
                class="w-4 rotate-180 ml-1 h-4"
                :src="img('fanhui.png')"
                alt=""
              />
            </div>
          </div>
        </div>
      </div>
      <div class="section">
        <span>{{ $t('Connect setting') }}</span>
        <div class="section-card">
          <div class="item">
            <span>{{ $t('TUN Mode') }}</span>
            <Radio
              v-model="settings.isTUN"
              :disabled="isConnecting"
              @disabled-click="handleDisableIsTUNClick"
            />
          </div>
          <div class="item" @click="handleCopyCommnad">
            <span>{{ $t('Terminal Command') }}</span>
            <span>{{ $t('Copy Command') }}</span>
          </div>
          <div class="item">
            <span>{{ $t('Port') }}</span>
            <input
              :style="
                settings.mixedPort !== clashConfigs['mixed-port']
                  ? { borderColor: 'red' }
                  : {}
              "
              @click="handlePortClick"
              :readonly="isConnecting"
              class="border-[1px] w-14 text-center rounded outline-none port-input"
              v-model.number="settings.mixedPort"
            />
          </div>
        </div>
      </div>
      <div class="section">
        <span>{{ $t('Debug') }}</span>
        <div class="section-card" @click="handleExportLog">
          <div class="item">
            <span>{{ $t('Logs') }}</span>
            <span>{{ $t('Export') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { clipboard, shell, ipcRenderer } from 'electron';
import { commitPlan, getOrders, getPlans, getUserPlan } from '../commons/api';
import PageTitle from '../components/PageTitle.vue';
import Radio from '../components/Radio.vue';
import { isLinux, isMac, isWin } from '../constant/platform';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import _ from 'lodash';
import PingingDot from '../components/PingingDot.vue';

export default {
  name: 'ExtraSettingPage',
  components: { PageTitle, Radio, PingingDot },
  data() {
    return {};
  },
  watch: {
    'settings.mixedPort': {
      handler: _.debounce(function (p) {
        if (p <= 0 || p > 65535) {
          this.$toast({
            message: this.$t('Port range 1-65535'),
            type: 'error',
          });
        }
      }, 500),
    },
    clashMixedPort: {
      handler(p) {
        if (p === 0) {
          this.$toast({
            message: this.$t('Could not listen a port'),
            type: 'error',
          });
        }
      },
    },
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
      isConnecting: (state) => state.app.isConnecting,
      clashConfigs: (state) => state.app.clashConfigs,
      logs: (state) => state.app.logs,
      logFilePath: (state) => state.app.logFilePath,
    }),
    clashMixedPort() {
      return this.clashConfigs?.['mixed-port'];
    },
    currentLanguage() {
      return {
        auto: this.$t('auto language'),
        cn: '中文',
        en: 'English',
      }[this.settings.language];
    },
  },
  methods: {
    async handleDisableIsTUNClick() {
      if (
        await this.$dialog({
          title: this.$t('Can not turn on TUN mode'),
          message: this.$t('Please disconnect first'),
          confirmText: this.$t('Go to index page'),
        })
      ) {
        this.goto('/main/index');
      }
    },
    handlePortClick() {
      if (this.isConnecting) {
        this.$toast({
          message: this.$t('Can not change port when connecting'),
          type: 'error',
        });
      }
    },
    handleCopyCommnad() {
      const { 'mixed-port': port } = this.clashConfigs;
      let command = '';
      if (isWin()) {
        command = `set http_proxy=http://127.0.0.1:${port} & set https_proxy=http://127.0.0.1:${port}`;
      } else if (isMac() || isLinux()) {
        command = `export https_proxy=http://127.0.0.1:${port};export http_proxy=http://127.0.0.1:${port};export all_proxy=socks5://127.0.0.1:${port}`;
      }
      if (command) {
        clipboard.writeText(command);
        this.$toast({
          message: this.$t('Terminal command has been copied'),
        });
      }
    },
    async handleExportLog() {
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
    setup() {},
  },
  mounted() {
    this.setup();
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.setup();
    });
  },
};
</script>

<style scoped>
.port-input:disabled {
  pointer-events: none;
}

.section > span {
  @apply text-[#D9DBDB] text-sm;
}
.section-card {
  @apply bg-white w-full text-black rounded-lg px-4 py-3 mt-[6px] mb-4 flex flex-col gap-3;
}

.item {
  @apply flex items-center justify-between;
}

.item:not(:last-child) {
  @apply border-b-[1px] pb-3;
}
.item > span:nth-child(2) {
  @apply text-secondary;
}
</style>
