<template>
  <layout @on-bottom="handleBottom">
    <!-- 固定层：防止顶栏滚动 -->
    <template #fixed>
      <view class="top-bar-fixed-wrapper">
        <top-bar :selected="1" />
      </view>
    </template>
    
    <!-- 滚动层内容 -->
    <view class="comment-container">
      <view v-for="item of list" :key="item.id" class="item">
        <MyCommentBox :data="item" @like="like" />
      </view>
      <!-- 底部留白，防止最后一条评论被挡住 -->
      <view class="safe-area-bottom" />
    </view>
  </layout>
</template>

<script setup lang="ts">
import { onShow } from "@dcloudio/uni-app";
import { useCourseComment } from "@/pages/my-comments/utils";
import MyCommentBox from "@/pages/my-comments/MyCommentBox.vue";

const { list, like, next, fetch, page } = useCourseComment();

onShow(() => {
  // 确保每次进入页面都是从第一页开始加载
  page.value = 1;
  fetch(page.value);
});

function handleBottom() {
  console.log('[MyComments] handleBottom triggered');
  next();
}
</script>

<style scoped lang="scss">
.top-bar-fixed-wrapper {
  pointer-events: auto;
  z-index: 100;
}
.comment-container {
  padding-top: 30vw;
  padding-left: 5vw;
  padding-right: 5vw;
  width: 100vw;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.item {
  margin-bottom: 4vw;
}

.safe-area-bottom {
  height: 20vw;
  width: 100%;
}
</style>
