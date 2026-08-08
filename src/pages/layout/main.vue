<template>
  <view class="main-container" :class="themeStore.themeClass">
    <!-- 顶部内容区 -->
    <swiper
      class="content-swiper"
      :current="currentIndex"
      @change="onSwiperChange"
      @transition="onSwiperTransition"
      @animationfinish="onSwiperAnimationFinish"
      duration="300"
    >
      <!-- 首页 -->
      <swiper-item>
        <scroll-view scroll-y class="scroll-view">
          <home-view />
          <!-- 底部占位，防止被悬浮导航栏遮挡 -->
          <view class="tab-bar-placeholder"></view>
        </scroll-view>
      </swiper-item>

      <!-- 我的 -->
      <swiper-item>
        <scroll-view scroll-y class="scroll-view">
          <profile-view />
          <!-- 底部占位 -->
          <view class="tab-bar-placeholder"></view>
        </scroll-view>
      </swiper-item>
    </swiper>

<!-- 底部导航栏 -->
    <view class="bottom-tab-bar safe-area-bottom" :class="themeStore.themeClass">

      <!-- 文字容器 -->
      <view class="tabs-container">
        <view
          class="tab-item"
          :class="[themeStore.themeClass, { active: currentIndex === 0 }]"
          @click="switchTab(0)"
        >
          首页
        </view>
        <view
          class="tab-item"
          :class="[themeStore.themeClass, { active: currentIndex === 1 }]"
          @click="switchTab(1)"
        >
          我的
        </view>
      </view>

      <!-- 指示条 (独立图层) -->
      <view
        class="indicator-line"
        :style="{ left: indicatorLeft + '%' }"
      ></view>

    </view>

    <!-- More Button (☰) - 移至 profile-view 内部，与筛选胶囊同步滚动 -->

    <!-- Popover 由 profile-view 触发 -->

  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onShow, onLoad } from '@dcloudio/uni-app';
import HomeView from '@/components/home-view/index.vue';
import ProfileView from '@/components/profile-view/index.vue';
import { useThemeStore } from '@/config';
const themeStore = useThemeStore();

const currentIndex = ref(0);
const indicatorLeft = ref(25); // 初始值 25%
let windowWidth = 0;
let menuButtonTopRpx = 0; // rpx 单位
let menuButtonHeightRpx = 0; // rpx 单位

// 胶囊位置计算（px → rpx 转换，确保单位统一）
const sysInfoForMenu = uni.getSystemInfoSync();
const screenWidth = sysInfoForMenu.windowWidth || 375;
const PX_TO_RPX = 750 / screenWidth; // px → rpx 转换比例

try {
  const res = uni.getMenuButtonBoundingClientRect();
  if (res && res.top) {
    menuButtonTopRpx = res.top * PX_TO_RPX;
    menuButtonHeightRpx = res.height * PX_TO_RPX;
  } else {
    menuButtonTopRpx = (sysInfoForMenu.statusBarHeight ? sysInfoForMenu.statusBarHeight + 4 : 48) * PX_TO_RPX;
  }
} catch (e) {
  menuButtonTopRpx = (sysInfoForMenu.statusBarHeight ? sysInfoForMenu.statusBarHeight + 4 : 48) * PX_TO_RPX;
}

// ⋯ 按钮已迁回 profile-view 内部，与筛选胶囊同步滚动
// showMoreMenu / toggleMoreMenu / handleMenuClick 在 profile-view 中定义

onLoad(() => {
  const sysInfo = uni.getSystemInfoSync();
  windowWidth = sysInfo.windowWidth;
});

onShow(() => {
  try { uni.hideTabBar(); } catch (e) {}
});

function switchTab(index: number) {
  currentIndex.value = index;
}

function onSwiperChange(e: any) {
  // 仅仅处理 current 更新，不处理 UI 逻辑，避免冲突
  currentIndex.value = e.detail.current;
}

function onSwiperTransition(e: any) {
  // 核心逻辑：指示条跟随滑动
  // 两个 Tab 中心点距离为 50% (25 -> 75)
  // 滑动全程 (dx = windowWidth) 对应指示条移动 50%
  if (windowWidth === 0) return;
  
  const dx = e.detail.dx;
  // 计算移动百分比
  const movePercent = (dx / windowWidth) * 50;
  
  // 基础位置：根据当前的 currentIndex 决定
  const baseLeft = currentIndex.value === 0 ? 25 : 75;
  
  let targetLeft = baseLeft + movePercent;

  // 边界限制，防止快速滑动时因 currentIndex 切换导致计算值飞出
  // 强制限制在 [25, 75] 区间内
  targetLeft = Math.max(25, Math.min(75, targetLeft));
  
  indicatorLeft.value = targetLeft;
}

function onSwiperAnimationFinish(e: any) {
  // 动画结束后，强制校正位置，消除可能的浮点数误差
  currentIndex.value = e.detail.current;
  indicatorLeft.value = currentIndex.value === 0 ? 25 : 75;
}
</script>

<style lang="scss">
/* Global More Button - 胶囊风格，与筛选胶囊统一 */
.global-more-btn {
  transition: transform 0.15s, background-color 0.15s, box-shadow 0.15s;

  &:active {
    transform: scale(0.96);
    background-color: #f5f5f5 !important;
  }
}

.global-more-btn.dark-theme {
  &:active {
    background-color: #3a3a3a !important;
  }
}

/* Popover - 位置由 inline style 控制，紧邻 ⋯ 按钮下方 */
.global-more-popover {
  background-color: #ffffff;
  border-radius: 24rpx;
  box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.15);
  padding: 12rpx 0;
  z-index: 10000;
  min-width: 240rpx;
  overflow: hidden;

  .menu-item {
    padding: 24rpx 32rpx;
    font-size: 28rpx;
    color: #333;
    transition: background-color 0.1s;

    &:active {
      background-color: #f5f5f5;
    }
  }
}

.global-more-popover.dark-theme {
  background-color: #2a2a2a;
  box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.5);

  .menu-item {
    color: #e0e0e0;

    &:active {
      background-color: #3a3a3a;
    }
  }
}

.global-more-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9998;
}
</style>

<style lang="scss" scoped>
.main-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f2f3f5;
}

.content-swiper {
  flex: 1;
  height: 100%;
}

.scroll-view {
  height: 100%;
}

.tab-bar-placeholder {
  height: 160rpx;
  width: 100%;
}

.bottom-tab-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;

  height: auto;
  min-height: 100rpx;

  background-color: rgba(255, 255, 255, 0.98);
  border-top-left-radius: 40rpx;
  border-top-right-radius: 40rpx;

  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);

  box-shadow: 0 -10rpx 40rpx rgba(0, 0, 0, 0.04);

  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  border-top: none;

  .tabs-container {
      display: flex;
      width: 100%;
      height: 100rpx;
      align-items: center;
      margin-top: 0;
      position: relative;
      z-index: 2;
  }

  .tab-item {
    flex: 1;
    padding-top: 0;
    display: flex;
    justify-content: center;
    align-items: center;

    font-size: 34rpx;
    color: #9ea1a6;
    font-weight: 500;
    transition: all 0.12s cubic-bezier(0.25, 0.8, 0.25, 1);

    &:active {
      transform: scale(0.94);
    }

    &.active {
      font-weight: 700;
      color: #1a1a1a;
      font-size: 36rpx;
    }
  }

  .indicator-line {
    position: absolute;

    top: 86rpx;
    bottom: auto;

    width: 48rpx;
    height: 8rpx;
    background: linear-gradient(90deg, #b70030, #ff4d6a);
    border-radius: 10rpx;

    transform: translateX(-50%);
    transition: left 0.1s linear;
    z-index: 3;

    box-shadow: 0 4rpx 12rpx rgba(183, 0, 48, 0.4);
  }
}

.main-container.dark-theme {
  background-color: #121212;
}

.bottom-tab-bar.dark-theme {
  background-color: rgba(30, 30, 30, 0.98);
  box-shadow: 0 -10rpx 40rpx rgba(0, 0, 0, 0.4);
}

.tab-item.dark-theme {
  color: #666;

  &.active {
    color: #e0e0e0;
  }
}
</style>
