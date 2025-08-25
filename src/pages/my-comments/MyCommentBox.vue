<template>
  <view class="my-comment-box">
    <view class="comment-box">
      <view class="title">
        <view class="name">{{ props.data.course.name }}</view>
        <view class="dept-name">{{ props.data.course.category }}</view>
      </view>
      <view class="information">
        <view class="circle" />
        <view class="department">{{ props.data.course.department }}</view>
        <view class="circle" />
        <view
          v-for="item of props.data.course?.teacherList"
          class="instructor"
          >{{ item.name }}</view
        >
      </view>
      <view class="tag">
        <view v-for="item of limitedTags(props.data.tags!)" class="item">
          <image :src="Emoji(item)" class="emoji" />
          <text class="tag-txt">{{ item }}</text>
        </view>
      </view>
      <view class="time">{{ format(props.data.crateAt) }}</view>
      <view class="content">{{ props.data.text }}</view>
      <view class="like">
        <image
          :src="data.relation?.like ? Liked : Like"
          class="like-icon"
          @click="like"
        />
        <view class="like-num">{{ props.data.relation?.like_cnt }}</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { CommentVO } from "@/api/data-contracts";
import { Emoji, limitedTags } from "@/utils/tags";
import Liked from "@/images/like_active.png";
import Like from "@/images/like-icon.png";
type Props = {
  data: CommentVO;
};
const props = defineProps<Props>();

const emit = defineEmits<{
  like: (id: string) => void;
}>();

function like() {
  emit("like", props.data.id);
}

function format(timeStamp: string): string {
  const date = new Date(timeStamp);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  return `${String(year)}-${month}-${day}`;
}
</script>

<style scoped lang="scss">
.my-comment-box {
  background-color: #b70030;
  width: 89vw;
  height: auto;
  margin-top: 5vw;
  border-radius: 3vw;
  .comment-box {
    background-color: #ffffff;
    display: flex;
    flex-direction: column;
    width: 87vw;
    height: auto;
    margin-left: 1vw;
    border-radius: 3vw;
    box-shadow: 1px 1px 5px 0px #0000001f;
    .title {
      display: flex;
      flex-direction: row;
      .name {
        margin-left: 4vw;
        margin-top: 4vw;
        font-size: 4vw;
        font-weight: bold;
      }
      .dept-name {
        margin-left: 2.5vw;
        margin-top: 4.5vw;
        font-size: 3.2vw;
        color: #545454;
      }
    }
    .information {
      display: flex;
      flex-direction: row;
      margin-top: 3vw;
      .circle {
        width: 2vw;
        height: 2vw;
        border-radius: 50%;
        background-color: #b70030;
        margin-left: 4vw;
        margin-top: 1.5vw;
      }
      .department {
        margin-left: 1.5vw;
        font-size: 3.5vw;
      }
      .instructor {
        margin-left: 1.5vw;
        font-size: 3.5vw;
      }
    }
    .tag {
      display: flex;
      flex-wrap: wrap;
      margin-top: 3vw;

      .item {
        background: #f1f1f1;
        display: flex;
        flex-direction: row;
        padding: 1vw;
        border-radius: 2vw;
        margin-left: 2vw;

        .emoji {
          width: 6.4vw;
          height: 6.4vw;
        }

        .tag-txt {
          margin-top: 1vw;
          margin-left: 1vw;
          font-size: 3.8vw;
        }
      }
    }
    .time {
      margin-left: 65vw;
      font-size: 3.5vw;
    }
    .content {
      margin-top: 3vw;
      width: 82.93vw;
      margin-left: 3.5vw;
      letter-spacing: 0.3vw;
      line-height: 1.5;
      font-size: 3.9vw;
    }
    .like {
      display: flex;
      flex-direction: row;
      margin-left: 75vw;
      margin-top: 2vw;
      margin-bottom: 3vw;
      .like-icon {
        top: 5vw;
        width: 5.86vw;
        height: 5.86vw;
      }
      .like-num {
        top: 5.5vw;
        margin-left: 2vw;
        margin-top: 1vw;
        font-size: 3.8vw;
      }
    }
  }
}
</style>
