<template>
  <view class="letter-container">
    <image src="@/images/cat.png" class="background-cat" mode="aspectFill" />
    <view class="custom-header" :style="{ paddingTop: menuButtonInfo.top + 'px' }">
        <view class="nav-bar-content" :style="{ height: menuButtonInfo.height + 'px' }">
            <view class="back-area" @click="goBack" :style="{ width: menuButtonInfo.height + 'px', height: menuButtonInfo.height + 'px' }">
                <BackBtn />
            </view>
            <view class="title-area">
                <text class="page-title">致用户的一封信</text>
            </view>
        </view>
    </view>

    <!-- Content Card -->
    <!-- Content starts below header -->
    <view class="content-card" :style="{ marginTop: (menuButtonInfo.top + menuButtonInfo.height + 20) + 'px' }">
      <view class="card-body">
        <text class="paragraph">{{ text1 }}</text>
        <text class="paragraph">{{ text2 }}</text>
        <text class="paragraph highlight">{{ text3 }}</text>
        
        <text class="paragraph">{{ text5 }}</text>
        <text class="paragraph highlight">{{ text6 }}</text>
        <text class="paragraph">{{ text7 }}</text>
        
        <text class="paragraph">{{ text9 }}</text>
        <text class="paragraph">{{ text10 }}</text>
      </view>
      <view class="card-footer">
        <text class="footer-text">{{ text11 }}</text>
        <text class="signature">{{ text12 }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from "@dcloudio/uni-app";
import BackBtn from "@/components/common/BackBtn.vue";

const sysInfo = uni.getSystemInfoSync();
let menuButtonInfo = { // Initialize menuButtonInfo
    top: sysInfo.statusBarHeight ? sysInfo.statusBarHeight : 20,
    height: 32
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

onLoad(() => {
  // 当用户访问这封信时，标记为已读
  uni.setStorageSync('hasReadLetter', true);
});

const text1 = `全新版的 选课猫 终于和大家见面啦！`;
const text2 = `原开发团队的朋友们大多已经毕业或升学，因此选课猫曾有一段时间陷入无人维护的状态。`;
const text3 = `在 2025 年暑假，我们新团队正式接过选课猫的维护与重构任务。`;

const text5 = `也许大家暂时不会觉得新版有太多变化，这是因为我们暂未增加新功能。`;
const text6 = `但事实上，我们已经彻底重构了选课猫的整体后端架构，让系统更加稳定流畅。`;
const text7 = `今后在选课高峰期，也不再那么容易出现崩溃的情况啦！`;

const text9 = `未来，我们还计划逐步推出更多功能，`;
const text10 = `包括大家期待已久的「新增课程和老师」功能等。`;
const text11 = `感谢大家一直以来对选课猫的喜爱与支持 ❤`;
const text12 = `选课猫团队 2025年10月13日`;
</script>

<style scoped lang="scss">
.letter-container {
  min-height: 100vh;
  background-color: #f7f8fa; /* 浅灰底色 */
  position: relative;
  overflow: hidden;
  padding: 0 32rpx 40rpx; /* Remove top padding as it's handled by margin-top */
  box-sizing: border-box;
}

.custom-header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 100;
    background-color: transparent; /* Initially transparent */
    /* If user scrolls, maybe add background? For simplified view, let's keep transparent or light blur */
    backdrop-filter: blur(5px);
}

.nav-bar-content {
    display: flex;
    align-items: center;
    position: relative;
    padding-left: 32rpx; /* Left padding for back button alignment */
}

.back-area {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.title-area {
    margin-left: 32rpx; /* Gap = padding-left of navbar */
    position: static; /* Force reset */
    left: auto; /* Reset */
    transform: none; /* Reset */
    display: flex; /* Ensure container behaves flexily or normally */
    align-items: center;
}

.page-title {
    position: static; /* Remove any absolute positioning */
    left: auto; /* Reset left */
    transform: none; /* Reset transform */
    font-size: 32rpx;
    font-weight: 700;
    color: #333;
    display: block; /* Ensure it takes up space correctly */
}

.background-cat {
    position: fixed;
    right: -200rpx;
    bottom: -100rpx;
    width: 600rpx;
    height: 600rpx;
    opacity: 0.15;
    z-index: 0;
    pointer-events: none;
}

.content-card {
    position: relative;
    z-index: 1;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 24rpx;
    padding: 48rpx 40rpx;
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.06);
    backdrop-filter: blur(10px);
}

.card-body {
    .paragraph {
        display: block;
        font-size: 30rpx;
        color: #555;
        line-height: 1.8;
        margin-bottom: 24rpx;
        text-align: justify;
        
        &.highlight {
            color: #c8102e;
            font-weight: 500;
        }
    }
}

.card-footer {
    margin-top: 60rpx;
    padding-top: 40rpx;
    border-top: 2rpx dashed #eee;
    text-align: center;
    
    .footer-text {
        display: block;
        font-size: 28rpx;
        color: #333;
        font-weight: 600;
        margin-bottom: 16rpx;
    }
    
    .signature {
        display: block;
        font-size: 24rpx;
        color: #999;
    }
}
</style>