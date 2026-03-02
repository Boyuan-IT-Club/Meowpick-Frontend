<script setup lang="ts">
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
  <scroll-view scroll-y style="height: 100%" @scrolltolower="bottom">
    <slot />
  </scroll-view>
</template>

<style scoped lang="scss" src="./style.scss" />
