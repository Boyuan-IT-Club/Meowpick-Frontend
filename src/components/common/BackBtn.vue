<template>
  <view class="back-btn" @click="handleBack" :style="customStyle">
    <view class="css-back-arrow"></view>
  </view>
</template>

<script setup lang="ts">
// @ts-nocheck
import { computed } from 'vue';

const props = defineProps<{
  customStyle?: string | object;
  color?: string; // allow color override
}>();

const emit = defineEmits(['click', 'back']); // Add click event

const handleBack = () => {
  // Try navigateBack, catch failure
  uni.navigateBack({
    delta: 1,
    fail: () => {
      // Fallback to home if fail (e.g., direct link entry)
      uni.switchTab({
        url: '/pages/home/home'
      });
    }
  });
  emit('click'); // Still emit click for tracking or custom behavior
};
</script>

<style scoped>
.back-btn {
  /* Ensure container doesn't force margin that breaks layout */
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

/* Simple solid arrow using borders */
.css-back-arrow {
    width: 22rpx; 
    height: 22rpx;
    transform: rotate(45deg);
    margin-left: 2rpx; /* Shifted left by reducing left margin */
    border-bottom: 4.5rpx solid #c8102e; /* Thicker solid theme color */
    border-left: 4.5rpx solid #c8102e;   /* Thicker solid theme color */
    border-radius: 4rpx; 
}
</style>
