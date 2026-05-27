<template>
  <layout class="background" @on-bottom="handleBottom()" :class="themeStore.themeClass">
    
    <!-- 1. 新的头部 Header -->
    <view class="detail-header" 
      :style="{ 
          height: (menuButtonInfo.top + menuButtonInfo.height + 12) + 'px',
          paddingTop: menuButtonInfo.top + 'px'
      }"
    >
       <view class="nav-bar" :style="{ height: menuButtonInfo.height + 'px' }">
         <view class="back-btn-wrapper" :style="{ width: menuButtonInfo.height + 'px', height: '100%' }">
            <BackBtn />
         </view>
         <view class="title-wrapper">
             <text class="page-title">{{ course.data?.name || '课程详情' }}</text>
         </view>
       </view>
    </view>

    <!-- 2. 课程主要信息卡片 (已经重构过的 course-header) -->
    <view class="content-wrapper" :style="{ paddingTop: (menuButtonInfo.top + menuButtonInfo.height + 12 + 20) + 'px' }">
      <course-header
        :data="course.data || {}"
        :teachers="teachers"
      />
      
      <!-- 3. 吐槽评价区 -->
      <view class="comment-section">
        <view class="section-header">
           <image src="@/images/comment-icon.png" class="header-icon" mode="aspectFit" />
           <text class="section-title">课程评价</text>
           <text class="section-subtitle">{{ (course.data && course.data.commentCount) ? `(${course.data.commentCount})` : '' }}</text>
        </view>
        
        <CommentList :id="id" class="comment-list-container" />
      </view>
    </view>

    <!-- 4. 悬浮发布按钮 -->
    <view class="fab-btn" @click="jump2comment()">
      <image
        class="fab-icon"
        src="@/images/comment_white.png" 
        mode="aspectFit"
      />
      <!-- 如果没有 white icon，用之前的 -->
      <!-- <image class="fab-icon" src="../../..//images/comment-button.png" /> -->
    </view>

  </layout>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/config';
const themeStore = useThemeStore();
import BackBtn from "@/components/common/BackBtn.vue";
import { onShow, onLoad } from "@dcloudio/uni-app";
import { useCourse } from "./index";
import CommentList from "@/pages/course/index/CommentList.vue";
import { format as formatTime } from "./utils"; // 修复 import
import CourseHeader from "@/components/course/course-header/index.vue"; 

// 1. 获取胶囊位置，用于对齐返回按钮
const sysInfo = uni.getSystemInfoSync();
let menuButtonInfo = { 
    top: sysInfo.statusBarHeight ? sysInfo.statusBarHeight + 4 : 48,
    height: 32,
};
try {
    const res = uni.getMenuButtonBoundingClientRect();
    if (res && res.top) {
        menuButtonInfo = {
            top: res.top,
            height: res.height
        };
    }
} catch (e) {}

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

// 修复函数
function format(time: string) {
  return formatTime(time);
}

const goBack = () => {
  uni.navigateBack({
    delta: 1
  });
};
</script>

<style scoped lang="scss">
.background {
  min-height: 100vh;
  background-color: #f7f8fa; // 浅灰底色
}

// 1. 顶部区域
.detail-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  background: var(--bg-card);
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.02);
  
  .nav-bar {
    display: flex;
    align-items: center;
    padding-left: 32rpx;
    position: relative;
    
    .back-btn-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 40rpx;
        color: #333;
        margin-right: 12rpx; /* 调整间距 */
        flex-shrink: 0;
    }
     
    .title-wrapper {
         /* 移除原始绝对定位，改为flex布局左对齐 */
         /* position: absolute; */
         /* left: 50%; */
         /* transform: translateX(-50%); */
         flex: 1;
         display: flex;
         align-items: center;
         padding-right: 100px; /* 防止标题覆盖胶囊按钮 */

        .page-title {
            font-size: 34rpx; /* 稍微放大一点 */
            font-weight: 600;
            color: #333;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }
  }
}

// 2. 内容包装
.content-wrapper {
  position: relative;
  z-index: 2;
  padding-left: 32rpx;
  padding-right: 32rpx;
  padding-bottom: 32rpx;
}

// 3. 评价区
.comment-section {
  padding: 0 32rpx;
  margin-top: 40rpx;
  
  .section-header {
    display: flex;
    align-items: center;
    margin-bottom: 30rpx;
    
    .header-icon {
        width: 40rpx;
        height: 40rpx;
        margin-right: 12rpx;
    }
    
    .section-title {
      font-size: 36rpx;
      font-weight: 600;
      color: #333;
    }
    
    .section-subtitle {
        font-size: 28rpx;
        color: #999;
        margin-left: 8rpx;
        font-weight: normal;
    }
  }
}

// 4. FAB 按钮
.fab-btn {
  position: fixed;
  right: 48rpx;
  bottom: 80rpx;
  width: 112rpx;
  height: 112rpx;
  background: linear-gradient(135deg, #b20035, #ff4d6a);
  border-radius: 50%;
  box-shadow: 0 8rpx 24rpx rgba(178, 0, 53, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  transition: transform 0.05s;
  
  &:active {
    transform: scale(0.94);
  }
  
  .fab-icon {
    width: 56rpx;
    height: 56rpx;
    filter: brightness(100); 
  }
}

</style>
