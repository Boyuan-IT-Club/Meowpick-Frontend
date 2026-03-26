<template>
  <top-bar :selected="2" />

  <!-- 正文内容区域 -->
  <view class="content">
    <!-- 加载状态 -->
    <view class="loading-state" v-if="loading">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 错误状态 -->
    <view class="error-state" v-else-if="error">
      <text class="error-text">加载失败，请点击重试</text>
      <button class="retry-btn" @click="fetchProposalDetail">重试</button>
    </view>

    <!-- 提案详情 -->
    <view class="proposal-detail" v-else>
      <view class="proposal-header">
        <text class="course-name">{{ proposal.courseName }}</text>
        <view class="course-detail">
          <text class="detail-item">校区：{{ proposal.campus }}</text>
          <text class="detail-item">教师：{{ proposal.teachers }}</text>
          <text class="detail-item">分类：{{ proposal.category }}</text>
        </view>
      </view>

      <view class="proposal-content">
        <view class="section">
          <text class="section-title">提议理由</text>
          <text class="section-content">{{ proposal.reason }}</text>
        </view>

        <view class="section">
          <text class="section-title">提议人</text>
          <text class="section-content">{{ proposal.creatorName || '匿名' }}</text>
        </view>

        <view class="section">
          <text class="section-title">提议时间</text>
          <text class="section-content">{{ proposal.createTime }}</text>
        </view>
      </view>

      <view class="proposal-action">
        <text class="agree-count">{{ proposal.agreeCount }}人同意</text>
        <button 
          class="agree-btn" 
          @click="handleAgree"
          :class="{ 'agreed': proposal.isAgreed }"
        >
          {{ proposal.isAgreed ? '已同意' : '同意' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import api from '@/config/utils/http';

// 提案详情数据结构
interface Proposal {
  id: string;
  courseName: string;
  campus: string;
  teachers: string;
  category: string;
  reason: string;
  agreeCount: number;
  isAgreed: boolean;
  creatorId: string;
  creatorName?: string;
  createTime: string;
}

// 提案详情数据
const proposal = ref<Proposal>({
  id: '',
  courseName: '',
  campus: '',
  teachers: '',
  category: '',
  reason: '',
  agreeCount: 0,
  isAgreed: false,
  creatorId: '',
  createTime: ''
});

// 加载状态
const loading = ref(true);
// 错误状态
const error = ref(false);
// 提案ID
const proposalId = ref('');

// 获取提案详情数据
const fetchProposalDetail = async () => {
  loading.value = true;
  error.value = false;
  
  try {
    const response = await api.ProposalController.proposalDetail(proposalId.value, proposalId.value);
    
    if (response.data.data) {
      const data = response.data.data.proposal;
      proposal.value = {
        id: data.id || '',
        courseName: data.course?.name || '',
        campus: data.course?.campuses?.join(', ') || '',
        teachers: data.course?.teachers?.map((t: any) => t.name).join(', ') || '',
        category: data.course?.category || '',
        reason: data.content || '',
        agreeCount: data.likeCnt || 0,
        isAgreed: data.like || false,
        creatorId: data.userId || '',
        creatorName: data.user?.name || '匿名',
        createTime: data.createdAt || ''
      };
    }
  } catch (err) {
    console.error('获取提案详情失败:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

// 同意/取消同意投票
const handleAgree = async () => {
  try {
    const response = await api.LikeController.likeCreate(proposal.value.id, {
      targetId: proposal.value.id,
      targetType: '1'
    });
    
    if (response.data.data) {
      const { like, likeCnt } = response.data.data;
      proposal.value.isAgreed = like || false;
      proposal.value.agreeCount = likeCnt || 0;
      uni.showToast({ title: like ? '已同意' : '已取消同意', icon: 'success' });
    }
  } catch (err) {
    console.error('操作失败:', err);
    uni.showToast({ title: '操作失败', icon: 'none' });
  }
};

// 页面加载时获取数据
onLoad((options: any) => {
  if (options.id) {
    proposalId.value = options.id;
    fetchProposalDetail();
  }
});

// 页面挂载时获取数据
onMounted(() => {
  if (proposalId.value) {
    fetchProposalDetail();
  }
});
</script>

<style scoped lang="scss">
  .content {
    padding-top: 28vw;
    padding-bottom: 25vw;
    width: 100%;
    box-sizing: border-box;
  }

  // 加载状态样式
  .loading-state {
    width: 100%;
    padding: 30vw 5vw 0;
    text-align: center;

    .loading-spinner {
      width: 10vw;
      height: 10vw;
      margin: 0 auto 3vw;
      border: 2px solid #ddd;
      border-top-color: #b70030;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .loading-text {
      font-size: 4vw;
      color: #666;
    }
  }

  // 错误状态样式
  .error-state {
    width: 100%;
    padding: 30vw 5vw 0;
    text-align: center;

    .error-text {
      font-size: 4vw;
      color: #f43f30;
      display: block;
      margin-bottom: 4vw;
    }

    .retry-btn {
      background-color: #b70030;
      color: white;
      border-radius: 4vw;
      font-size: 3.5vw;
      padding: 2vw 6vw;
      border: none;
    }
  }

  // 提案详情样式
  .proposal-detail {
    padding: 0 5vw;
  }

  .proposal-header {
    background-color: #ffffff;
    border-radius: 3vw;
    padding: 4vw;
    margin-bottom: 3vw;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .course-name {
    font-size: 4.5vw;
    font-weight: bold;
    color: #333333;
    display: block;
    margin-bottom: 2vw;
  }

  .course-detail {
    display: flex;
    flex-wrap: wrap;
    gap: 2vw;
    margin-bottom: 2vw;

    .detail-item {
      font-size: 3vw;
      color: #666666;
      background-color: #f5f5f5;
      padding: 0.5vw 2vw;
      border-radius: 2vw;
    }
  }

  .proposal-content {
    background-color: #ffffff;
    border-radius: 3vw;
    padding: 4vw;
    margin-bottom: 3vw;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .section {
    margin-bottom: 4vw;
  }

  .section:last-child {
    margin-bottom: 0;
  }

  .section-title {
    font-size: 3.5vw;
    font-weight: bold;
    color: #333333;
    display: block;
    margin-bottom: 2vw;
  }

  .section-content {
    font-size: 3.2vw;
    color: #555555;
    line-height: 1.5;
  }

  .proposal-action {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2vw;
    background-color: #ffffff;
    border-radius: 3vw;
    padding: 4vw;
    margin-bottom: 3vw;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .agree-count {
    font-size: 3.5vw;
    color: #b70030;
    font-weight: bold;
  }

  .agree-btn {
    width: 30vw;
    height: 10vw;
    background-color: #b70030;
    color: white;
    border-radius: 5vw;
    font-size: 3.5vw;
    line-height: 10vw;
    text-align: center;
    border: none;
    padding: 0;
  }

  .agree-btn.agreed {
    background-color: #ccc;
  }

  // 加载动画
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>