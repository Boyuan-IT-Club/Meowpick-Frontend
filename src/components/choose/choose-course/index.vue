// @ts-nocheck
<template>
  <view class="search-result-box"> <!-- Removed dynamic class binding to prevent double styles -->
    <!-- Proposal Card Style -->
    <template v-if="isProposal">
      <view class="proposal-card">
          <view class="proposal-content">
              <view class="proposal-row-top">
                  <text class="proposal-name">{{ props.data?.name }}</text>
              </view>
              
              <view class="proposal-row-middle">
                   <view class="proposal-info-item">
                        <image src="@/images/teacher-icon.png" class="info-icon" />
                        <text>{{ props.data?.teacherName || '未知教师' }}</text>
                   </view>
                   <view class="proposal-info-item">
                        <image src="@/images/depart-icon.png" class="info-icon" />
                        <text>{{ props.data?.department || '全校' }}</text>
                   </view>
              </view>

              <view class="proposal-row-bottom">
                  <text class="proposal-badge">提议新增</text>
                  <view class="vote-count-box">
                      <image src="@/images/like_active.png" class="vote-icon" />
                      <text class="vote-num">{{ props.data?.voteCount || props.data?.agreeCount || 0 }}</text>
                      <text class="vote-label">票</text>
                  </view>
              </view>
          </view>
      </view> 
    </template>

    <!-- Original Course Card Style -->
    <view class="search-result" v-else>
      <view class="course-content">
          <view class="course-row-top">
              <text class="course-name">{{ props.data?.name }}</text>
              <text class="course-category" v-if="props.data?.category">{{ props.data?.category }}</text>
          </view>
          
          <view class="course-row-middle">
               <view class="course-info-item" v-if="props.data?.teacherList?.length">
                    <image src="@/images/teacher-icon.png" class="info-icon" />
                    <text class="teacher-name-list">
                      {{ props.data.teacherList.map((t: any) => t.name).join(' / ') }}
                    </text>
               </view>
               <view class="course-info-item" v-else-if="props.data?.teachers?.length">
                    <image src="@/images/teacher-icon.png" class="info-icon" />
                    <text class="teacher-name-list">
                      {{ props.data.teachers.join(' / ') }}
                    </text>
               </view>
               <view class="course-info-item">
                    <image src="@/images/depart-icon.png" class="info-icon" />
                    <text>{{ props.data?.department || '暂无院系' }}</text>
               </view>
          </view>

           <!-- Tags section - Simplified -->
          <view class="course-row-bottom" v-if="props.data?.tagCount && Object.keys(props.data.tagCount).length > 0">
            <view
              v-for="(item, idx) of getTop3List(props.data?.tagCount!)"
              :key="idx"
              class="tag-item"
            >
              <image v-if="Emoji(item.tag)" :src="Emoji(item.tag)" class="emoji-icon" mode="aspectFit"></image>
              <image v-else src="@/images/cat.png" class="emoji-icon" mode="aspectFit"></image>
              <text class="emoji-text">{{ item.tag }}</text>
              <view class="tag-count">{{ item.count }}</view>
            </view>
          </view>
           <!-- Description fallback -->
          <view class="desc" v-if="props.data?.describe">
            {{ props.data.describe }}
          </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, defineProps } from "vue"; // Import computed
import type { CourseVO, TeacherVO } from "@/api/data-contracts";
import { Emoji, getTop3List } from "@/utils/tags";

// Extend type locally 
type MixedResult = CourseVO & {
  resultType?: string;
  matchScore?: number;
  tagCount?: object;
  teacherList?: TeacherVO[];
  describe?: string;
  reason?: string;
  proposalReason?: string;
  teacherName?: string; // Add teacherName
  voteCount?: number; // Add voteCount
  agreeCount?: number;
};

const props = defineProps<{ data: MixedResult }>(); // Use MixedResult

const isProposal = computed(() => {
    return props.data?.resultType === 'proposal';
});
</script>

<style lang="scss" scoped>
.search-result-box {
  margin-top: 20rpx;
  background-color: transparent; 
}

.proposal-card {
  background: linear-gradient(135deg, #fff5f6 0%, #ffffff 100%);
  border-radius: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(200, 16, 46, 0.06); 
  padding: 32rpx;
  border: 1px solid rgba(200, 16, 46, 0.15);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 4rpx 12rpx rgba(200, 16, 46, 0.04);
  }

  .proposal-content {
      display: flex;
      flex-direction: column;

      .proposal-row-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24rpx;

          .proposal-name {
               font-size: 36rpx;
               font-weight: 700;
               color: #1a1a1a; 
               line-height: 1.4;
               flex: 1;
               margin-right: 20rpx;
               letter-spacing: 1rpx;
          }
      }

      .proposal-row-middle {
          display: flex;
          flex-direction: row; 
          flex-wrap: wrap; 
          align-items: center;
          margin-bottom: 32rpx;
          background: rgba(255, 255, 255, 0.8);
          padding: 20rpx 24rpx;
          border-radius: 16rpx;
          border: 1px solid rgba(200, 16, 46, 0.08);
          box-shadow: inset 0 2rpx 8rpx rgba(0,0,0,0.01);
          
          .proposal-info-item {
               display: flex;
               align-items: center;
               font-size: 26rpx;
               color: #555;
               margin-right: 40rpx; 
               font-weight: 500;

               .info-icon {
                    width: 30rpx;
                    height: 30rpx;
                    margin-right: 12rpx;
                    opacity: 0.8; 
               }
          }
      }

      .proposal-row-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px dashed rgba(200, 16, 46, 0.15);
          padding-top: 24rpx;
          
           .proposal-badge {
             font-size: 24rpx;
             color: #c8102e;
             background: linear-gradient(90deg, rgba(200, 16, 46, 0.1), rgba(255, 77, 106, 0.1));
             padding: 10rpx 20rpx;
             border-radius: 30rpx;
             font-weight: 600;
             border: 1px solid rgba(200, 16, 46, 0.05);
         }

          .vote-count-box {
               display: flex;
               align-items: center;
               background: linear-gradient(90deg, #fff0f2, #fff5f6);
               padding: 10rpx 24rpx;
               border-radius: 30rpx;
               border: 1px solid rgba(200, 16, 46, 0.05);
               
               .vote-icon {
                    width: 30rpx;
                    height: 30rpx;
                    margin-right: 12rpx;
               }
               .vote-num {
                    font-size: 32rpx;
                    font-weight: 800;
                    color: #c8102e;
                    margin-right: 6rpx;
               }
               .vote-label {
                    font-size: 24rpx;
                    color: #c8102e;
                    opacity: 0.9;
                    font-weight: 500;
               }
          }
      }
  }
}

.search-result {
  background-color: #ffffff;
  width: 100%; 
  box-sizing: border-box;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.05); 
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.03);
  }

  .course-content {
      display: flex;
      flex-direction: column;

      .course-row-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24rpx;

          .course-name {
               font-size: 34rpx;
               font-weight: 600;
               color: #2c3e50; 
               line-height: 1.5;
               flex: 1;
               margin-right: 20rpx;
               
               display: -webkit-box;
               -webkit-line-clamp: 2;
               -webkit-box-orient: vertical;
               overflow: hidden;
          }
          .course-category {
               font-size: 24rpx;
               color: #0066cc;
               background: rgba(0, 102, 204, 0.08);
               padding: 8rpx 16rpx;
               border-radius: 30rpx;
               white-space: nowrap;
               font-weight: 500;
          }
      }

      .course-row-middle {
          display: flex;
          flex-direction: row; 
          flex-wrap: wrap; 
          align-items: center;
          margin-bottom: 28rpx; 
          
          .course-info-item {
               display: flex;
               align-items: center;
               font-size: 26rpx; 
               color: #666; 
               margin-right: 40rpx; 

               .info-icon {
                    width: 28rpx; 
                    height: 28rpx;
                    margin-right: 12rpx;
                    opacity: 0.7; 
               }
               
               .teacher-name-list {
                    max-width: 300rpx;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
               }
          }
      }

      .course-row-bottom {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        background: #f8f9fa;
        padding: 16rpx 20rpx;
        border-radius: 12rpx;

        .tag-item {
          display: flex;
          align-items: center;
          background: #ffffff;
          border: 1px solid #eee;
          padding: 6rpx 16rpx;
          border-radius: 30rpx;
          margin-right: 16rpx;
          box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.02);

          .emoji-icon {
            width: 32rpx;
            height: 32rpx;
            margin-right: 8rpx;
            display: block;
          }

          .emoji-text {
            font-size: 26rpx;
            margin-right: 10rpx;
          }

          .tag-count {
            font-size: 24rpx;
            color: #c8102e;
            font-weight: 600;
          }
        }
      }
      
      .desc {
        width: 100%;
        margin-top: 20rpx;
        font-size: 26rpx;
        color: #888;
        line-height: 1.6;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2; 
        line-clamp: 2;
        overflow: hidden;
        background: #fcfcfc;
        padding: 16rpx;
        border-radius: 12rpx;
        border-left: 6rpx solid #eee;
      }
  }
}
</style>