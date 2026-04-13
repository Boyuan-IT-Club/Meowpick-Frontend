<template>
  <view class="comment-list-wrapper">
    <!-- 使用数组循环渲染，提高小程序端的响应式稳定性 -->
    <view v-for="item in list" :key="item.id" class="comment-item-container">
      <CommentBox :data="item" @like="like" />
    </view>
    
    <view v-if="list.length === 0" class="empty-status">
      暂无吐槽，快来抢沙发吧~
    </view>
  </view>
</template>

<script setup lang="ts">
import { PubSub } from "@/config";
import { useCourseComment } from "@/pages/course/index/utils";
import CommentBox from "@/pages/course/index/CommentBox.vue";

const props = defineProps<{
  id: string;
}>();

const { list, like, next } = useCourseComment(props);

PubSub.subscribe("comment-next", () => {
  console.log('[CommentList] Received comment-next event');
  next();
});
</script>

<style scoped lang="scss">
.comment-list-wrapper {
  display: flex;
  flex-direction: column;
  padding-bottom: 30vw;
  .comment-item-container {
    margin-bottom: 2vw;
  }
  .empty-status {
    text-align: center;
    padding: 10vw 0;
    color: #999;
    font-size: 3.5vw;
  }
}
</style>
