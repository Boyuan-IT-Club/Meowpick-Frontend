<script setup lang="ts">
import { useThemeStore } from "@/config";
const themeStore = useThemeStore();
const isDark = computed(() => { if (themeStore.theme === 'dark') return true; if (themeStore.theme === 'system') return uni.getSystemInfoSync().theme === 'dark'; return false; });
type Props = {};
const props = defineProps<Props>();
const emit = defineEmits<{
  bottom;
}>();

function bottom() {
  emit("bottom");
}
</script>
<template>
  <scroll-view scroll-y style="height: 100%" @scrolltolower="bottom" :class="{ 'dark-mode': isDark }">
    <slot />
  </scroll-view>
</template>

<style scoped lang="scss" src="./style.scss" />
