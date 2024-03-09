<template>
  <div>
    <div class='page'>
      <div class='m-t-77'>
        <div class='items'>
          <div class='items-title'>{{ $t('Universal') }}</div>
          <div class='flex align-center' @click='toAuto'>
            <div class='checked-box'>
              <div class='checked-box-act' v-if='isAuto'></div>
            </div>
            <div class='items-text'>{{ $t('Open at launch') }}</div>
          </div>
        </div>
        <div class='items' @click='toUpdate'>
          <div class='items-title'>{{ $t('Update') }}</div>
          <div class='flex align-center'>
            <img class='refresh-img' src='../../../static/index/Setting/refresh.png' />
            <div class='items-act'>{{ $t('Check updates') }}</div>
          </div>
        </div>
        <div class='items' @click='openFileHandler'>
          <div class='items-title'>{{ $t('File management') }}</div>
          <div class='flex align-center'>
            <div class='fold-bar'>{{ path }}</div>
            <img class='fold-img' src='../../../static/index/Setting/fold.png' />
          </div>
        </div>
        <div class='items'>
          <div class='items-title'>{{ $t('TUN Mode') }}</div>
          <div class='flex align-center'>
            <Radio
              v-model='settings.isTUN'
              :disabled='isConnecting'
              @disabled-click='handleDisableIsTUNClick'
              @change='handleChangeIsTUNClick'
            />
          </div>
        </div>
        <div class='items'>
          <div class='items-title'>HTTP/SOCKS{{ $t('Port') }}</div>
          <div class='flex align-center'>
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
        <div class="items" @click="$router.push('/language')">
          <div class='items-title'>{{ $t('Language') }}</div>
          <div class="flex items-center">
            <span class='items-act'>{{ currentLanguage }}</span>
            <img class="right-arrow-img" src='../../../static/index/User/right-arrow.png'/>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import Collapse from '../components/Collapse.vue';
import { ipcRenderer, shell, clipboard } from 'electron';
import { isLinux, isMac, isWin } from '../constant/platform';
import Radio from '../components/Radio.vue';
import { getUpdate } from '../commons/api.js';
import { mapState } from 'vuex';
import _ from 'lodash';

const remote = require('@electron/remote');
export default {
  components: {
    Collapse, Radio
  },
  data() {
    return {
      itemsOne: false,
      path: '',
      isAuto: false,
      version: '',
      type: ''
    };
  },
  computed: {
    currentLanguage() {
      return {
        auto: this.$t('auto language'),
        cn: '简体中文',
        en: 'English',
      }[this.settings.language];
    },
  },
  watch: {
    'settings.mixedPort': {
      handler: _.debounce(function(p) {
        if (p <= 0 || p > 65535) {
          this.$toast({
            message: this.$t('Port range 1-65535'),
            type: 'error'
          });
        }
      }, 500)
    },
    clashMixedPort: {
      handler(p) {
        if (p === 0) {
          this.$toast({
            message: this.$t('Could not listen a port'),
            type: 'error'
          });
        }
      }
    },
    async 'settings.isTUN'(val) {
      if (val) {
        if (
          await this.$dialog({
            title: this.$t('Pay attention'),
            message: this.$t('Reboot is required to run TUN mode'),
            confirmText: this.$t('Restart the APP'),
            cancelText: this.$t('Restart later')
          })
        ) {
          this.reloadElectron();
        }
      }
    }
  },
  created() {
    this.path = remote.app.getPath('userData');
    let switchStatus = localStorage.getItem('SwitchStatus');
    if (switchStatus) {
      if (switchStatus == 'false') {
        this.isAuto = false;
      } else if (switchStatus == 'true') {
        this.isAuto = true;
      }
    } else {
      this.isAuto = false;
    }
  },
  methods: {
    ...mapState({
      isConnecting: (state) => state.app.isConnecting,
      clashConfigs: (state) => state.app.clashConfigs,
      logs: (state) => state.app.logs,
      logFilePath: (state) => state.app.logFilePath
    }),
    clashMixedPort() {
      return this.clashConfigs?.['mixed-port'];
    },
    async handleDisableIsTUNClick() {
        if (
          await this.$dialog({
            title: this.$t('Can not turn on TUN mode'),
            message: this.$t('Please disconnect first'),
            confirmText: this.$t('Go to index page')
          })
        ) {
          this.goto('/');
        }
    },
    async handleChangeIsTUNClick(checked) {
      if (this.isConnecting) {
        if (
          await this.$dialog({
            title: this.$t('Can not turn on TUN mode'),
            message: this.$t('Please disconnect first'),
            confirmText: this.$t('Go to index page')
          })
        ) {
          this.goto('/');
        }
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
    toBack() {
      this.$router.go(-1);
    },
    toAuto() {
      this.isAuto = !this.isAuto;
      ipcRenderer.send('autoOpen', this.isAuto);
      let checkStatusString = this.isAuto.toString();
      localStorage.setItem('SwitchStatus', checkStatusString);
    },
    openFileHandler() {
      const { shell } = require('electron');
      shell.showItemInFolder(remote.app.getPath('userData'));
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
          message: this.$t('Terminal command has been copied')
        });
      }
    },
    async toUpdate() {
      const version = await ipcRenderer.invoke('app', 'getVersion');
      let type = window.navigator.platform === 'Win32' ? 'windows' : 'mac';
      let list = await getUpdate(version, type);
      if (list.download_url && list.enable == true) {
        let shell = window.require('electron').shell;
        shell.openExternal(list.download_url);
      } else {
        this.$toast({
          message: '已是最新版本'
        });
      }


    }
  }
};
</script>

<style scoped='scoped'>
.m-t-77 {
  margin-top: 77px;
}

.align-center {
  align-items: center;
}

.title-bar {
  margin-top: 50px;
  margin-left: 45px;
}

.header {
  width: 700px;
  height: 44px;
  background: #F5F8FF;
  border-radius: 0px 0px 0px 0px;
  opacity: 1;
  -webkit-app-region: drag;
}

.page {
  /* background: url(../../../static/index/User/bg.png);
  background-repeat: no-repeat;
  background-position: -104px 40px; */
  width: 700px;
  height: 520px;
}

.items {
  width: 400px;
  height: 39px;
  background: #24273F;
  box-shadow: 0px 8px 12px 0px rgba(0, 0, 0, 0.05);
  border-radius: 4px 4px 4px 4px;
  opacity: 1;
  border: 1px solid rgba(128, 134, 187, 0.05);
  margin: 0 auto;
  margin-bottom: 17px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.items-title {
  font-size: 14px;
  font-family: PingFang SC-Medium, PingFang SC;
  font-weight: 500;
  color: #A8A9B3;
  margin-left: 13px;
}

.checked-box {
  width: 16px;
  height: 16px;
  border-radius: 2px 2px 2px 2px;
  opacity: 1;
  border: 1px solid #4B4F75;
  margin-right: 7px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.checked-box-act {
  width: 10px;
  height: 10px;
  border-radius: 2px 2px 2px 2px;
  opacity: 1;
  border: 1px solid #4B4F75;
  background-color: #2F3990;
  cursor: pointer;
}

.items-text {
  font-size: 14px;
  font-family: PingFang SC-Regular, PingFang SC;
  font-weight: 400;
  color: #A8A9B3;
  margin-right: 14px;
}

.refresh-img {
  width: 18px;
  height: 18px;
  margin-right: 4px;
}

.items-act {
  font-size: 14px;
  font-family: PingFang SC-Regular, PingFang SC;
  font-weight: 400;
  color: #A8A9B3;
  margin-right: 14px;
}

.fold-bar {
  width: 283px;
  height: 20px;
  font-size: 14px;
  font-family: PingFang SC-Regular, PingFang SC;
  font-weight: 400;
  color: #A8A9B3;
  overflow: hidden;
  text-align: right;

}

.fold-img {
  width: 23px;
  height: 19px;
  margin-right: 7px;
  margin-left: 7px;
  cursor: pointer;
}

.right-arrow-img{
  width: 16px;
  height: 16px;
  margin-right: 18px;
}
</style>
