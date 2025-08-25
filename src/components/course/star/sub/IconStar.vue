<script setup lang="ts">
const props = defineProps<{
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
