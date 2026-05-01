<template>
  <view class="timeline-container">
    <view v-for="(item, index) in data" :key="index" class="timeline-item">
      <!-- Timeline Column -->
      <view class="timeline-column">
          <!-- Dot -->
          <view class="dot"></view>
          <!-- Line -->
          <!-- Hide line for last item? Usually continuous timeline extends, but maybe not last one. -->
          <!-- User said "incoherent", implies gaps. My previous fix tries to bridge gaps. -->
          <view class="line" v-if="index !== data.length - 1"></view>
          <view class="line" v-else style="background: linear-gradient(to bottom, #e0e0e0, transparent);"></view>
      </view>
      
      <!-- Content Card -->
      <view class="content-card">
        <view class="header-row">
           <text class="version-title">{{ item[0] }}</text>
        </view>
        <view class="content-body">
          <view v-for="(line, lineIndex) in item.slice(1)" :key="lineIndex" class="content-row">
            <text class="content-text">{{ line }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
type Props = {
  data: string[][]; // Receive full array of arrays
};
withDefaults(defineProps<Props>(), {});
</script>

<style scoped lang="scss">
.timeline-container {
    padding: 32rpx;
    padding-top: 0; /* Handled by parent */
}

.timeline-item {
    display: flex;
    flex-direction: row;
    position: relative;
    padding-bottom: 48rpx; /* Space between items */
}

.timeline-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 48rpx; 
    margin-right: 24rpx;
    position: relative;
    flex-shrink: 0;
}

.dot {
    width: 20rpx;
    height: 20rpx;
    background-color: #c8102e; /* Brand Red */
    border-radius: 50%;
    margin-top: 36rpx; /* Align with card title */
    box-shadow: 0 0 0 6rpx rgba(200, 16, 46, 0.15); 
    z-index: 2;
    position: relative;
}

.line {
    width: 4rpx; 
    background-color: #e0e0e0;
    position: absolute;
    top: 56rpx; /* Start below dot */
    bottom: 0; /* Extend to bottom of this item container */
    left: 50%;
    transform: translateX(-50%);
    z-index: 1;
}

.content-card {
    flex: 1;
    background: #fff;
    border-radius: 20rpx;
    padding: 32rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.header-row {
  margin-bottom: 20rpx;
  .version-title {
    font-size: 32rpx;
    font-weight: 700;
    color: #333;
  }
}

.content-body {
  .content-row {
    margin-bottom: 12rpx;
    .content-text {
      font-size: 28rpx;
      color: #666;
      line-height: 1.6;
    }
  }
}
</style>
