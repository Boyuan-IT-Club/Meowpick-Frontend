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

    <!-- More Button (☰) - 仅在"我的"页可见，与胶囊右上角对齐 -->
    <view
      v-if="currentIndex === 1"
      class="global-more-btn"
      :class="themeStore.themeClass"
      :style="{
        top: (menuButtonTop + menuButtonHeight / 2 - 28) + 'px',
        position: 'fixed',
        right: '24px',
        width: '56px',
        height: '56px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '6px',
        borderRadius: '50%',
        backgroundColor: themeStore.mode === 'dark' ? '#2a2a2a' : '#ffffff',
        border: themeStore.mode === 'dark' ? '2px solid #ff6b8a' : '2px solid #b20035',
        boxShadow: themeStore.mode === 'dark' ? '0 6px 20px rgba(0,0,0,0.4)' : '0 6px 20px rgba(178,0,53,0.25)',
        zIndex: 9999
      }"
      @click="toggleMoreMenu"
    >
      <view
        :style="{
          width: '26px',
          height: '3px',
          backgroundColor: themeStore.mode === 'dark' ? '#ff6b8a' : '#b20035',
          borderRadius: '2px',
          display: 'block'
        }"
      ></view>
      <view
        :style="{
          width: '26px',
          height: '3px',
          backgroundColor: themeStore.mode === 'dark' ? '#ff6b8a' : '#b20035',
          borderRadius: '2px',
          display: 'block'
        }"
      ></view>
      <view
        :style="{
          width: '26px',
          height: '3px',
          backgroundColor: themeStore.mode === 'dark' ? '#ff6b8a' : '#b20035',
          borderRadius: '2px',
          display: 'block'
        }"
      ></view>
    </view>

    <!-- Popover -->
    <view v-if="showMoreMenu" class="global-more-popover" :class="themeStore.themeClass" @click.stop>
      <view class="menu-item" @click="handleMenuClick('theme')">切换深色模式</view>
      <view class="menu-item" @click="handleMenuClick('feed')">提议广场</view>
      <view class="menu-item" @click="handleMenuClick('nickname')">修改昵称</view>
      <view class="menu-item" @click="handleMenuClick('feedback')">反馈</view>
    </view>

    <!-- Popover Mask -->
    <view v-if="showMoreMenu" class="global-more-mask" @click="showMoreMenu = false"></view>
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
let menuButtonTop = 0;
let menuButtonHeight = 32;

// 胶囊位置计算
const sysInfoForMenu = uni.getSystemInfoSync();
try {
  const res = uni.getMenuButtonBoundingClientRect();
  if (res && res.top) {
    menuButtonTop = res.top;
    menuButtonHeight = res.height;
  } else {
    menuButtonTop = sysInfoForMenu.statusBarHeight ? sysInfoForMenu.statusBarHeight + 4 : 48;
  }
} catch (e) {
  menuButtonTop = sysInfoForMenu.statusBarHeight ? sysInfoForMenu.statusBarHeight + 4 : 48;
}

// 转发点击事件给 ProfileView
const showMoreMenu = ref(false);

const toggleMoreMenu = () => {
  showMoreMenu.value = !showMoreMenu.value;
};

const handleMenuClick = (action: 'theme' | 'feed' | 'nickname' | 'feedback') => {
  showMoreMenu.value = false;
  switch (action) {
    case 'theme':
      themeStore.toggleTheme();
      break;
    case 'feed':
      uni.navigateTo({ url: '/pages/proposal/feed/feed' });
      break;
    case 'nickname':
      uni.$emit('open-nickname-modal');
      break;
    case 'feedback':
      uni.$emit('open-feedback-modal');
      break;
  }
};

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
/* Global More Button - 在页面层级，脱离 scroll-view 嵌套 */
.global-more-btn {
  transition: transform 0.15s, background-color 0.15s, box-shadow 0.15s;

  &:active {
    transform: scale(0.92);
    background-color: #f5f5f5 !important;
  }
}

.global-more-btn.dark-theme {
  &:active {
    background-color: #3a3a3a !important;
  }
}

.global-more-popover {
  position: fixed;
  top: 50%;
  right: 24rpx;
  transform: translateY(-50%);
  background-color: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.15);
  padding: 12rpx 0;
  z-index: 10000;
  min-width: 240rpx;

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
