<template>
  <view>
    <!-- 顶部红色区域 -->
    <view class="top-bar">
      <!-- 顶部导航栏内容（当前为空，保留红色背景） -->
    </view>
    <view class="ellipse" />

    <!-- 底部导航栏 -->
    <view class="bottom-nav">
      <!-- 搜索栏目 -->
      <view class="nav-item" @click="goToSearch">
        <text class="nav-text">搜索</text>
        <image class="chosen-search" src="../../images/chosen_line.png" v-if="selected === 0" />
      </view>
      <!-- 我的吐槽栏目 -->
      <view class="nav-item" @click="goToMyComments">
        <text class="nav-text">我的吐槽</text>
        <image class="chosen-search" src="../../images/chosen_line.png" v-if="selected === 1" />
      </view>
      <!-- 新增投票栏目 -->
      <view class="nav-item" @click="goToProposalList">
        <text class="nav-text">新增</text>
        <image class="chosen-search" src="../../images/chosen_line.png" v-if="selected === 2" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
const props = defineProps<{
  selected: number; // 用于标识当前选中的导航项
}>();

// 搜索页面跳转
const goToSearch = () => {
  uni.switchTab({
    url: "/pages/home/home"
  });
};

// 我的吐槽页面跳转
const goToMyComments = () => {
  uni.switchTab({
    url: "/pages/my-comments/my-comments"
  });
};

// 新增投票页面跳转
const goToProposalList = () => {
  uni.switchTab({
    url: "/pages/proposal/list/list"
  });
};
</script>

<style scoped lang="scss">
// 顶部红色区域样式
.top-bar {
  position: fixed;
  top: 0;
  background-color: #b70030;
  width: 100vw;
  height: 25vw;
  z-index: 20;
}

// 顶部椭圆过渡样式
.ellipse {
  position: fixed;
  top: 21vw;
  background-color: #b70030;
  width: 100vw;
  height: 8vw;
  border-radius: 50%;
  z-index: 10;
}

// 底部导航栏样式
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100vw;
  height: 15vw;
  background-color: #b70030;
  display: flex;
  justify-content: space-around;
  align-items: flex-start;
  padding-top: 1vw;
  z-index: 20;

  // 导航项样式
  .nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    height: 100%;

    // 导航文字样式
    .nav-text {
      color: #ffffff;
      font-size: 4vw;
      letter-spacing: 0.3vw;
      margin-bottom: 1vw;
      margin-top: 3vw;
    }

    // 选中下划线样式
    .chosen-search {
      width: 6.4vw;
      height: 1vw;
      margin-top: 0.5vw;
      transition: all 0.5s ease-in-out;
    }
  }
}
</style>