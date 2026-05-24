<template>
  <view class="main-container">
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
    <view class="bottom-tab-bar safe-area-bottom">
      
      <!-- 文字容器 -->
      <view class="tabs-container">
        <view 
          class="tab-item" 
          :class="{ active: currentIndex === 0 }"
          @click="switchTab(0)"
        >
          首页
        </view>
        <view 
          class="tab-item" 
          :class="{ active: currentIndex === 1 }"
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
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onShow, onLoad } from '@dcloudio/uni-app';
// 暂时使用占位组件，后续会替换为真实组件
import HomeView from '@/components/home-view/index.vue';
import ProfileView from '@/components/profile-view/index.vue';

const currentIndex = ref(0);
const indicatorLeft = ref(25); // 初始值 25%
let windowWidth = 0;

onLoad(() => {
  const sysInfo = uni.getSystemInfoSync();
  windowWidth = sysInfo.windowWidth;
});

onShow(() => {
  uni.hideTabBar();
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

<style lang="scss" scoped>
.main-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  // 背景色稍微加深一点点，让白色组件反差更好看
  background-color: #f2f3f5;
}

.content-swiper {
  flex: 1;
  height: 100%; // 确保占满
}

.scroll-view {
  height: 100%;
}

.tab-bar-placeholder {
  height: 160rpx; // 调整高度，匹配新的通栏高度
  width: 100%;
}

.bottom-tab-bar {
  position: absolute;
  bottom: 0; 
  left: 0;
  width: 100%; 
  
  height: auto; // 由内容撑开，不再固定死高度，避免布局冲突
  min-height: 100rpx;
  
  background-color: rgba(255, 255, 255, 0.98); 
  border-top-left-radius: 40rpx; 
  border-top-right-radius: 40rpx;
  
  // 底部安全区适配：只作为 padding 存在，不参与定位计算
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  
  box-shadow: 0 -10rpx 40rpx rgba(0, 0, 0, 0.04);

  display: flex;
  flex-direction: column; 
  justify-content: flex-start;
  
  border-top: none;

  // 包裹文字的容器层
  .tabs-container {
      display: flex;
      width: 100%;
      height: 100rpx; // 给定明确高度，确保文字垂直位置固定
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
      transform: scale(0.95);
    }

    &.active {
      font-weight: 700; 
      color: #1a1a1a; 
      font-size: 36rpx; 
    }
  }

  // 指示条 (独立图层)
  .indicator-line {
    position: absolute;
    
    // 关键修改：改为相对于 top 定位
    // 既然文字容器高度是 100rpx，文字居中（中心点 50rpx），
    // 那么我们将指示条固定在 82rpx 的位置，永远在文字下方，
    // 不受底部 safe-area 或 padding 影响。
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
</style>
