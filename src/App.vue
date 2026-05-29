<script setup lang="ts">
import { Init } from "@/utils/init";
import { useThemeStore } from "@/config";
const themeStore = useThemeStore();

onLaunch(() => {
  Init()
});
onShow(() => {});
onHide(() => {});
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

.dark-theme page {
  background-color: #121212;
}
</style>
