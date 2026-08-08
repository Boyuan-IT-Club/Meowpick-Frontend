<script setup lang="ts">
import { Init } from "@/utils/init";
import { useThemeStore } from "@/config";
const themeStore = useThemeStore();

onLaunch(() => {
  applyThemeToNativeBar(themeStore.mode);
  Init();
});
onShow(() => {});
onHide(() => {});

watch(
  () => themeStore.mode,
  (mode) => {
    applyThemeToNativeBar(mode);
  }
);

function applyThemeToNativeBar(mode: "light" | "dark") {
  const isDark = mode === "dark";
  try {
    uni.setNavigationBarColor({
      frontColor: isDark ? "#ffffff" : "#000000",
      backgroundColor: isDark ? "#1e1e1e" : "#F8F8F8",
      animation: { duration: 0, timingFunc: "linear" }
    });
    uni.setBackgroundColor?.({
      backgroundColor: isDark ? "#121212" : "#F8F8F8",
      backgroundColorTop: isDark ? "#121212" : "#F8F8F8",
      backgroundColorBottom: isDark ? "#121212" : "#F8F8F8"
    });
  } catch (e) {}
}
</script>
<template>
  <view :class="themeStore.themeClass">
    <slot />
  </view>
</template>
<style lang="scss">
@import "nutui-uniapp/styles/index";

page {
  width: 100%;
  height: 100%;
}

view {
  box-sizing: border-box;
}

input {
  box-sizing: border-box;
}
</style>