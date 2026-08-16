<template>
  <view>
    <view class="top-bar">
    </view>
    <view class="ellipse" />

    <view 
      class="bottom-nav" 
      :class="{ 'nav-hidden': !navVisible, 'nav-visible': navVisible }"
    >
      <view class="nav-item" @click="goToSearch">
        <image 
          class="nav-icon" 
          :src="selected === 0 ? searchWhite : searchBlack" 
        />
        <text class="nav-text" :class="{ 'nav-text-active': selected === 0 }">搜索</text>
        <image class="chosen-search" src="../../images/chosen_line.png" v-if="selected === 0" />
      </view>

      <view class="nav-item" @click="goToMyComments">
        <image 
          class="nav-icon" 
          :src="selected === 1 ? commentWhite : commentBlack" 
        />
        <text class="nav-text" :class="{ 'nav-text-active': selected === 1 }">我的</text>
        <image class="chosen-search" src="../../images/chosen_line.png" v-if="selected === 1" />
      </view>

      <view class="nav-item" @click="goToProposalList">
        <image 
          class="nav-icon" 
          :src="selected === 2 ? addWhite : addBlack" 
        />
        <text class="nav-text" :class="{ 'nav-text-active': selected === 2 }">提案</text>
        <image class="chosen-search" src="../../images/chosen_line.png" v-if="selected === 2" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import searchWhite from '../../images/search_white.png';
import searchBlack from '../../images/search_black.png';
import commentWhite from '../../images/comment_white.png';
import commentBlack from '../../images/comment_black.png';
import addWhite from '../../images/add_white.png';
import addBlack from '../../images/add_black.png';

const props = defineProps<{
  selected: number;
}>();

const navVisible = ref(true);
let lastScrollTop = 0;
let scrollThreshold = 50;
let ticking = false;

const handlePageScroll = (e: any) => {
  if (ticking) return;
  ticking = true;

  requestAnimationFrame(() => {
    const currentScrollTop = e.scrollTop || 0;
    const delta = currentScrollTop - lastScrollTop;

    if (delta > scrollThreshold && currentScrollTop > 100) {
      if (navVisible.value) {
        navVisible.value = false;
      }
    } else if (delta < -scrollThreshold) {
      if (!navVisible.value) {
        navVisible.value = true;
      }
    } else if (currentScrollTop <= 0) {
      navVisible.value = true;
    }

    lastScrollTop = currentScrollTop;
    ticking = false;
  });
};

onMounted(() => {
  uni.$on('pageScroll', handlePageScroll);
});

onUnmounted(() => {
  uni.$off('pageScroll', handlePageScroll);
});

const goToSearch = () => {
  uni.switchTab({
    url: "/pages/home/home"
  });
};

const goToMyComments = () => {
  uni.switchTab({
    url: "/pages/my-comments/my-comments"
  });
};

const goToProposalList = () => {
  uni.switchTab({
    url: "/pages/proposal/list"
  });
};
</script>

<style scoped lang="scss">
.top-bar {
  position: fixed;
  top: 0;
  background-color: #b70030;
  width: 100vw;
  height: 25vw;
  z-index: 20;
}

.ellipse {
  position: fixed;
  top: 21vw;
  background-color: #b70030;
  width: 100vw;
  height: 8vw;
  border-radius: 50%;
  z-index: 10;
}

.bottom-nav {
  position: fixed;
  bottom: 4vw;
  left: 50%;
  transform: translateX(-50%);
  width: 85vw;
  height: 15vw;
  background-color: rgba(183, 0, 48, 0.95);
  border-radius: 10vw;
  display: flex;
  justify-content: space-around;
  align-items: flex-start;
  padding-top: 1vw;
  z-index: 20;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), 
              opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1);

  &.nav-hidden {
    transform: translateX(-50%) translateY(120%);
    opacity: 0;
  }

  &.nav-visible {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }

  .nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    height: 100%;

    .nav-icon {
      width: 5vw;
      height: 5vw;
      margin-top: 2vw;
    }

    .nav-text {
      color: #000000;
      font-size: 3.5vw;
      letter-spacing: 0.3vw;
      margin-bottom: 1vw;
      margin-top: 1vw;
    }

    .nav-text-active {
      color: #ffffff;
    }

    .chosen-search {
      width: 6.4vw;
      height: 1vw;
      margin-top: 0.5vw;
      transition: all 0.5s ease-in-out;
    }
  }
}
</style>
