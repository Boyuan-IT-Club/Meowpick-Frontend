<template>
  <view class="course-header-container">
    <view class="header-card">
      
      <!-- 1. 课程名称 -->
      <view class="card-top">
        <view class="course-title">{{ data.name || '未知课程' }}</view>
      </view>

      <!-- 2. 基本信息 Grid -->
      <view class="info-grid">
        
        <!-- 类别 -->
        <view class="info-item">
           <view class="icon-wrapper bg-blue">
             <image src="@/images/category-icon.png" class="icon" mode="aspectFit" />
           </view>
           <view class="info-content">
             <text class="label">课程类别</text>
             <text class="value">{{ data.category || '暂无分类' }}</text>
           </view>
        </view>

        <!-- 院系 -->
        <view class="info-item">
           <view class="icon-wrapper bg-green">
             <image src="@/images/depart-icon.png" class="icon" mode="aspectFit" />
           </view>
           <view class="info-content">
             <text class="label">开课院系</text>
             <text class="value">{{ data.department || '暂无院系' }}</text>
           </view>
        </view>

        <!-- 教师 -->
        <view class="info-item">
           <view class="icon-wrapper bg-orange">
             <image src="@/images/teacher-icon.png" class="icon" mode="aspectFit" />
           </view>
           <view class="info-content">
             <text class="label">任课教师</text>
             <view class="value-list">
                <text v-for="(t, i) in teacherNames" :key="i" class="teacher-name">{{ t }}</text>
                <text v-if="!teacherNames?.length">待定</text>
             </view>
           </view>
        </view>

        <!-- 校区 -->
        <view class="info-item">
           <view class="icon-wrapper bg-purple">
             <image src="@/images/campus-icon.png" class="icon" mode="aspectFit" />
           </view>
           <view class="info-content">
             <text class="label">开设校区</text>
             <text class="value">{{ (data.campuses || []).join('、') || '暂无校区' }}</text>
           </view>
        </view>

      </view>
      
      <!-- 3. 标签/描述 (如果有) -->
      <view class="tags-section" v-if="data.describe">
          <text class="desc-text">{{ data.describe }}</text>
      </view>

    </view>
  </view>
</template>

<script setup lang="ts">
// @ts-nocheck
import type { CourseVO } from "@/api/data-contracts";

type Props = {
  data: CourseVO;
};
const props = defineProps<Props>();

// 教师名称列表（处理 DtoTeacherVO 对象数组）
const teacherNames = computed(() => {
  if (!props.data) return [];
  // Fallback: try teachers first, then teacherList (as used in search results)
  const list = props.data.teachers || props.data.teacherList || [];
  return list
    .map((t: any) => t?.name || '')
    .filter((name: string) => name !== '');
});
</script>

<style scoped lang="scss">
.course-header-container {
  padding: 0 4vw; // 左右留白
  margin-top: 24rpx; // 保持正间距
  position: relative;
  z-index: 10;
}

.header-card {
  background-color: #ffffff;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
  padding: 40rpx 32rpx;
  display: flex;
  flex-direction: column;
}

// 1. 顶部
.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 40rpx;
  
  .course-title {
    font-size: 40rpx;
    font-weight: 600;
    color: #333;
    line-height: 1.4;
    flex: 1;
    margin-right: 20rpx;
  }
}

// 2. Grid 布局
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 32rpx 20rpx;
  
  .info-item {
    display: flex;
    align-items: center;
    
    .icon-wrapper {
      width: 80rpx;
      height: 80rpx;
      border-radius: 20rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 20rpx;
      flex-shrink: 0;
      
      &.bg-blue { background-color: rgba(52, 152, 219, 0.1); }
      &.bg-green { background-color: rgba(46, 204, 113, 0.1); }
      &.bg-orange { background-color: rgba(243, 156, 18, 0.1); }
      &.bg-purple { background-color: rgba(155, 89, 182, 0.1); }
      
      .icon {
        width: 40rpx;
        height: 40rpx;
      }
    }
    
    .info-content {
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: hidden;
      
      .label {
        font-size: 24rpx;
        color: #999;
        margin-bottom: 4rpx;
      }
      
      .value {
        font-size: 28rpx;
        color: #333;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .value-list {
          display: flex;
          flex-wrap: wrap;
          .teacher-name {
              margin-right: 10rpx;
              font-size: 28rpx;
              color: #333;
              font-weight: 500;
              &:not(:last-child)::after {
                  content: '、';
              }
          }
      }
    }
  }
}

// 3. 底部描述
.tags-section {
    margin-top: 40rpx;
    padding-top: 24rpx;
    border-top: 2rpx dashed #f0f0f0;
    
    .desc-text {
        font-size: 26rpx;
        color: #666;
        line-height: 1.6;
    }
}

</style>
