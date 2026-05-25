<template>
  <view class="proposal-detail-page">
    
    <!-- 1. 头部 Header (与课程详情一致，但背景不同) -->
    <view class="detail-header" 
      :style="{ 
          height: (menuButtonInfo.bottom + 12) + 'px',
          paddingTop: menuButtonInfo.top + 'px'
      }"
    >
       <view class="nav-bar" :style="{ height: menuButtonInfo.height + 'px' }">
         <view class="back-btn-wrapper" @click="goBack" :style="{ width: menuButtonInfo.height + 'px', height: '100%' }">
            <BackBtn />
         </view>
         <view class="title-wrapper">
             <text class="page-title">新课提议详情</text>
         </view>
       </view>
    </view>

    <!-- 2. 内容滚动区域 -->
    <scroll-view scroll-y class="content-scroll" :style="{ paddingTop: (menuButtonInfo.bottom + 22) + 'px' }">
      
      <!-- 提议详情卡片 (样式类似课程卡片但带有提议特征) -->
      <view class="proposal-card">
          <view class="card-header">
              <view class="proposal-badge">提议中</view>
              <text class="proposal-date">{{ proposalData.date || '刚刚' }}</text>
          </view>
          
          <view class="proposal-title">{{ proposalData.name || '未命名提议' }}</view>
          
          <view class="proposal-info-row">
              <view class="info-item">
                  <text class="info-label">提议教师</text>
                  <text class="info-value">{{ proposalData.teacher || '待定' }}</text>
              </view>
              <view class="info-item">
                  <text class="info-label">校区</text>
                  <text class="info-value">{{ proposalData.campus || '全校' }}</text>
              </view>
              <view class="info-item">
                   <text class="info-label">类型</text>
                   <text class="info-value">{{ proposalData.category || '通识课' }}</text>
              </view>
          </view>
          
          <view class="proposal-reason-box">
              <text class="reason-label">提议理由</text>
              <text class="reason-content">{{ proposalData.reason || '该用户未填写详细理由。' }}</text>
          </view>

           <!-- 投票互动区 -->
           <view class="vote-area">
              <view class="vote-info">
                  <text class="vote-count-big">{{ proposalData.voteCount || 0 }}</text>
                  <text class="vote-text">人支持此提议</text>
              </view>
              <button
                class="vote-btn"
                :class="{ 'is-voted': isVoted }"
                @click="handleVote"
              >
                  {{ isVoted ? '已支持' : '🙋 支持提议' }}
              </button>
           </view>
       </view>

       <view class="bottom-spacer"></view>
    </scroll-view>

  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from "@dcloudio/uni-app";
import BackBtn from "@/components/common/BackBtn.vue";
import { http } from "@/config";

// 胶囊位置处理
const sysInfo = uni.getSystemInfoSync();
let menuButtonInfo = {
    top: sysInfo.statusBarHeight ? sysInfo.statusBarHeight + 4 : 48,
    height: 32,
    bottom: (sysInfo.statusBarHeight ? sysInfo.statusBarHeight + 4 : 48) + 32
};
try {
    const res = uni.getMenuButtonBoundingClientRect();
    if (res && res.top) {
        menuButtonInfo = {
            top: res.top,
            height: res.height,
            bottom: res.bottom
        };
    }
} catch (e) {}

interface PassedProposalData {
    id?: string;
    voteCount?: number;
    isVoted?: boolean;
    likeCnt?: number;
    [key: string]: any;
}

const proposalData = ref<PassedProposalData>({});
const isVoted = ref(false);

onLoad((options: any) => {
    if (options.data) {
        try {
            proposalData.value = JSON.parse(decodeURIComponent(options.data));
            if (proposalData.value.isVoted) isVoted.value = true;
        } catch (e) {
            console.error("Failed to parse proposal data", e);
        }
    }
});

const goBack = () => {
    uni.navigateBack();
};

const handleVote = async () => {
    if (isVoted.value || !proposalData.value.id) return;
    try {
        const res = await http.Like.likeCreate(proposalData.value.id, { targetId: proposalData.value.id, targetType: 'proposal' });
        const result = res.data?.data;
        if (result !== undefined) {
            if (result.like !== undefined) {
                isVoted.value = result.like;
            }
            if (result.likeCnt !== undefined) {
                proposalData.value.voteCount = result.likeCnt;
            }
            if (result.like) {
                uni.showToast({ title: '支持成功', icon: 'success' });
            }
        }
    } catch (err) {
        console.error('[proposal-detail] like error:', err);
        uni.showToast({ title: '支持失败', icon: 'none' });
    }
};
</script>

<style scoped lang="scss">
$brand-red: #b20035;
$bg-gradient-top: #fff5f5;

.proposal-detail-page {
    height: 100vh;
    background-color: #f7f8fa;
    display: flex;
    flex-direction: column;
}

.detail-header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 100;
    background: linear-gradient(to bottom, $bg-gradient-top, #ffffff);
    
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
            /* 确保返回按钮不被挤压 */
            margin-right: 12rpx; 
            flex-shrink: 0;
        }
        
        .title-wrapper {
            /* 移除居中定位，改为左对齐 */
            /* position: absolute; */
            /* left: 50%; */
            /* transform: translateX(-50%); */
            flex: 1;
            display: flex;
            align-items: center;
            
            .page-title {
                font-size: 32rpx;
                font-weight: 600;
                color: #333;
                /* 标题文字过长省略 */
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        }
    }
}

.content-scroll {
    flex: 1;
    box-sizing: border-box;
    padding: 0 32rpx;
}

.proposal-card {
    background: #fff;
    border-radius: 20rpx;
    padding: 40rpx;
    margin-bottom: 24rpx;
    box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.04);
    
    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20rpx;
        
        .proposal-badge {
            font-size: 20rpx;
            color: #fff;
            background-color: $brand-red;
            padding: 4rpx 12rpx;
            border-radius: 6rpx;
        }
        .proposal-date {
            font-size: 24rpx;
            color: #999;
        }
    }
    
    .proposal-title {
        font-size: 44rpx;
        font-weight: 700;
        color: #333;
        margin-bottom: 30rpx;
        line-height: 1.3;
    }
    
    .proposal-info-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 40rpx;
        
        .info-item {
            display: flex;
            flex-direction: column;
            
            .info-label {
                font-size: 24rpx;
                color: #999;
                margin-bottom: 8rpx;
            }
            .info-value {
                font-size: 28rpx;
                color: #333;
                font-weight: 500;
            }
        }
    }
    
    .proposal-reason-box {
        background-color: #f9f9f9;
        padding: 24rpx;
        border-radius: 12rpx;
        margin-bottom: 40rpx;
        
        .reason-label {
            font-size: 26rpx;
            font-weight: 600;
            color: #666;
            margin-bottom: 12rpx;
            display: block;
        }
        .reason-content {
            font-size: 28rpx;
            color: #333;
            line-height: 1.6;
        }
    }

    .vote-area {
        display: flex;
        align-items: center;
        justify-content: space-between;
        
        .vote-info {
            display: flex;
            align-items: baseline;
            .vote-count-big {
                font-size: 56rpx;
                color: $brand-red;
                font-weight: bold;
                margin-right: 8rpx;
            }
            .vote-text {
                font-size: 24rpx;
                color: #999;
            }
        }
        
        .vote-btn {
            margin: 0;
            background: linear-gradient(135deg, #b20035, #ff4d6a);
            color: #fff;
            border-radius: 40rpx;
            padding: 0 48rpx;
            font-size: 28rpx;
            height: 72rpx;
            line-height: 72rpx;
            box-shadow: 0 4rpx 12rpx rgba(178, 0, 53, 0.3);
            
            &.is-voted {
                background: #f0f0f0;
                color: #999;
                box-shadow: none;
            }
        }
    }
}

.bottom-spacer {
    height: 60rpx;
}
</style>
