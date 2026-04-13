<template>
  <layout class="background" @on-bottom="handleBottom()">
    <!-- 把 fixed 元素放进这个槽位，它们就不会跟着滚了 -->
    <template #fixed>
      <view class="top-bar">
        <view class="go-back" @click="goBack">
          <image src="@/images/go-back.png" class="icon" />
          <view class="txt">{{ (courseData && courseData.name) ? courseData.name : '课程详情' }}</view>
        </view>
      </view>
      <view class="ellipse" />
    </template>

    <!-- 滚动内容容器 -->
    <view class="page-content">
      <view v-if="courseData" class="information-wrapper">
        <CourseHeader
          v-if="courseData"
          :data="courseData"
          class="information"
        />
      </view>

      <!-- 课程介绍部分 -->
      <view v-if="courseData && ((courseData as any).description || (courseData as any).introduction)" class="intro-box">
        <view class="intro-title">
          <image class="icon" src="@/images/category-icon.png" />
          <view class="title">课程介绍</view>
        </view>
        <view class="content">{{ (courseData as any).description || (courseData as any).introduction }}</view>
      </view>

      <view class="line" />

      <view class="comment-box">
        <view class="comment-title">
          <image class="icon" src="@/images/comment-icon.png" />
          <view class="title">课程吐槽</view>
        </view>

        <!-- 评论列表 -->
        <CommentList v-if="course_id" :id="course_id" class="comment-item" />
      </view>
    </view>

    <view class="comment-button">
      <image
        class="new-box"
        src="@/images/comment-button.png"
        @click="jump2comment()"
      />
    </view>
  </layout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import { PubSub } from "@/config";
import { useCourse } from "./index";
import CourseHeader from "@/components/course/course-header/index.vue";
import CommentList from "@/pages/course/index/CommentList.vue";

const course_id = ref("");
const { fetch, courseData } = useCourse();

onLoad((options: any) => {
  console.log('[CourseDetail] Page onLoad, id:', options.id);
  if (options.id) {
    course_id.value = options.id;
  }
});

onShow(() => {
  console.log('[CourseDetail] Page onShow, course_id:', course_id.value);
  if (course_id.value) {
    fetch(course_id.value);
  }
});

function handleBottom() {
  console.log('[CoursePage] handleBottom triggered');
  PubSub.publish("comment-next");
}

function jump2comment() {
  uni.navigateTo({
    url: `/pages/course/comment/index?id=${course_id.value}`
  });
}

const goBack = () => {
  uni.navigateBack({ delta: 1 });
};
</script>

<style scoped lang="scss">
.background { display: flex; flex-direction: column; width: 100vw; overflow-x: hidden; }
.top-bar {
  position: absolute; top: 0; background-color: #b70030; width: 100vw; height: 26vw; z-index: 10;
  pointer-events: auto; // 确保可以点击
  .go-back {
    position: absolute; top: 15vw; left: 5vw; width: 90vw; display: flex; flex-direction: row; align-items: center;
    .txt {
      color: #ffffff; font-size: 4.8vw; margin-left: 2vw; font-weight: bold;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;
    }
    .icon { width: 5vw; height: 8.53vw; flex-shrink: 0; }
  }
}
.ellipse { position: absolute; top: 22vw; background-color: #b70030; width: 100vw; height: 8vw; border-radius: 50%; z-index: 2; pointer-events: none; }
.page-content {
  padding-top: 35vw; // 替代 margin-top，确保背景色完整
  padding-bottom: 20vw;
}
.information-wrapper { position: relative; z-index: 1; }
.intro-box {
  margin-top: 5vw;
  margin-left: 12vw;
  display: flex;
  flex-direction: column;
  .intro-title {
    display: flex;
    flex-direction: row;
    align-items: center;
    .icon {
      width: 6vw;
      height: 6vw;
    }
    .title {
      color: #181818;
      font-size: 3.5vw;
      margin-left: 4vw;
      font-weight: bold;
    }
  }
  .content {
    margin-top: 3vw;
    font-size: 3.8vw;
    margin-left: 10vw;
    width: 70vw;
    color: #333;
    line-height: 1.6;
  }
}
.line { width: 89vw; height: 0.3vw; background-color: #e9e9e9; margin: 10vw auto 0; }
.comment-box {
  margin-top: 5vw; display: flex; flex-direction: column;
  .comment-title {
    display: flex; flex-direction: row; align-items: center; justify-content: center;
    .icon { width: 8vw; height: 7vw; }
    .title { font-size: 4.5vw; margin-left: 3vw; font-weight: bold; }
  }
  .comment-item { margin-top: 5vw; }
}
.comment-button {
  position: fixed; bottom: 8vw; right: 5vw; z-index: 99;
  .new-box { width: 18vw; height: 18vw; }
}
</style>
