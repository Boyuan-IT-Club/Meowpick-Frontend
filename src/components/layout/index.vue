<script setup lang="ts">
import { useThemeStore } from "@/config";
const themeStore = useThemeStore();
const isDark = computed(() => { if (themeStore.theme === 'dark') return true; if (themeStore.theme === 'system') return uni.getSystemInfoSync().theme === 'dark'; return false; });
let bottomHeight = computed(() =>
  [
    "",
    "/pages/index/index/index",
    "/pages/group/index/index",
    "/pages/find/index/index",
    "/pages/message/index/index",
    "/pages/user/index/index"
  ].includes(useRouteStore().url.trim())
);
const props = defineProps({
  color: { type: String, default: "#fff" }
});
const emits = defineEmits("onBottom");

function bottom() {
  emits("onBottom");
}
</script>
<template>
  <div
    class="root"
    :class="{ 'dark-mode': isDark }"
    :style="{
      background: `${color}`,
      height: `calc(100vh - env(safe-area-inset-bottom) - ${
        bottomHeight ? 50 : 0
      }px)`,
      maxHeight: `calc(100vh - env(safe-area-inset-bottom) - ${
        bottomHeight ? 50 : 0
      }px)`
    }"
  >
    <scroll @bottom="bottom">
      <slot />
    </scroll>
  </div>
</template>
<style scoped lang="scss" src="./style.scss" />
