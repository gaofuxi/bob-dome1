<template>
  <div class='page'>
    <div class='m-t-77'>
      <div class='px-4 mt-3'>
        <div
          class='bg-heise w-full text-black rounded-lg px-4 py-3 mt-[6px] mb-4 flex flex-col gap-3'
        >
          <div
            @click="handleSelect({ code: 'auto' })"
            class='flex justify-between items-center border-b-[1px] pb-3'
          >
            <div class='flex align-center items-title'>
              <img width="26" height="18" src="../../../static/index/Setting/lang-default.jpg" style="margin-right: 10px"/>
              {{ $t('auto language') }}</div>
            <div class='items-title' v-if="['auto', undefined].includes(settings.language)">✓</div>
          </div>
          <div
            @click="handleSelect({ code: 'cn' })"
            class="flex justify-between items-center border-b-[1px] pb-3"
          >
            <div class="flex align-center items-title">
              <img width="26" height="18" src="../../../static/index/Setting/lang-cn.jpg" style="margin-right: 10px"/>
              简体中文</div>
            <div class='items-title' v-if="['cn', undefined].includes(settings.language)">✓</div>
          </div>
          <div class="separator"></div>
          <div
            @click="handleSelect({ code: 'en' })"
            class="flex justify-between items-center border-b-[1px] pb-3"
          >
            <div class="flex align-center items-title">
              <img width="26" height="18" src="../../../static/index/Setting/lang-en.jpg" style="margin-right: 10px"/>
              English</div>
            <div class='items-title' v-if="['en', undefined].includes(settings.language)">✓</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PageTitle from '../components/PageTitle.vue';

export default {
  name: '',
  components: { PageTitle },
  data() {
    return {
      langs: [
        {
          name: '中文',
          code: 'cn'
        },
        {
          name: 'English',
          code: 'en'
        }
      ]
    };
  },
  methods: {
    handleSelect({ code }) {
      this.settings.language = code;
    }
  }
};
</script>
<style scoped='scoped'>
.page {
  /* background: url(../../../static/index/User/bg.png);
  background-repeat: no-repeat;
  background-position: -104px 40px; */
  width: 700px;
  height: 520px;
}
.m-t-77 {
  margin-top: 77px;
}
.bg-heise{
  background: #24273F;
  width: 500px;
  margin: 0 auto;
}
.items-title {
  font-size: 14px;
  font-family: PingFang SC-Medium, PingFang SC;
  font-weight: 500;
  color: #A8A9B3;
  margin-left: 13px;
}
</style>
