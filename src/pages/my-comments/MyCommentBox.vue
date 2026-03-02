<template>
  <view class="my-comment-box" @click="handleClick" @longpress="handleLongPress">
    <view class="comment-box">
      <view class="title">
        <view class="name">{{ props.data.course?.name || '未知课程' }}</view>
        <view class="dept-name">{{ props.data.course?.category || '未知分类' }}</view>
      </view>
      <view class="information">
        <view class="info-item">
            <image src="@/images/depart-icon.png" class="info-icon" />
            <view class="department">{{ props.data.course?.department || '未知院系' }}</view>
        </view>
        <view class="info-item" v-if="props.data.course?.teachers && props.data.course.teachers.length > 0">
            <image src="@/images/teacher-icon.png" class="info-icon" />
            <view class="instructor">
              {{ props.data.course.teachers.join(' / ') }}
            </view>
        </view>
      </view>
      <view class="tag" v-if="props.data.tags && props.data.tags.length > 0">
        <view v-for="item of limitedTags(props.data.tags!)" class="item">
          <text class="emoji-text">{{ item }}</text>
        </view>
      </view>
      <view class="content">{{ props.data.text }}</view>
      <view class="footer">
          <view class="time">{{ format(props.data.crateAt || '') }}</view>
          <view class="like">
            <image
              :src="props.data.relation?.like ? Liked : Like"
              class="like-icon"
              @click="like"
            />
            <view class="like-num">{{ props.data.relation?.like_cnt || 0 }}</view>
          </view>
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
  (e: "like", id: string): void;
  (e: "click", data: CommentVO): void;
  (e: "longpress", data: CommentVO): void;
}>();

function like(e: Event) {
  e.stopPropagation(); // 阻止冒泡，防止触发卡片点击
  if (props.data.id) {
    emit("like", props.data.id);
  }
}

function handleClick() {
  emit("click", props.data);
}

function handleLongPress() {
  emit("longpress", props.data);
}

function format(timeStamp: string): string {
  if (!timeStamp) return '';
  const date = new Date(timeStamp);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}
</script>

<style scoped lang="scss">
.my-comment-box {
  width: 100%;
  margin-bottom: 24rpx;
  
  .comment-box {
    background-color: #ffffff;
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 32rpx;
    box-sizing: border-box;
    border-radius: 24rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
    border: 1rpx solid #f5f5f5;
    
    .title {
      display: flex;
      flex-direction: row;
      align-items: baseline;
      margin-bottom: 20rpx;
      
      .name {
        font-size: 34rpx;
        font-weight: 600;
        color: #333;
        margin-right: 16rpx;
      }
      .dept-name {
        font-size: 24rpx;
        color: #999;
        background-color: #f5f5f5;
        padding: 4rpx 12rpx;
        border-radius: 8rpx;
      }
    }
    
    .information {
      display: flex;
      flex-direction: row;
      margin-bottom: 24rpx;
      gap: 32rpx;
      
      .info-item {
          display: flex;
          align-items: center;
          
          .info-icon {
              width: 28rpx;
              height: 28rpx;
              margin-right: 8rpx;
              opacity: 0.6;
          }
          
          .department, .instructor {
              font-size: 26rpx;
              color: #666;
          }
      }
    }
    
    .tag {
      display: flex;
      flex-wrap: wrap;
      gap: 16rpx;
      margin-bottom: 24rpx;

      .item {
        background: #f7f8fa;
        padding: 8rpx 20rpx;
        border-radius: 12rpx;
        display: flex;
        align-items: center;

        .emoji-text {
          font-size: 24rpx;
          color: #555;
        }
      }
    }
    
    .content {
      font-size: 28rpx;
      color: #333;
      line-height: 1.6;
      margin-bottom: 24rpx;
      text-align: justify;
    }
    
    .footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1rpx solid #f9f9f9;
        padding-top: 20rpx;
        
        .time {
          font-size: 24rpx;
          color: #999;
        }
        
        .like {
          display: flex;
          align-items: center;
          
          .like-icon {
            width: 36rpx;
            height: 36rpx;
            margin-right: 8rpx;
          }
          .like-num {
            font-size: 26rpx;
            color: #666;
          }
        }
    }
  }
}
</style>
