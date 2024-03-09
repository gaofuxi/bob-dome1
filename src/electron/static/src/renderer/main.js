import Vue from 'vue';
import './main.css';
import './main.scss'

import App from './App';
import router from './router';
import store from './store';

import VueClipboard from 'vue-clipboard2';

Vue.use(VueClipboard);
import VueI18n from 'vue-i18n';

Vue.use(VueI18n);

import en from './locales/en.json';
import cn from './locales/cn.json';

const i18n = new VueI18n({
  locale: 'en',
  fallbackLocale: 'cn',
  messages: {
    en,
    cn
  }
});
Vue.prototype.$EventBus = new Vue();

import VueAwesomeSwiper from 'vue-awesome-swiper' 
import 'swiper/dist/css/swiper.css' 
Vue.use(VueAwesomeSwiper) 


import * as emoji from './commons/emoji';
import * as systemProxy from './commons/systemProxy';
import * as autoLaunch from './commons/autoLaunch';

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

// plugins
import pluginRegistry from './plugins/index';

Vue.use(pluginRegistry, { store, i18n });

import { mapGetters, mapMutations, mapState } from 'vuex';
import { isLinux, isMac, isWin } from './constant/platform';
import { ipcRenderer, shell } from 'electron';
import * as _ from 'lodash';
import { init } from './commons/api';
import { showDialog } from './commons/helper';
import { killClash } from './commons/binary';
import { getSubscribe } from './commons/api.js';
import CrispChat from '@dansmaculotte/vue-crisp-chat';
import util from './plugins/utils.js';

let id;

if (!process.env.IS_WEB) Vue.use(require('vue-electron'));

Vue.use(emoji, { store });
Vue.use(systemProxy, { store });
Vue.use(autoLaunch);

Vue.config.productionTip = false;

Vue.mixin({
  data() {
    return {
      mixinScrollTop: 0
    };
  },
  computed: {
    ...mapState({
      userSettingsObject: (state) => state.app.userSettingsObject,
      clashConfigs: (state) => state.app.clashConfigs,
      isConnecting: (state) => state.app.isConnecting
    }),
    isWindows: function() {
      return isWin();
    },
    isMacOS: function() {
      return isMac();
    },
    isLinux: function() {
      return isLinux();
    },
    settings() {
      if (!this.userSettingsObject) {
        return {};
      }
      return new Proxy(_.cloneDeep(this.userSettingsObject), {
        get: function(obj, prop) {
          const { [prop]: p } = obj;
          return p;
        },
        set: (obj, prop, val) => {
          obj[prop] = val;
          this.setUserSettingsObject(_.cloneDeep(obj));
          return true;
        }
      });
    },
    isGlobalMode: {
      get() {
        return this.settings.mode === 'global';
      },
      set(v) {
        this.settings.mode = v ? 'global' : 'rule';
        ipcRenderer.send('change-global-mode', this.settings.mode);
      }
    }
  },
  created() {
     this.getId()
  },
  methods: {
    ...mapMutations([
      'setMixinObject',
      'setUserSettingsObject',
      'setIsConnecting'
    ]),
    goto(url) {
      this.$router.replace(url).catch((err) => {
      });
    },
    img(name) {
      return 'static/imgs/light/' + name;
    },
    disconnect() {
      try {
        if (this.isConnecting) {
          this.setMixinObject({});
          this.$setSystemProxy(false, this.clashConfigs['mixed-port']);
          this.setIsConnecting(false);
        }
      } catch (e) {
        console.error(`failed to disconnect with error: ${e}`);
      }
    },
    async cleanUpAndQuit() {
      await killClash();
      await this.disconnect();
      ipcRenderer.send('cleanup-done');
    },
    async reloadElectron() {
      await ipcRenderer.invoke('app', 'relaunch');
      await ipcRenderer.invoke('app', 'exit', 0);
    },
    openExternal(url) {
      shell.openExternal(url);
    },
    async getId() {  
      let config = await getSubscribe();
      id = config.crisp_id;
      let isOpen = config.crisp_enable;
      if (isOpen) {
       Vue.use(CrispChat, {
         websiteId: id,
         hideOnLoad: true,
       });
      }
    }
  }
});

if (module.hot) {
  module.hot.accept();
}
/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>',
  i18n
}).$mount('#app');
