<template>
  <view class="proposal-detail-page">

    <!-- 1. 新的头部 Header (与课程详情一致) -->
    <!-- 背景改为渐变色以区分 Proposal -->
    <view class="detail-header"
      :style="{
          height: (menuButtonInfo.bottom + 12) + 'px',
          paddingTop: menuButtonInfo.top + 'px'
      }"
    >
       <view class="nav-bar" :style="{ height: menuButtonInfo.height + 'px' }">
         <view class="back-btn-wrapper" @click="goBack" :style="{ width: menuButtonInfo.height + 'px', height: '100%' }">
             <!-- 简单返回箭头 -->
            <text class="back-text">←</text>
         </view>
         <view class="title-wrapper">
             <text class="page-title">提议详情</text>
         </view>
       </view>
    </view>

    <!-- 2. 内容滚动区域 -->
    <scroll-view scroll-y class="content-scroll" :style="{ paddingTop: (menuButtonInfo.bottom + 20) + 'px' }">

      <!-- 加载状态 -->
      <view class="loading-state" v-if="loading">
        <view class="loading-spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 错误状态 -->
      <view class="error-state" v-else-if="error">
        <text class="error-text">加载失败</text>
        <button class="retry-btn" @click="handleRetry">重试</button>
      </view>

      <!-- 提议详情卡片 -->
      <template v-else>
      <view class="proposal-card">
          <view class="card-header">
              <view class="proposal-badge">新课提议</view>
              <text class="proposal-date">{{ proposalData.date || '刚刚' }}</text>
          </view>

          <view class="proposal-title">{{ proposalData.name || '未命名提议' }}</view>

          <view class="proposal-info-row">
              <view class="info-item">
                  <text class="info-label">提议教师：</text>
                  <text class="info-value">{{ proposalData.teacher || '待定' }}</text>
              </view>
              <view class="info-item">
                  <text class="info-label">校区：</text>
                  <text class="info-value">{{ proposalData.campus || '全校' }}</text>
              </view>
          </view>

          <view class="proposal-reason-box">
              <text class="reason-label">提议理由：</text>
              <text class="reason-content">{{ proposalData.reason || '这是用户提交的新课提议，希望学校能开设这门课程。' }}</text>
          </view>

          <!-- 投票互动区 -->
          <view class="vote-area">
              <view class="vote-stats">
                  <text class="vote-num">{{ proposalData.voteCount || 0 }}</text>
                  <text class="vote-desc">人已支持</text>
              </view>
              <button
                class="vote-btn"
                :class="{ 'is-voted': isVoted }"
                @click="handleVote"
              >
                  {{ isVoted ? '已支持' : '👍 支持一下' }}
              </button>
          </view>
      </view>

      <!-- 讨论区 (模拟评论区) -->
      <view class="discussion-section">
        <view class="section-header">
           <text class="section-title">讨论区</text>
           <text class="section-count">(0)</text>
        </view>

        <view class="empty-discussion">
            <image src="@/images/cat.png" mode="aspectFit" class="empty-icon" />
            <text>暂时还没有讨论，快来抢沙发~</text>
        </view>
      </view>
      </template>

      <view class="bottom-spacer"></view>
    </scroll-view>

    <!-- 4. 悬浮按钮 (参与讨论) -->
    <view class="fab-btn" @click="handleComment">
        <text class="fab-text">💬</text>
    </view>

  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from "@dcloudio/uni-app";
import { http } from "@/config";

// 1. 获取胶囊位置
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

const proposalData = ref<any>({});
const isVoted = ref(false);
const loading = ref(true);
const error = ref(false);

const fetchProposal = (id: string) => {
  loading.value = true;
  error.value = false;

  http.ProposalController.proposalDetail('', id).then((res: any) => {
    const data = res.data?.data?.proposal || res.data?.proposal || {};
    proposalData.value = {
      name: data.title || data.course?.name || '未命名提议',
      campus: (data.course?.campuses || []).join('、') || '全校',
      teacher: data.course?.teachers?.map((t: any) => t.name).join('、') || '待定',
      reason: data.content || '',
      voteCount: data.likeCnt || data.agreeCount || 0,
      date: data.createdAt ? new Date(data.createdAt).toISOString().split('T')[0] : '刚刚',
      status: data.status || 'pending'
    };
    isVoted.value = data.like || false;
    loading.value = false;
  }).catch((err: any) => {
    console.error('[proposal detail] fetch error:', err);
    loading.value = false;
    error.value = true;
    // 如果传入的是 JSON 数据，尝试解析作为后备
    if (options?.data) {
      try {
        proposalData.value = JSON.parse(decodeURIComponent(options.data));
        if (proposalData.value.isVoted) isVoted.value = true;
        loading.value = false;
        error.value = false;
      } catch (e) {}
    }
  });
};

let options: any = {};
onLoad((opts: any) => {
  options = opts;
  if (opts.id) {
    fetchProposal(opts.id);
  } else if (opts.data) {
    try {
      proposalData.value = JSON.parse(decodeURIComponent(opts.data));
      if (proposalData.value.isVoted) isVoted.value = true;
    } catch (e) {
      console.error("Failed to parse proposal data", e);
    }
  }
});

const goBack = () => {
    uni.navigateBack();
};

const handleVote = () => {
    if (isVoted.value) return;
    isVoted.value = true;
    proposalData.value.voteCount = (proposalData.value.voteCount || 0) + 1;
    uni.showToast({ title: '支持成功', icon: 'success' });
};

const handleComment = () => {
    uni.showToast({ title: '功能开发中', icon: 'none' });
};

const handleRetry = () => {
  if (options?.id) {
    fetchProposal(options.id);
  }
};
</script>

<style scoped lang="scss">
$brand-red: #c8102e;
$proposal-bg-start: #fff0f0;
$proposal-bg-end: #f8f9fa;

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
    background: linear-gradient(to bottom, $proposal-bg-start, #ffffff);
    display: flex;
    flex-direction: column;
    box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.02);

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
        }
        
        .title-wrapper {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            
            .page-title {
                font-size: 32rpx;
                font-weight: 600;
                color: #333;
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
    border-radius: 24rpx;
    padding: 40rpx 32rpx;
    box-shadow: 0 8rpx 24rpx rgba(255, 77, 79, 0.08);
    border: 1rpx solid rgba(255, 77, 79, 0.1);
    margin-bottom: 30rpx;
    
    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24rpx;
        
        .proposal-badge {
            background-color: #fff0f0;
            color: $brand-red;
            font-size: 22rpx;
            padding: 6rpx 16rpx;
            border-radius: 8rpx;
            font-weight: 600;
        }
        
        .proposal-date {
            font-size: 24rpx;
            color: #999;
        }
    }
    
    .proposal-title {
        font-size: 40rpx;
        font-weight: 700;
        color: #333;
        line-height: 1.4;
        margin-bottom: 30rpx;
    }
    
    .proposal-info-row {
        display: flex;
        gap: 40rpx;
        margin-bottom: 30rpx;
        background-color: #fcfcfc;
        padding: 20rpx;
        border-radius: 12rpx;
        
        .info-item {
            display: flex;
            flex-direction: column;
            
            .info-label {
                font-size: 22rpx;
                color: #999;
                margin-bottom: 4rpx;
            }
            .info-value {
                font-size: 28rpx;
                color: #333;
                font-weight: 500;
            }
        }
    }
    
    .proposal-reason-box {
        margin-bottom: 40rpx;
        
        .reason-label {
            font-size: 28rpx;
            font-weight: 600;
            color: #555;
            display: block;
            margin-bottom: 12rpx;
        }
        
        .reason-content {
            font-size: 28rpx;
            color: #444;
            line-height: 1.6;
            text-align: justify;
        }
    }
    
    .vote-area {
        border-top: 1rpx solid #eee;
        padding-top: 30rpx;
        display: flex;
        align-items: center;
        justify-content: space-between;
        
        .vote-stats {
            display: flex;
            align-items: baseline;
            
            .vote-num {
                font-size: 48rpx;
                font-weight: 700;
                color: $brand-red;
                margin-right: 8rpx;
            }
            
            .vote-desc {
                font-size: 24rpx;
                color: #999;
            }
        }
        
        .vote-btn {
            background: $brand-red;
            color: #fff;
            font-size: 28rpx;
            padding: 0 48rpx;
            height: 80rpx;
            line-height: 80rpx;
            border-radius: 40rpx;
            border: none;
            box-shadow: 0 6rpx 16rpx rgba(200, 16, 46, 0.3);
            transition: all 0.2s;
            margin: 0;
            
            &.is-voted {
                background: #eee;
                color: #999;
                box-shadow: none;
            }
            
            &:active {
                transform: scale(0.98);
            }
        }
    }
}

.discussion-section {
    background-color: #fff;
    border-radius: 24rpx;
    padding: 30rpx;
    min-height: 400rpx;
    
    .section-header {
        display: flex;
        align-items: baseline;
        margin-bottom: 40rpx;
        
        .section-title {
            font-size: 32rpx;
            font-weight: 700;
            color: #333;
            margin-right: 12rpx;
        }
        
        .section-count {
            font-size: 24rpx;
            color: #999;
        }
    }
    
    .empty-discussion {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding-top: 40rpx;
        
        .empty-icon {
            width: 160rpx;
            height: 160rpx;
            opacity: 0.5;
            margin-bottom: 20rpx;
        }
        
        text {
            color: #999;
            font-size: 26rpx;
        }
    }
}

.bottom-spacer {
    height: 120rpx; /* Space for FAB */
}

// 加载状态
.loading-state {
    width: 100%;
    padding: 200rpx 0;
    text-align: center;

    .loading-spinner {
        width: 80rpx;
        height: 80rpx;
        margin: 0 auto 24rpx;
        border: 4rpx solid #ddd;
        border-top-color: #c8102e;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    .loading-text {
        font-size: 28rpx;
        color: #666;
    }
}

// 错误状态
.error-state {
    width: 100%;
    padding: 200rpx 0;
    text-align: center;

    .error-text {
        font-size: 28rpx;
        color: #f43f30;
        display: block;
        margin-bottom: 32rpx;
    }

    .retry-btn {
        background-color: #c8102e;
        color: white;
        border-radius: 24rpx;
        font-size: 28rpx;
        padding: 16rpx 48rpx;
        border: none;
    }
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.fab-btn {
    position: fixed;
    right: 40rpx;
    bottom: 60rpx;
    width: 100rpx;
    height: 100rpx;
    background-color: $brand-red;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 8rpx 20rpx rgba(200, 16, 46, 0.4);
    z-index: 99;

    .fab-text {
        font-size: 40rpx;
        color: #fff;
    }
}
</style>