<script setup lang="ts">
// @ts-nocheck
import type { CommentVO } from "@/api/data-contracts";
import { useTokenStore } from "@/config";
import Like from "@/images/like-icon.png";
import Liked from "@/images/like_active.png";
import { format as formatTime } from "./utils";

import { Emoji } from "@/utils/tags";

type CommentBoxProps = {
    data: CommentVO;
}
const props = defineProps<CommentBoxProps>();
const emit = defineEmits(["like"]);

// 处理表情展示
// 假设评论数据里有一个字段 score（或者其他字段）存储了用户选择的表情等级 1-5
// 如果没有，暂时假设 data.score 存在
// 如果 data 里没有 score，但有 tags? 用户说表情是评价者选择的。
// 假设评价者选择的表情对应一个 score 值，我们在 CommentBox 里把这个值还原成表情图片展示出来


const format = (time: string) => {
    return formatTime(time);
}

const like = () => {
    emit("like", props.data.id); // 保证传 id 供后端点赞逻辑
}
// 移除旧 tag 逻辑，或者保留文本 tag
// 下面只展示文本 tag，表情单独展示
const textTags = (tags: string[]) => {
    return tags || [];
}
</script>

<template>
  <view class="comment-box">

    <!-- 头部：表情（评价态度） + 标签 -->
    <view class="header-section">

      <!-- 2. 标签：将这里的标签也加上对应的小猫表情 -->
      <view class="tags-wrapper">
        <template v-for="(item, index) in textTags(data.tags || [])" :key="index">
             <view class="ctag">
                <!-- 注入 Emoji 函数显示表情图标 -->
                <image v-if="Emoji(item)" :src="Emoji(item)" class="tag-icon" />
                <view class="txt">{{ item }}</view>
             </view>
        </template>
      </view>
    </view>

    <view class="content-section">
      {{ data.content || data.text }}
    </view>

    <view class="footer-section">
      <view class="date-str">{{ format(data.createdAt || data.crateAt || '') }}</view>
      <view class="like-block" @click="like">
         <!-- 注意点赞的逻辑是从 relation 中获取 -->
         <image :src="data.relation?.like ? Liked : Like" class="icon-small" mode="aspectFit" />
         <view class="count">{{ data.relation?.like_cnt || 0 }}</view>
      </view>
    </view>

  </view>
</template>

<style scoped lang="scss">
.comment-box {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
}

.header-section {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;

  .emoji-wrapper {
      margin-right: 16rpx;
      .comment-emoji {
          width: 50rpx;
          height: 50rpx;
          display: block; // 添加 display block 以防止行内元素间隙影响对齐
      }
  }

  .tags-wrapper {
      display: flex;
      flex-wrap: wrap;

      .ctag {
        display: flex;
        align-items: center;
        background-color: #f7f8fa;
        padding: 4rpx 16rpx; // 微调 padding 使其更匀称
        border-radius: 20rpx;
        margin-right: 12rpx;
        margin-bottom: 8rpx;

        .tag-icon {
          width: 28rpx; // 调大了一点表情，使其看起来协调
          height: 28rpx;
          margin-right: 8rpx;
          display: block; // 防止图片异常变形或错位
        }

        .txt {
          font-size: 24rpx;
          color: #666;
        }
      }
  }
}

.content-section {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
  margin-bottom: 20rpx;
}

.footer-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .date-str {
    font-size: 24rpx;
    color: #999;
  }
  
  .like-block {
    display: flex;
    align-items: center;
    .icon-small {
      width: 32rpx;
      height: 32rpx;
      margin-right: 8rpx;
    }
    .count {
      font-size: 26rpx;
      color: #666;
    }
  }
}

</style>
