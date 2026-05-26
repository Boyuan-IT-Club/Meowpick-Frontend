<script setup lang="ts">
import { useThemeStore } from "@/config";
const themeStore = useThemeStore();
const isDark = computed(() => { if (themeStore.theme === 'dark') return true; if (themeStore.theme === 'system') return uni.getSystemInfoSync().theme === 'dark'; return false; });
  star: number;
}>();
</script>

<template>
  <span class="icon-star"> {{ star }} 星 </span>
</template>

<style scoped lang="scss">
.icon-star {
  width: 10px;
  height: 10px;

  .img {
    width: 100%;
    height: 100%;
  }
}
</style>
