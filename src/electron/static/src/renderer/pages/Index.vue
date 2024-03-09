<template>
  <div
    
	style="background-color: #171B37;"
  >
<!--    <h1 class="text-3xl mt-3">Shadowfly</h1>-->
<!--    <span class="text-xs mt-2 opacity-70"-->
<!--      >Easy science online to enjoy the ultimate experience</span-->
<!--    >-->
<!--    <div-->
<!--      class="bg-main text-sm shadow w-[360px] rounded-full h-10 text-center flex items-center justify-center mt-[160px]"-->
<!--    >-->
<!--      {{ $t('Login') }}-->
<!--    </div>-->
<!--    <div class="flex-grow"></div>-->
<!--    <div class="text-sm" @click="handleShowRegisterPannel">-->
<!--      {{ $t('Register now') }}-->
<!--    </div> &ndash;&gt;-->

    <Login class="absolute" />
  </div>
</template>

<script>
import Slider from '../components/Slider.vue';
import Login from './Index/Login.vue';
export default {
  name: 'IndexPage',
  components: { Slider, Login },
  data() {
    return {
      pannelComponent: null,
    };
  },
  methods: {
    handleShowResetPannel() {
      this.pannelComponent = Login;
    },
    handleShowRegisterPannel() {
      this.pannelComponent = Register;
    },
  },
};
</script>
