<template>
  <view class="find-page">
    <find :initial-mode="mode" ref="findRef" />
  </view>
</template>

<script setup lang="ts">
// 只需要引入我们重写好的 find 组件
import find from "@/components/find/index.vue";
import { onShow, onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';

const mode = ref('');
const findRef = ref<InstanceType<typeof find> | null>(null);

onLoad((options: any) => {
    if (options && options.mode) {
        mode.value = options.mode;
    }
});

onShow(() => {
  // 隐藏原生 TabBar，确保全屏体验
  // 增加 try-catch 避免在非 TabBar 页面调用报错
  try {
      uni.hideTabBar();
  } catch (e) {
      console.warn('hideTabBar failed:', e);
  }
  
  if (findRef.value && findRef.value.resumeState) {
      findRef.value.resumeState();
  }
});
</script>

<style scoped>
.find-page {
  width: 100%;
  height: 100vh;
  background-color: #f7f8fa;
}
</style>
