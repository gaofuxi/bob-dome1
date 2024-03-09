<template>
  <div class="text-black w-full h-full">
    <div
      class="h-[70px] px-4 flex items-center w-full border-b-[1px] justify-between"
    >
      <div class="text-2xl font-bold">{{ $t('select node') }}</div>
      <Hint
        class="text-[12px]"
        :hint="
          isGlobalMode
            ? $t('Global mode All Websites Will be proxied')
            : $t('Rule mode Websites outside of Mainland China Will be proxied')
        "
      >
        <Radio
          backgroundColor="#509594"
          v-model="isGlobalMode"
          :onText="$t('Global')"
          :offText="$t('Rule')"
        />
      </Hint>
    </div>
    <div
      class="w-full h-[calc(100%-70px)] scrolly"
      :loaded="true || isListLoaded"
    >
      <div
        v-for="proxy in proxies"
        :key="proxy.name"
        @click="changeProxy(proxy)"
        :style="{
          backgroundColor: proxy.name === currentProxyName ? '#D4D4D4' : '',
        }"
        class="border-b-[1px] px-4 py-3 flex items-center justify-between"
      >
        <div>
          <div>{{ proxy.name }}</div>
          <div class="flex gap-2 mt-2">
            <div
              v-for="tag in proxy.tags || []"
              :key="tag"
              class="bg-black text-white rounded-full text-xs px-[8px] py-[2px]"
            >
              {{ tag }}
            </div>
          </div>
        </div>
        <div>
          <div
            :style="{
              backgroundColor: ['#FDFDFE', '#CC1B2E', '#52C41A'][proxy.delay],
            }"
            class="w-2 h-2 rounded-full"
          ></div>
        </div>
      </div>
    </div>
    <div
      class="fixed w-12 h-12 rounded-full bg-opacity-80 left-1/2 -translate-x-1/2 bg-black bottom-4 flex items-center justify-center"
      @click="handleRefreshProfile"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        enable-background="new 0 0 24 24"
        viewBox="0 0 24 24"
        :class="{ spin: isProfileRefreshing }"
        class="w-7 h-7"
        fill="white"
      >
        <g><rect fill="none" height="24" width="24" /></g>
        <g>
          <path
            transform="scale (-1, 1)"
            transform-origin="center"
            d="M11.77,3c-2.65,0.07-5,1.28-6.6,3.16L3.85,4.85C3.54,4.54,3,4.76,3,5.21V9.5C3,9.78,3.22,10,3.5,10h4.29 c0.45,0,0.67-0.54,0.35-0.85L6.59,7.59C7.88,6.02,9.82,5,12,5c4.32,0,7.74,3.94,6.86,8.41c-0.54,2.77-2.81,4.98-5.58,5.47 c-3.8,0.68-7.18-1.74-8.05-5.16C5.11,13.3,4.71,13,4.27,13h0c-0.65,0-1.14,0.61-0.98,1.23C4.28,18.12,7.8,21,12,21 c5.06,0,9.14-4.17,9-9.26C20.86,6.86,16.65,2.88,11.77,3z M14,12c0-1.1-0.9-2-2-2s-2,0.9-2,2s0.9,2,2,2S14,13.1,14,12z"
          />
        </g>
      </svg>
    </div>
  </div>
</template>

<script>
import { downloadClashProfile, getServers } from '../../commons/api';
import { changeProxy, getProxies, testProxy } from '../../commons/clashRestful';
import Load from '../../components/Load.vue';
import Radio from '../../components/Radio.vue';
import Hint from '../../components/Hint.vue';
import { mapActions, mapMutations, mapState } from 'vuex';

const mainGroupName = 'Proxy';

export default {
  name: 'ProxyPage',
  data() {
    return {
      coreProxies: [],
      remoteProxies: [],
      currentProxyName: '',
      isListLoaded: true,
      intervalID: null,
      isProfileRefreshing: false,
    };
  },
  computed: {
    ...mapState({
      clashProfileUrl: (state) => state.app.clashProfileUrl,
    }),
    proxies() {
      if (this.coreProxies.length === 0) return [];
      const { [mainGroupName]: mg } = this.coreProxies;
      const names = mg.all;
      return names.map((name) => {
        const core = this.coreProxies[name];
        const history = core.history || [];
        const delay =
          history.length === 0
            ? 0
            : history[history.length - 1].delay === 0
            ? 1
            : 2;
        const server = this.remoteProxies.find((p) => p.name === name) || {};
        return {
          ...server,
          ...core,
          delay,
        };
      });
    },
  },
  watch: {},
  methods: {
    ...mapMutations(['setClashProfileContent']),
    ...mapActions(['refreshClashProfile']),
    async handleRefreshProfile() {
      if (this.isProfileRefreshing) return;
      this.isProfileRefreshing = true;
      try {
        if (this.clashProfileUrl) {
          await this.refreshClashProfile(this.clashProfileUrl);
          this.$toast({
            message: this.$t('Configuration has been synchronized'),
          });
        }
      } catch (e) {
        this.$toast({
          message: this.$t('Configuration fail to sync'),
        });
      }
      this.isProfileRefreshing = false;
    },
    async changeProxy({ name }) {
      const success = await changeProxy(mainGroupName, name);
      if (success) {
        this.currentProxyName = name;
      }
      this.$emit('deep-close');
    },
    async fetchCoreProxies() {
      const { proxies } = await getProxies();
      const { [mainGroupName]: mg } = proxies;
      this.currentProxyName = mg.now;
      this.coreProxies = proxies;
    },
    async setup() {
      await this.fetchCoreProxies();
      this.intervalID = setInterval(this.fetchCoreProxies, 2000);
      const servers = await getServers();
      this.remoteProxies = servers;
    },
  },
  mounted() {
    this.setup().finally(() => {
      this.isListLoaded = true;
    });
  },
  beforeDestroy() {
    this.intervalID && clearInterval(this.intervalID);
  },
  components: { Load, Radio, Hint },
};
</script>

<style scoped>
.spin {
  @apply animate-spin;
}
</style>
