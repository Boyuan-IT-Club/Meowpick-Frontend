<template>
  <view class="home-view-container" :class="themeStore.themeClass">
    <!-- 顶部欢迎语区域 -->
    <view class="header-welcome">
      <view class="welcome-Line">
        <text class="hello-text">Hello,</text>
        <text class="name-text">{{ userName }}</text>
      </view>
      <!-- Logo 图片超级放大，居中 -->
      <image src="/src/images/logo.png" mode="heightFix" class="brand-logo" />
    </view>
    
    <!-- 搜索区域 -->
    <view class="search-section" hover-class="search-hover" @click="goToSearch">
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <text class="search-placeholder">搜索课程、老师或吐槽...</text>
      </view>
    </view>

    <!-- 功能区域 (原 ToolBox) -->
    <view class="toolbox-section">
      <!-- 左侧：信件与日志 -->
      <view class="left-group">
        <view
          class="card-item letter-card"
          hover-class="card-hover"
          @click="goToLetter"
        >
          <text class="card-title">致用户的一封信</text>
          <text class="card-subtitle">To Users</text>
          <text class="card-bg-icon">✉️</text>
          <view v-if="showNewIcon" class="new-tag">NEW</view>
        </view>

<view
          class="card-item log-card"
          hover-class="card-hover"
          @click="goToUpdate"
        >
          <text class="card-title">更新日志</text>
          <text class="card-subtitle">Update Logs</text>
          <text class="card-bg-icon">📝</text>
        </view>
      </view>

      <!-- 右侧：吐槽统计 -->
      <view class="right-group">
        <view class="stat-card">
          <view class="stat-title">已收录吐槽</view>
          <view class="stat-number">{{ totalComment }}</view>
          <view class="stat-unit">条</view>
        </view>
      </view>
    </view>

    <!-- 首次使用引导弹窗 -->
    <view v-if="showGuide" class="guide-overlay" :class="themeStore.themeClass" @click="hideGuide">
      <view class="guide-content" @click.stop>
        <view class="guide-header">
          <text class="guide-title">欢迎使用选课猫 🎉</text>
          <text class="guide-subtitle">华东师范大学选课经验分享平台</text>
        </view>
        <view class="guide-sections">
          <view class="guide-section">
            <view class="section-icon">💬</view>
            <view class="section-text">
              <text class="section-title">吐槽课程</text>
              <text class="section-desc">搜索已开设的课程，了解学长评价，选择心仪的选修课</text>
            </view>
          </view>
          <view class="guide-section">
            <view class="section-icon">📝</view>
            <view class="section-text">
              <text class="section-title">提议新课程</text>
              <text class="section-desc">搜索不到想要的课？发起提议，让大家一起投票支持</text>
            </view>
          </view>
          <view class="guide-section">
            <view class="section-icon">🏫</view>
            <view class="section-text">
              <text class="section-title">闵行 & 普陀</text>
              <text class="section-desc">两个校区的课程都有收录，搜索时可按校区筛选</text>
            </view>
          </view>
        </view>
        <view class="guide-footer">
          <button class="start-btn" @click="hideGuide">我知道了</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { waitForLogin } from '@/utils/init';
import { http, useThemeStore } from '@/config';
const themeStore = useThemeStore();

// 状态定义
const totalComment = ref(0);
const showNewIcon = ref(true);
const userName = ref('同学');

// 首次使用引导弹窗
const showGuide = ref(false);
const GUIDE_KEY = 'meowpick_guide_seen';

// 生命周期
onMounted(async () => {
  await waitForLogin();
  fetchTotalComment();

  const storedUser = uni.getStorageSync('userInfo');
  if (storedUser && storedUser.nickName) {
      userName.value = storedUser.nickName;
  }

  const hasReadLetter = uni.getStorageSync('hasReadLetter');
  showNewIcon.value = !hasReadLetter;

  // 检查是否首次使用
  const hasSeenGuide = uni.getStorageSync(GUIDE_KEY);
  if (!hasSeenGuide) {
    showGuide.value = true;
  }
});

const fetchTotalComment = () => {
  http.CommentController.searchTotalList().then((res: any) => {
    totalComment.value = res?.data?.data?.count || res?.data?.count || 0;
  }).catch((err: any) => {
    console.error('[home-view] fetchTotalComment error:', err);
  });
};

// 路由跳转
const hideGuide = () => {
  showGuide.value = false;
  uni.setStorageSync(GUIDE_KEY, true);
};

const goToSearch = () => {
  // 原有逻辑：导向搜索页面
  uni.navigateTo({ url: "/pages/find/index/index" });
};

const goToLetter = () => {
  // 1. 先记录状态，确保 UI 立即响应
  showNewIcon.value = false;
  try {
      uni.setStorageSync('hasReadLetter', true);
  } catch (e) {
      console.error('[home-view] setStorageSync error:', e);
  }
  
  // 2. 然后立即跳转，不等待 storage 写入
  uni.navigateTo({ url: "/pages/home/letter" });
};

const goToUpdate = () => {
  uni.navigateTo({ url: "/pages/home/update-log" });
};
</script>

<style scoped lang="scss">
// 变量定义
$brand-red: #c8102e; // 更加通透的亮红色
$brand-light-bg: #fff1f1; // 极淡的粉红背景
$card-bg: #ffffff;
$text-main: #2c2c2c;

.home-view-container {
  min-height: 100vh;
  padding: 120rpx 40rpx 100rpx 40rpx;
  box-sizing: border-box;
  background-color: #f7f8fa;

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  position: relative;
  overflow: hidden;
}

.home-view-container.dark-theme {
  background-color: #121212 !important;
}

// 新增：顶部欢迎语样式
.header-welcome {
  margin-bottom: 60rpx; // 减少与下方的间距 (100 -> 60)
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  
  .welcome-Line {
    margin-bottom: 40rpx; 
    display: flex;
    flex-direction: column; // 改为上下结构，更显大气
    align-items: flex-start; 
    justify-content: flex-start; 
    padding-left: 20rpx; 
    opacity: 1; // 移除透明度，颜色更实
  }

  .hello-text {
    font-size: 56rpx;
    font-weight: 300;
    color: #999;
    font-family: sans-serif;
    font-style: normal;
    margin-bottom: 10rpx;
  }

  .name-text {
    font-size: 72rpx;
    font-weight: 900;
    color: #333;
    letter-spacing: -2rpx;
  }

  .brand-logo {
    margin-top: 40rpx; 
    height: 360rpx;   // Logo 继续加大，撑满上半场
    width: auto;
    // 最大宽度限制，防止在窄屏手机上溢出
    max-width: 80%;
    object-fit: contain;

    display: block;
    align-self: center; 
    // 投影加重，让它浮起来
    filter: drop-shadow(0 20rpx 40rpx rgba(183, 0, 48, 0.2)); 
    // 增加一点缩放动画，吸引眼球
    transform: scale(1.05); 
  }
}

.home-view-container.dark-theme .header-welcome {
  .hello-text { color: #666; }
  .name-text { color: #e0e0e0; }
}

// 1. Logo 区域
.logo-section {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 60rpx;
  position: relative;
  z-index: 2;

  .logo-img {
    width: 380rpx; // 稍微放大
    height: auto;
    // 增加一点通透感
    opacity: 0.95; 
  }
}

// 2. 搜索框区域 - 悬浮胶囊
.search-section {
  margin-bottom: 50rpx;
  position: relative;
  z-index: 2;
  padding: 0 10rpx;

  .search-box {
    display: flex;
    align-items: center;
    background-color: #ffffff;
    height: 110rpx;
    border-radius: 40rpx;
    padding: 0 30rpx;

    box-shadow:
      0 10rpx 30rpx -10rpx rgba(200, 16, 46, 0.15),
      0 4rpx 10rpx rgba(0,0,0,0.02);
    border: 2rpx solid #fff;

    .search-icon {
      font-size: 36rpx;
      margin-right: 24rpx;
      opacity: 0.4;
      line-height: 1;
    }

    .search-placeholder {
      flex: 1;
      font-size: 32rpx;
      color: #bbbbbb;
      letter-spacing: 1rpx;
      font-weight: 400;
    }
  }

  &:active {
      transform: scale(0.94);
  }
}

.home-view-container.dark-theme .search-section {
  .search-box {
    background-color: #2a2a2a;
    border-color: #3a3a3a;
    box-shadow: 0 10rpx 30rpx -10rpx rgba(0,0,0,0.3), 0 4rpx 10px rgba(0,0,0,0.1);
    .search-placeholder { color: #666; }
  }
}

// 3. 功能区域 - Bento Grid (便当盒 layout)
// 优化：右侧统计卡片不再是简单的色块，而是精细的数据面板
.toolbox-section {
  display: grid;
  grid-template-columns: 1fr 1fr; // 左右等宽
  grid-template-rows: auto auto; 
  gap: 24rpx;
  
  position: relative;
  z-index: 2;

  // 左侧两个功能按钮
  .left-group {
      grid-column: 1 / 2;
      grid-row: 1 / 3; // 占据两行高度
      display: flex;
      flex-direction: column;
      gap: 24rpx;
  }
  
  // 右侧统计展示
  .right-group {
      grid-column: 2 / 3;
      grid-row: 1 / 3; // 占据两行高度
  }
}

// 通用卡片 - 面板风格
.card-item {
  background-color: #ffffff;
  border-radius: 36rpx;
  padding: 30rpx;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.02);
  border: 1rpx solid rgba(0,0,0,0.03);

  height: 180rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: all 0.1s;

  .card-title {
    font-size: 30rpx;
    font-weight: 700;
    color: $text-main;
    margin-bottom: 2rpx;
    z-index: 2;
    display: block;
  }

  .card-subtitle {
    font-size: 20rpx;
    color: #999;
    letter-spacing: 1rpx;
    text-transform: uppercase;
    z-index: 2;
    display: block;
    margin-top: 4rpx;
  }

  .card-bg-icon {
    position: absolute;
    right: -10rpx;
    bottom: -10rpx;
    font-size: 90rpx;
    line-height: 1;
    opacity: 0.15;
    z-index: 1;
    transform: rotate(-15deg);
  }

  &:active {
      transform: scale(0.97);
  }

  &.letter-card {
      background: linear-gradient(135deg, #fff 0%, $brand-light-bg 100%);
      .card-title { color: $brand-red; }
  }
}

.home-view-container.dark-theme .card-item {
  background-color: #2a2a2a;
  border-color: #3a3a3a;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.1);

  .card-title { color: #e0e0e0; }
  .card-subtitle { color: #888; }
}

.home-view-container.dark-theme .letter-card {
  background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
  .card-title { color: $brand-red !important; }
}

.new-tag {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  background: linear-gradient(135deg, #b20035, #ff4d6a);
  color: #fff;
  font-size: 20rpx;
  font-weight: 700;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  z-index: 3;
}

// 统计卡片：纵向大卡片
.stat-card {
  height: 100% !important;
  background-color: #ffffff;
  border: 1rpx solid rgba(0,0,0,0.03);
  color: $text-main;
  border-radius: 36rpx;
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.02);

  .stat-title {
      font-size: 30rpx;
      font-weight: 700;
      opacity: 1;
      color: #999;
  }

  .stat-number {
      font-size: 80rpx;
      font-weight: 900;
      line-height: 1;
      margin: 20rpx 0;
      letter-spacing: -2rpx;
      color: $brand-red;
      text-shadow: none;
  }

  .stat-unit {
      font-size: 24rpx;
      opacity: 0.5;
      color: #999;
      align-self: flex-end;
  }

  &::before { display: none; }
  &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 12rpx;
      background: linear-gradient(90deg, #fff 0%, $brand-light-bg 100%);
      display: none;
  }
}

.home-view-container.dark-theme .stat-card {
  background-color: #2a2a2a;
  border-color: #3a3a3a;
  .stat-title { color: #888; }
  .stat-number { color: $brand-red; }
  .stat-unit { color: #666; }
}
</style>

<style lang="scss">
.guide-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  box-sizing: border-box;
}

.home-view-container.dark-theme .guide-overlay {
  background-color: rgba(0, 0, 0, 0.45);
}

.home-view-container.dark-theme .guide-content {
  background-color: #2a2a2a;
}

.home-view-container.dark-theme .guide-header .guide-title { color: #e0e0e0; }
.home-view-container.dark-theme .guide-header .guide-subtitle { color: #888; }
.home-view-container.dark-theme .guide-section .section-icon { background-color: #2a2a2a; }
.home-view-container.dark-theme .guide-section .section-title { color: #e0e0e0; }
.home-view-container.dark-theme .guide-section .section-desc { color: #888; }

.guide-content {
  width: 100%;
  max-width: 600rpx;
  background-color: #ffffff;
  border-radius: 32rpx;
  padding: 48rpx 40rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.3);
}

.guide-header {
  text-align: center;
  margin-bottom: 48rpx;

  .guide-title {
    display: block;
    font-size: 44rpx;
    font-weight: 800;
    color: #1a1a1a;
    margin-bottom: 16rpx;
  }

  .guide-subtitle {
    display: block;
    font-size: 26rpx;
    color: #999;
  }
}

.guide-sections {
  margin-bottom: 48rpx;
}

.guide-section {
  display: flex;
  align-items: flex-start;
  margin-bottom: 36rpx;

  &:last-child {
    margin-bottom: 0;
  }

  .section-icon {
    width: 80rpx;
    height: 80rpx;
    background-color: #fff5f7;
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40rpx;
    margin-right: 24rpx;
    flex-shrink: 0;
  }

  .section-text {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .section-title {
    font-size: 30rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 8rpx;
  }

  .section-desc {
    font-size: 24rpx;
    color: #888;
    line-height: 1.5;
  }
}

.guide-footer {
  .start-btn {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    background: linear-gradient(135deg, #b20035, #ff4d6a);
    color: #fff;
    font-size: 32rpx;
    font-weight: 600;
    border-radius: 44rpx;
    border: none;
    box-shadow: 0 8rpx 24rpx rgba(178, 0, 53, 0.3);

    &:active {
      transform: scale(0.98);
      opacity: 0.9;
    }
  }
}
</style>
