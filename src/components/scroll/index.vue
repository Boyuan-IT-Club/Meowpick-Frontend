<script setup lang="ts">
type Props = {};
const props = defineProps<Props>();
const emit = defineEmits(["bottom"]);

function bottom() {
  console.log('[Scroll] Triggered scrolltolower');
  emit("bottom");
}
</script>
<template>
  <scroll-view 
    scroll-y 
    class="scroll-view-native"
    @scrolltolower="bottom" 
    :lower-threshold="200"
    :scroll-with-animation="true"
    :enhanced="true"
    :show-scrollbar="false"
  >
    <slot />
  </scroll-view>
</template>

<style scoped lang="scss">
.scroll-view-native {
  width: 100vw;
  height: 100vh; /* 强制满屏高度，确保滚动触发 */
  display: block;
  position: relative;
  -webkit-overflow-scrolling: touch;
}
</style>
