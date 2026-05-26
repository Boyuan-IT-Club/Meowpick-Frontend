<script setup lang="ts">
import { useThemeStore } from "@/config";
const themeStore = useThemeStore();
const isDark = computed(() => { if (themeStore.theme === 'dark') return true; if (themeStore.theme === 'system') return uni.getSystemInfoSync().theme === 'dark'; return false; });
  percent: number;
}>();
const spanStyle = computed(() => ({
  width: `${(150 * props.percent) / 100}px`,
  position: "absolute",
  left: 0,
  top: "0px",
  height: "8px",
  "background-color": "orange",
  "border-radius": "2px"
}));
</script>

<template>
  <div class="index">
    <span :style="spanStyle" />
  </div>
</template>

<style lang="scss" scoped>
.index {
  position: relative;
  margin-left: 10px;
  width: 150px;
  height: 8px;
  background: rgba(233, 233, 235, 0.33);
  border-radius: 2px;
}
</style>
