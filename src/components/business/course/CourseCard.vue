<template>
  <div class="search-result-box"> <!-- Removed dynamic class binding to prevent double styles -->
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
    <div class="search-result" v-else>
      <view class="course-content">
          <view class="course-row-top">
              <text class="course-name">{{ props.data?.name }}</text>
              <text class="course-category">{{ props.data?.category }}</text>
          </view>
          
          <view class="course-row-middle">
               <view class="course-info-item" v-if="props.data?.teacherList?.length">
                    <image src="@/images/teacher-icon.png" class="info-icon" />
                    <text class="teacher-name-list">
                      {{ props.data.teacherList.map((t: any) => t.name).join(' / ') }}
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
              <text class="emoji-text">{{ item.tag }}</text>
              <view class="tag-count">{{ item.count }}</view>
            </view>
          </view>
           <!-- Description fallback -->
          <view class="desc" v-if="props.data?.describe">
            {{ props.data.describe }}
          </view>
      </view>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"; // Import computed
import type { CourseVO, TeacherVO } from "@/api/data-contracts";
import { getTop3List } from "@/utils/tags";

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

// Define props with default values or use defineProps directly
const props = defineProps<{ data: MixedResult }>(); // Use MixedResult 

const isProposal = computed(() => {
    return props.data?.resultType === 'proposal';
});
</script>

<style lang="scss" scoped>
.search-result-box {
  margin-top: 10rpx;
  /* Make box transparent or white as base */
  background-color: transparent; 
  /* Move shadow and radius to individual cards if they differ, or keep here */
  /* If cards have their own backgrounds, this wrapper should just layout */
}

.proposal-card {
  /* This has shadow and radius too? No, it inherits or redefined? */
  background: linear-gradient(145deg, #ffffff 0%, #fff5f6 100%);
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.03); 
  padding: 24rpx;

  .proposal-content {
      display: flex;
      flex-direction: column;

      .proposal-row-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20rpx;

          .proposal-name {
               font-size: 32rpx; /* Slightly larger title */
               font-weight: 700;
               color: #333; 
               line-height: 1.4;
               flex: 1;
          }
      }

      .proposal-row-middle {
          display: flex;
          flex-direction: row; 
          flex-wrap: wrap; 
          align-items: center;
          margin-bottom: 24rpx; /* Increased spacing */
          
          .proposal-info-item {
               display: flex;
               align-items: center;
               font-size: 26rpx; /* Larger text */
               color: #555; /* Darker grey */
               margin-right: 32rpx; 

               .info-icon {
                    width: 30rpx; /* Larger icon */
                    height: 30rpx;
                    margin-right: 10rpx;
                    opacity: 0.8; 
               }
          }
      }

      .proposal-row-bottom {
          display: flex;
          justify-content: space-between; /* Space out badge and vote */
          align-items: center;
          
           .proposal-badge {
             font-size: 22rpx;
             color: #b20035;
             background: rgba(178, 0, 53, 0.08);
             padding: 6rpx 12rpx;
             border-radius: 8rpx;
             white-space: nowrap;
             font-weight: 500;
         }

          .vote-count-box {
               display: flex;
               align-items: center;
               /* Removed background for cleaner look or keep if desired, let's keep it minimal */
               /* background: rgba(178, 0, 53, 0.05); */
               
               .vote-icon {
                    width: 28rpx;
                    height: 28rpx;
                    margin-right: 8rpx;
               }
               .vote-num {
                    font-size: 28rpx;
                    font-weight: 600;
                    color: #b20035;
                    margin-right: 4rpx;
               }
               .vote-label {
                    font-size: 22rpx;
                    color: #999;
                    margin-top: 4rpx; /* Align baseline */
               }
          }
      }
  }
}

.search-result {
  background-color: #ffffff;
  width: 100%; 
  box-sizing: border-box;
  /* Add card styling to course card */
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.03); 
  padding: 24rpx;
  display: flex;
  flex-direction: column;

  .course-content {
      /* Removed inner padding to avoid double padding */
      /* padding: 24rpx; */
      display: flex;
      flex-direction: column;

      .course-row-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start; /* Changed from center to flex-start to align top */
          margin-bottom: 20rpx;

          .course-name {
               font-size: 32rpx;
               font-weight: 700;
               color: #333; 
               line-height: 1.4;
               flex: 1;
               margin-right: 16rpx;
               
               display: -webkit-box;
               -webkit-line-clamp: 2; /* Limit to 2 lines */
               -webkit-box-orient: vertical;
               overflow: hidden;
          }
          .course-category {
               font-size: 22rpx;
               color: #666;
               background: #f0f0f0;
               padding: 6rpx 12rpx;
               border-radius: 8rpx;
               white-space: nowrap;
               margin-top: 6rpx; /* Slight margin top to align visually with text baseline if multi-line */
               flex-shrink: 0; /* Prevent shrinking */
          }
      }

      .course-row-middle {
          display: flex;
          flex-direction: row; 
          flex-wrap: wrap; 
          align-items: center;
          margin-bottom: 24rpx; 
          
          .course-info-item {
               display: flex;
               align-items: center;
               font-size: 26rpx; 
               color: #555; 
               margin-right: 32rpx; 

               .info-icon {
                    width: 30rpx; 
                    height: 30rpx;
                    margin-right: 10rpx;
                    opacity: 0.8; 
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
        
        .tag-item {
          display: flex;
          align-items: center;
          background: #fffcfc; /* Consistent with light theme */
          border: 1px solid #ffebeb;
          padding: 4rpx 12rpx;
          border-radius: 12rpx;
          margin-right: 16rpx;
          margin-bottom: 8rpx;

          .emoji-text {
            font-size: 22rpx;
            margin-right: 8rpx;
            color: #444;
          }

          .tag-count {
            font-size: 22rpx;
            color: #b20035;
            font-weight: 500;
          }
        }
      }
      
      .desc {
        width: 100%;
        margin-top: 10rpx;
        font-size: 24rpx;
        color: #999;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2; 
        line-clamp: 2;
        overflow: hidden;
      }
  }
}
</style>
<style scoped lang="scss">
@import "@/components/choose/choose-course/style.scss";
</style>