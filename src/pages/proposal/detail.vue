<template>
  <view class="proposal-detail-page">
    
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

    <scroll-view scroll-y class="content-scroll" :style="{ paddingTop: (menuButtonInfo.bottom + 20) + 'px' }" refresher-enabled :refresher-triggered="isRefreshing" @refresherrefresh="onRefresh">
      
      <view v-if="pageLoading" class="loading-state">
        <text class="loading-text">加载中...</text>
      </view>
      
      <view v-else class="proposal-card">
          <view class="card-header">
              <view class="proposal-badge">新课提议</view>
              <text class="proposal-date">{{ formatDate(proposalData.createdAt) }}</text>
          </view>
          
          <view class="proposal-title">{{ proposalData.title || '未命名提议' }}</view>
          
          <view class="proposal-info-row single-item" v-if="teacherNames">
              <view class="info-item full-width">
                  <text class="info-label">提议教师：</text>
                  <text class="info-value">{{ teacherNames }}</text>
              </view>
          </view>
          
          <view class="proposal-info-row single-item" v-if="campusText">
              <view class="info-item full-width">
                  <text class="info-label">校区：</text>
                  <text class="info-value">{{ campusText }}</text>
              </view>
          </view>
          
          <view class="proposal-info-row single-item" v-if="proposalData.course?.department">
              <view class="info-item full-width">
                  <text class="info-label">院系：</text>
                  <text class="info-value">{{ proposalData.course.department }}</text>
              </view>
          </view>
          
          <view class="proposal-info-row single-item" v-if="proposalData.course?.category">
              <view class="info-item full-width">
                  <text class="info-label">分类：</text>
                  <text class="info-value">{{ proposalData.course.category }}</text>
              </view>
          </view>
          
          <view class="proposal-reason-box">
              <text class="reason-label">提议理由：</text>
              <text class="reason-content">{{ proposalData.content || '暂无理由' }}</text>
          </view>
          
          <view class="vote-area">
              <view class="vote-stats">
                  <text class="vote-num">{{ proposalData.likeCnt || 0 }}</text>
                  <text class="vote-desc">人已支持</text>
              </view>
              <button 
                class="vote-btn" 
                :class="{ 'is-voted': proposalData.like }"
                @click="handleVote"
              >
                  {{ proposalData.like ? '已支持' : '👍 支持一下' }}
              </button>
          </view>
      </view>
      
      <view class="bottom-spacer"></view>
    </scroll-view>

  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from "@dcloudio/uni-app";
import { http } from '@/config';

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
const proposalId = ref('');
const pageLoading = ref(true);
const isRefreshing = ref(false);

const teacherNames = computed(() => {
    const teachers = proposalData.value.course?.teachers;
    if (!teachers || !Array.isArray(teachers) || teachers.length === 0) return '';
    return teachers.map((t: any) => typeof t === 'string' ? t : t.name || '').join('、');
});

const campusText = computed(() => {
    const campuses = proposalData.value.course?.campuses;
    if (!campuses || !Array.isArray(campuses) || campuses.length === 0) return '';
    return campuses.join('、');
});

const formatDate = (dateString: string) => {
    if (!dateString) return '刚刚';
    
    try {
        let normalized = dateString;
        if (!normalized.includes('Z') && !normalized.includes('+') && !normalized.includes('T')) {
            normalized = normalized.replace(' ', 'T') + 'Z';
        } else if (normalized.includes('T') && !normalized.includes('Z') && !normalized.includes('+')) {
            normalized = normalized + 'Z';
        }
        const date = new Date(normalized);
        if (isNaN(date.getTime())) return '刚刚';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (e) {
        return '刚刚';
    }
};

const fetchProposalDetail = async () => {
    if (!proposalId.value) return;
    
    try {
        const res = await http.ProposalController.proposalDetail(proposalId.value, proposalId.value);
        console.log('[DEBUG] proposalDetail response:', JSON.stringify(res.data));
        
        let proposal = null;
        if (res.data?.proposal) {
            proposal = res.data.proposal;
        } else if (res.data?.data?.proposal) {
            proposal = res.data.data.proposal;
        } else if (res.data?.data?.data?.proposal) {
            proposal = res.data.data.data.proposal;
        }
        
        if (proposal) {
            proposalData.value = proposal;
        } else {
            console.error('[API] 无法从响应中提取提案数据, res.data keys:', Object.keys(res.data || {}));
        }
    } catch (err) {
        console.error('[API] 获取提案详情失败:', err);
    } finally {
        pageLoading.value = false;
        isRefreshing.value = false;
    }
};

onLoad((options: any) => {
    console.log('[DEBUG] detail onLoad options:', JSON.stringify(options));
    if (options.id) {
        proposalId.value = options.id;
    }
    
    if (options.data) {
        try {
            const data = JSON.parse(decodeURIComponent(options.data));
            
            const existingCourse = data.course || {};
            const teachers = existingCourse.teachers
                || (data.teachers
                    ? (typeof data.teachers === 'string'
                        ? data.teachers.split('、').filter(Boolean).map((t: string) => ({ name: t.trim() }))
                        : data.teachers)
                    : []);
            const campuses = existingCourse.campuses
                || (data.campus
                    ? (typeof data.campus === 'string'
                        ? data.campus.split('、').filter(Boolean).map((c: string) => c.trim())
                        : data.campus)
                    : []);
            
            proposalData.value = {
                ...data,
                title: data.title || data.courseName || '',
                content: data.content || data.reason || '',
                likeCnt: data.likeCnt ?? data.agreeCount ?? 0,
                like: data.like ?? data.isAgreed ?? false,
                createdAt: data.createdAt || data.date || '',
                course: {
                    ...existingCourse,
                    teachers,
                    campuses,
                    department: existingCourse.department || data.department || '',
                    category: existingCourse.category || data.category || '',
                }
            };
            if (!proposalId.value && data.id) {
                proposalId.value = data.id;
            }
            pageLoading.value = false;
        } catch (e) {
            console.error("解析提案数据失败", e);
        }
    }
    
    if (proposalId.value) {
        fetchProposalDetail();
    } else {
        pageLoading.value = false;
    }
});

const onRefresh = async () => {
    isRefreshing.value = true;
    await fetchProposalDetail();
};

const goBack = () => {
    uni.$emit('proposalLikeUpdated', {
        id: proposalId.value,
        like: proposalData.value.like,
        likeCnt: proposalData.value.likeCnt
    });
    uni.navigateBack();
};

const handleVote = async () => {
    if (!proposalId.value) {
        uni.showToast({ title: '操作失败', icon: 'none' });
        return;
    }

    try {
        const res = await http.LikeController.likeCreate(proposalId.value, {
            targetId: proposalId.value,
            targetType: 'proposal'
        });

        if (res.data?.code === 0) {
            const isLiked = res.data?.like ?? res.data?.data?.like ?? !proposalData.value.like;
            const newCnt = res.data?.likeCnt ?? res.data?.data?.likeCnt ?? 
                (isLiked ? (proposalData.value.likeCnt || 0) + 1 : (proposalData.value.likeCnt || 1) - 1);
            proposalData.value = { 
                ...proposalData.value, 
                like: isLiked, 
                likeCnt: newCnt 
            };
            uni.showToast({ title: isLiked ? '已支持' : '已取消支持', icon: 'success' });
            uni.$emit('proposalLikeUpdated', {
                id: proposalId.value,
                like: isLiked,
                likeCnt: newCnt
            });
        } else {
            uni.showToast({ title: '操作失败', icon: 'none' });
        }
    } catch (err) {
        console.error('[API] 点赞失败:', err);
        uni.showToast({ title: '操作失败', icon: 'none' });
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

.loading-state {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40vw 0;
    
    .loading-text {
        font-size: 3.5vw;
        color: #999;
    }
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

.bottom-spacer {
    height: 60rpx;
}
</style>
