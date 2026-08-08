<template>
  <view class="find-page" :class="themeStore.themeClass">
    <find :initial-mode="mode" ref="findRef" />
  </view>
</template>

<script setup lang="ts">
import find from "@/components/find/index.vue";
import { onShow, onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { useThemeStore } from '@/config';

const themeStore = useThemeStore();

const mode = ref('');
const findRef = ref<InstanceType<typeof find> | null>(null);

onLoad((options: any) => {
    if (options && options.mode) {
        mode.value = options.mode;
    }
});

onShow(() => {
  try { uni.hideTabBar(); } catch (e) {}
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

.find-page.dark-theme {
  background-color: #121212;
}
</style>
