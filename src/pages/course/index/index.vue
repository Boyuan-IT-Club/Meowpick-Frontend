<template>
  <layout class="background" @on-bottom="handleBottom()">
    <view class="top-bar">
      <view class="go-back" @click="goBack">
        <image src="../../..//images/go-back.png" class="icon" />
        <view class="txt">{{ course.data.name }}</view>
      </view>
    </view>
    <view class="ellipse" />
    <course-header
      :data="course.data"
      :teachers="teachers"
      class="information"
    />
    <view class="line" />
    <view class="comment-box">
      <view class="comment-title">
        <image class="icon" src="@/images/comment-icon.png" />
        <view class="title">课程吐槽</view>
      </view>

      <CommentList :id="id" class="comment-item" />
    </view>
    <view class="comment-button">
      <image
        class="new-box"
        src="../../..//images/comment-button.png"
        @click="jump2comment()"
      />
    </view>
  </layout>
</template>

<script setup lang="ts">
import { useCourse } from "./index";
import CommentList from "@/pages/course/index/CommentList.vue";

let course_id = "";
const { fetch, id, course, teachers, trends } = useCourse();
onLoad((options: any) => {
  course_id = options.id;
});
onShow(() => {
  fetch(course_id);
});

function handleBottom() {
  PubSub.publish("comment-next");
}

function jump2comment() {
  uni.navigateTo({
    url: `/pages/course/comment/index?id=${id.value}`
  });
}

function format(time: string) {
  return useTime(parseInt(time));
}

const goBack = () => {
  uni.navigateBack({
    delta: 1
  });
};
</script>

<style scoped lang="scss">
.background {
  display: flex;
  flex-direction: column;
}
.top-bar {
  position: fixed;
  top: 0;
  background-color: #b70030;
  width: 100vw;
  height: 26vw;
  z-index: 4;
  .go-back {
    position: absolute;
    top: 15vw;
    left: 5vw;
    width: 100vw;
    display: flex;
    flex-direction: row;
    .txt {
      display: flex;
      align-items: center;
      color: #ffffff;
      max-width: 80vw;
      font-size: 4.8vw;
      margin-left: 2vw;
      margin-top: 0.5vw;
      letter-spacing: 0.2vw;
      font-weight: bold;
      white-space: nowrap;
      overflow: scroll;
      text-overflow: ellipsis;
    }
    .icon {
      display: flex;
      align-items: center;
      width: 5vw;
      height: 8.53vw;
    }
  }
}
.ellipse {
  position: fixed;
  top: 22vw;
  background-color: #b70030;
  width: 100vw;
  height: 8vw;
  border-radius: 50%;
  z-index: 2;
}
.information {
  position: relative;
  top: 30vw;
}
.line {
  width: 89vw;
  height: 0.3vw;
  background-color: #e9e9e9;
  margin-top: 35vw;
  margin-left: 5vw;
}
.comment-box {
  margin-top: 10vw;
  display: flex;
  flex-direction: column;
  .comment-title {
    display: flex;
    flex-direction: row;
    .icon {
      width: 8vw;
      height: 7vw;
      margin-left: 32vw;
    }
    .title {
      font-size: 4.5vw;
      margin-left: 3vw;
      font-weight: bold;
      letter-spacing: 0.3vw;
    }
  }

  .comment-item {
    margin-top: 5vw;
  }
}
.comment-button {
  position: fixed;
  top: 178.4vw;
  left: 74.4vw;
  z-index: 99;
  .new-box {
    width: 20vw;
    height: 20vw;
  }
}
</style>
