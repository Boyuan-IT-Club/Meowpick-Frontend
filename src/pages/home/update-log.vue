<template>
  <view class="background"> <!-- Content starts below header -->
    <image src="@/images/cat.png" class="background-image" mode="widthFix" />
    
    <!-- Custom Header -->
    <view class="custom-header" 
          :style="{ 
              height: (menuButtonInfo.top + menuButtonInfo.height + 12) + 'px',
              paddingTop: menuButtonInfo.top + 'px'
          }"
    >
        <view class="nav-bar-content" :style="{ height: menuButtonInfo.height + 'px' }">
            <view class="back-btn-wrapper" @click="goBack" :style="{ width: menuButtonInfo.height + 'px', height: '100%' }">
                <BackBtn />
            </view>
            <view class="title-wrapper">
                <text class="page-title">版本更新日志</text>
            </view>
        </view>
    </view>
    
    <!-- Content -->
    <view class="log-list" :style="{ paddingTop: (menuButtonInfo.top + menuButtonInfo.height + 12 + 20) + 'px' }">
      <view class="timeline-container">
         <!-- Pass entire array to InformationBox -->
         <InformationBox :data="UpdateLog" />
      </view>
      <view style="height: 60rpx;"></view> <!-- 底部留白 -->
    </view>
  </view>
</template>

<script setup lang="ts">
import InformationBox from "@/pages/home/InformationBox.vue";
import { UpdateLog } from "./information";
import BackBtn from "@/components/common/BackBtn.vue";
import { onShow, onLoad } from "@dcloudio/uni-app";

// System Info Logic - Same as other pages
const sysInfo = uni.getSystemInfoSync();
let menuButtonInfo = { 
    top: sysInfo.statusBarHeight ? sysInfo.statusBarHeight : 20, // default if no status bar
    height: 32 // default menu height
};
try {
    const res = uni.getMenuButtonBoundingClientRect();
    if (res && res.top) {
        menuButtonInfo = {
            top: res.top,
            height: res.height
        };
    }
} catch (e) {}

const goBack = () => {
    uni.navigateBack();
};
</script>

<style scoped lang="scss">
.background {
  min-height: 100vh;
  background-color: #f7f8fa; /* 统一浅灰色底 */
  padding: 0 32rpx; 
  /* paddingTop is removed from here as it is handled in log-list */
  box-sizing: border-box;

  /* 移除旧的 fixed image，使用新的装饰方式 */
  .background-image {
    position: fixed;
    right: -20rpx;
    top: -20rpx;
    width: 300rpx;
    height: 300rpx;
    opacity: 0.1;
    z-index: 0;
    pointer-events: none;
    transform: rotate(15deg);
  }

  /* 增加顶部大标题 */
  .page-header {
    margin-bottom: 40rpx;
    padding-left: 24rpx; /* Increased padding */
    border-left: 8rpx solid #b20035;

    .title {
      font-size: 40rpx;
      font-weight: 800;
      color: #333;
      display: block;
      margin-bottom: 8rpx;
    }

    .subtitle {
      font-size: 24rpx;
      color: #999;
      display: block;
    }
  }

  .log-list {
    position: relative;
    z-index: 1;
  }

  .box {
    position: absolute;
    left: 2vw;
    top: 5vw;
    width: 96vw;
    height: auto;
    padding: 5vw;
    background: #ffffff;
    box-shadow: 1vw 1vw 6vw 3vw #0000001f;
    z-index: 1;
    opacity: 0.8;
    display: flex;
    flex-direction: column;
    border-radius: 1vw;
    word-wrap: break-word; /* 允许长单词或URL地址换行 */
    overflow-wrap: break-word; /* 允许在单词内部换行以避免溢出 */
    .title {
      display: flex;
      font-weight: bold;
      justify-content: center;
    }
    .text {
      white-space: pre-wrap;
      margin-top: 2vw;
      font-size: 4vw;
    }
  }
}

.custom-header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 999; /* Increased Z-Index significantly to be above content */
    background-color: #f7f8fa; /* Solid color matching page background */
    box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.05); /* Optional: Subtle shadow to show edge */
    
    .nav-bar-content {
        display: flex;
        align-items: center;
        padding-left: 32rpx; /* Match search page padding */
        position: relative;
        box-sizing: border-box;

        .back-btn-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .title-wrapper {
            position: static; /* Ensure static positioning */
            margin-left: 32rpx; /* Gap = padding-left of navbar */
            pointer-events: auto;
            text-align: left; /* Ensure text is left aligned */
            left: auto; /* Reset left */
            right: auto; /* Reset right */
            transform: none; /* Reset transform */

            .page-title {
                font-size: 32rpx;
                font-weight: 700;
                color: #333;
                display: block; /* Ensure block level */
            }
        }
    }
}
</style>
