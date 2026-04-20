<template>
  <top-bar :selected="1" />
  <view class="comment">
    <!-- 加载状态 -->
    <view class="loading-state" v-if="loading">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 错误状态 -->
    <view class="error-state" v-else-if="error">
      <text class="error-text">加载失败，请点击重试</text>
      <button class="retry-btn" @click="handleRetry">重试</button>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-else-if="list.length === 0">
      <text class="empty-text">还没有发布过吐槽～</text>
      <button class="empty-btn" @click="goToSearch">去吐槽</button>
    </view>

    <!-- 列表 -->
    <scroll v-else @bottom="handleBottom">
      <view v-for="item of list" :key="item.id" class="item">
        <MyCommentBox
          :data="item"
          @like="like"
          @click="handleCardClick"
          @longpress="handleCardLongPress"
        />
      </view>
    </scroll>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useCourseComment } from "@/pages/my-comments/utils";
import MyCommentBox from "@/pages/my-comments/MyCommentBox.vue";
import { onShow } from "@dcloudio/uni-app";
import type { CommentVO } from "@/api/data-contracts";

const loading = ref(true);
const error = ref(false);

onShow(() => {
  loading.value = true;
  error.value = false;
  fetch(page.value);
  uni.hideTabBar();
});

const { list, loading, error, like, next, fetch, remove, page } = useCourseComment();

const handleRetry = () => {
  loading.value = true;
  error.value = false;
  page.value = 0;
  list.value = [];
  fetch(0);
};

const goToSearch = () => {
  uni.navigateTo({
    url: "/pages/find/index/index"
  });
};

function handleBottom() {
  next();
}

// 点击卡片跳转到课程详情
function handleCardClick(item: CommentVO) {
  if (item.course && item.course.id) {
    uni.navigateTo({
      url: `/pages/course/index/index?id=${item.course.id}`
    });
  } else {
    uni.showToast({ title: '无法获取课程信息', icon: 'none' });
  }
}

// 长按卡片操作 (例如删除)
function handleCardLongPress(item: CommentVO) {
  uni.showActionSheet({
    itemList: ['删除该评价'],
    success: (res) => {
      if (res.tapIndex === 0) {
        uni.showModal({
          title: '提示',
          content: '确定要删除这条评价吗？',
          success: async function (res) {
            if (res.confirm) {
              const success = await remove(item.id || '');
              if (success) {
                uni.showToast({ title: '删除成功', icon: 'success' });
              } else {
                uni.showToast({ title: '删除失败', icon: 'none' });
              }
            }
          }
        });
      }
    }
  });
}
</script>

<style scoped lang="scss">
.top-bar {
  position: fixed;
  z-index: 99;
  top: 0;
  background-color: #b70030;
  width: 100vw;
  height: 25vw;
  .tap-bar {
    display: flex;
    flex-direction: row;
    position: fixed;
    top: 14vw;
    left: 8vw;
    .search {
      color: #ffffff;
      font-size: 4vw;
      letter-spacing: 0.6vw;
      display: flex;
      flex-direction: column;
    }
    .my-comment {
      color: #ffffff;
      font-size: 4.5vw;
      margin-left: 10vw;
      margin-top: -1vw;
      letter-spacing: 0.3vw;
      font-weight: bold;
      display: flex;
      flex-direction: column;
      .chosen-search {
        width: 7vw;
        height: 1vw;
        margin-top: 2vw;
        margin-left: 5.5vw;
        z-index: 1;
      }
    }
  }
}
.ellipse {
  position: fixed;
  top: 21vw;
  background-color: #b70030;
  width: 100vw;
  height: 8vw;
  border-radius: 50%;
  z-index: 98;
}
.comment {
  margin-top: 30vw;
  padding: 0 32rpx;
  box-sizing: border-box;
  width: 100vw;
  min-height: 70vh;
}

// 加载状态
.loading-state {
  width: 100%;
  padding: 30vw 5vw 0;
  text-align: center;

  .loading-spinner {
    width: 10vw;
    height: 10vw;
    margin: 0 auto 3vw;
    border: 2px solid #ddd;
    border-top-color: #b70030;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .loading-text {
    font-size: 28rpx;
    color: #666;
  }
}

// 错误状态
.error-state {
  width: 100%;
  padding: 30vw 5vw 0;
  text-align: center;

  .error-text {
    font-size: 28rpx;
    color: #f43f30;
    display: block;
    margin-bottom: 24rpx;
  }

  .retry-btn {
    background-color: #b70030;
    color: white;
    border-radius: 24rpx;
    font-size: 28rpx;
    padding: 16rpx 48rpx;
    border: none;
  }
}

// 空状态
.empty-state {
  width: 100%;
  padding: 30vw 5vw 0;
  text-align: center;

  .empty-text {
    font-size: 28rpx;
    color: #999;
    display: block;
    margin-bottom: 32rpx;
  }

  .empty-btn {
    background-color: #b70030;
    color: white;
    border-radius: 24rpx;
    font-size: 28rpx;
    padding: 16rpx 48rpx;
    border: none;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
