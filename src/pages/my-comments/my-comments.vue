<template>
  <top-bar :selected="1" />
  <view class="comment">
    <scroll @bottom="handleBottom">
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

onShow(() => {
  fetch(page.value);
  uni.hideTabBar();
});

const value = ref("2");

const { list, like, next, fetch, page } = useCourseComment();

const currentPage = ref("");
const goToSearch = () => {
  currentPage.value = "search";
  uni.navigateTo({
    url: "/pages/find/index/index"
  });
};
const goToMyComments = () => {
  uni.navigateTo({
    url: "/pages/my-comments/my-comments"
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
        // 这里可以调用删除 API
        uni.showModal({
          title: '提示',
          content: '确定要删除这条评价吗？',
          success: function (res) {
            if (res.confirm) {
              // TODO: 调用删除接口
              uni.showToast({ title: '功能开发中', icon: 'none' });
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
  padding: 0 32rpx; /* Use padding instead of margin-left for better centering */
  box-sizing: border-box;
  height: 200vw;
  width: 100vw;
}
</style>
