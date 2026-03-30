<!-- d:\MeowPick\Meowpick-Frontend\src\pages\proposal\detail.vue -->
<template>
  <view class="proposal-detail-page">
    
    <!-- 头部 Header -->
    <view class="detail-header" 
      :style="{ 
          height: (menuButtonInfo.bottom + 12) + 'px',
          paddingTop: menuButtonInfo.top + 'px'
      }"
    >
       <view class="nav-bar" :style="{ height: menuButtonInfo.height + 'px' }">
         <view class="back-btn-wrapper" @click="goBack" :style="{ width: menuButtonInfo.height + 'px', height: '100%' }">
            <text class="back-text">←</text>
         </view>
         <view class="title-wrapper">
             <text class="page-title">提议详情</text>
         </view>
       </view>
    </view>

    <!-- 内容滚动区域 -->
    <scroll-view scroll-y class="content-scroll" :style="{ paddingTop: (menuButtonInfo.bottom + 20) + 'px' }">
      
      <!-- 提议详情卡片 -->
      <view class="proposal-card">
          <view class="card-header">
              <view class="proposal-badge">新课提议</view>
              <text class="proposal-date">{{ formatDate(proposalData.date) }}</text>
          </view>
          
          <view class="proposal-title">{{ proposalData.courseName || '未命名提议' }}</view>
          
          <view class="proposal-info-row single-item">
              <view class="info-item full-width">
                  <text class="info-label">提议教师：</text>
                  <text class="info-value">{{ proposalData.teachers || '待定' }}</text>
              </view>
          </view>
          
          <view class="proposal-info-row single-item">
              <view class="info-item full-width">
                  <text class="info-label">校区：</text>
                  <text class="info-value">{{ proposalData.campus || '全校' }}</text>
              </view>
          </view>
          
          <view class="proposal-info-row single-item">
              <view class="info-item full-width">
                  <text class="info-label">院系：</text>
                  <text class="info-value">{{ proposalData.department || '未知院系' }}</text>
              </view>
          </view>
          
          <view class="proposal-info-row single-item">
              <view class="info-item full-width">
                  <text class="info-label">分类：</text>
                  <text class="info-value">{{ proposalData.category || '未分类' }}</text>
              </view>
          </view>
          
          <view class="proposal-reason-box">
              <text class="reason-label">提议理由：</text>
              <text class="reason-content">{{ proposalData.reason || '暂无理由' }}</text>
          </view>
          
          <!-- 投票互动区 -->
          <view class="vote-area">
              <view class="vote-stats">
                  <text class="vote-num">{{ proposalData.agreeCount || 0 }}</text>
                  <text class="vote-desc">人已支持</text>
              </view>
              <button 
                class="vote-btn" 
                :class="{ 'is-voted': proposalData.isAgreed }"
                @click="handleVote"
              >
                  {{ proposalData.isAgreed ? '已支持' : '👍 支持一下' }}
              </button>
          </view>
      </view>
      
      <!-- 讨论区 -->
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
      
      <view class="bottom-spacer"></view>
    </scroll-view>

    <!-- 悬浮按钮 -->
    <view class="fab-btn" @click="handleComment">
        <text class="fab-text">💬</text>
    </view>

  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from "@dcloudio/uni-app";

// 获取胶囊位置
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

// 当前用户ID
const currentUserId = 'user_123456';

// 提案数据
const proposalData = ref<any>({});

// 格式化时间为YYYY-MM-DD格式
const formatDate = (dateString: string) => {
    if (!dateString) return '刚刚';
    
    try {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (e) {
        console.error('日期格式化失败:', e);
        return '刚刚';
    }
};

onLoad((options: any) => {
    if (options.data) {
        try {
            const data = JSON.parse(decodeURIComponent(options.data));
            proposalData.value = {
                ...data,
                isAgreed: data.agreeUserIds?.includes(currentUserId) || false
            };
        } catch (e) {
            console.error("解析提案数据失败", e);
            uni.showToast({ title: '数据加载失败', icon: 'none' });
        }
    }
});

const goBack = () => {
    uni.navigateBack();
};

const handleVote = () => {
    if (proposalData.value.isAgreed) {
        // 取消支持
        proposalData.value.isAgreed = false;
        proposalData.value.agreeCount = Math.max(0, (proposalData.value.agreeCount || 0) - 1);
        if (proposalData.value.agreeUserIds) {
            const idx = proposalData.value.agreeUserIds.indexOf(currentUserId);
            if (idx > -1) {
                proposalData.value.agreeUserIds.splice(idx, 1);
            }
        }
        uni.showToast({ title: '已取消支持', icon: 'success' });
    } else {
        // 支持
        proposalData.value.isAgreed = true;
        proposalData.value.agreeCount = (proposalData.value.agreeCount || 0) + 1;
        if (!proposalData.value.agreeUserIds) {
            proposalData.value.agreeUserIds = [];
        }
        proposalData.value.agreeUserIds.push(currentUserId);
        uni.showToast({ title: '支持成功', icon: 'success' });
    }
};

const handleComment = () => {
    uni.showToast({ title: '功能开发中', icon: 'none' });
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
        margin-bottom: 20rpx;
        background-color: #fcfcfc;
        padding: 20rpx;
        border-radius: 12rpx;
        
        &.single-item {
            flex-direction: column;
            gap: 0;
        }
        
        .info-item {
            display: flex;
            flex-direction: column;
            
            &.full-width {
                width: 100%;
            }
            
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
            background: linear-gradient(90deg, #b70030, #ff4d6a);
            color: #fff;
            border-radius: 40rpx;
            padding: 16rpx 40rpx;
            font-size: 28rpx;
            font-weight: 600;
            border: none;
            box-shadow: 0 4rpx 16rpx rgba(183, 0, 48, 0.2);
            
            &.is-voted {
                background: #ccc;
                box-shadow: none;
            }
            
            &:active {
                transform: scale(0.96);
            }
        }
    }
}

.discussion-section {
    background: #fff;
    border-radius: 24rpx;
    padding: 32rpx;
    box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.02);
    
    .section-header {
        display: flex;
        align-items: center;
        margin-bottom: 40rpx;
        
        .section-title {
            font-size: 32rpx;
            font-weight: 700;
            color: #333;
        }
        
        .section-count {
            font-size: 26rpx;
            color: #999;
            margin-left: 12rpx;
        }
    }
    
    .empty-discussion {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 60rpx 0;
        
        .empty-icon {
            width: 120rpx;
            height: 120rpx;
            margin-bottom: 20rpx;
            opacity: 0.6;
        }
        
        text {
            font-size: 26rpx;
            color: #999;
        }
    }
}

.bottom-spacer {
    height: 120rpx;
}

.fab-btn {
    position: fixed;
    right: 40rpx;
    bottom: 60rpx;
    width: 100rpx;
    height: 100rpx;
    background: linear-gradient(135deg, #b70030, #ff4d6a);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8rpx 24rpx rgba(183, 0, 48, 0.3);
    z-index: 100;
    
    &:active {
        transform: scale(0.92);
    }
    
    .fab-text {
        font-size: 40rpx;
    }
}
</style>