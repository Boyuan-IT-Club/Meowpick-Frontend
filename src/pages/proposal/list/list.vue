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
        <button class="retry-btn" @click="fetchProposals">重试</button>
      </view>

      <!-- 投票列表 -->
      <view class="proposal-list" v-else-if="proposals.length > 0">
        <!-- 暂时使用原生列表，稍后替换为 <CourseCard /> 测试 -->
        <CourseCard 
          v-for="(item, index) in proposals" 
          :key="item.id" 
          :data="{
            ...item,
            resultType: 'proposal',
            name: item.courseName,
            teacherName: item.teachers,
            department: item.category, // 使用 category 作为院系占位
            voteCount: item.agreeCount
          }"
        />
        <!-- 原始代码保留以防测试失败 -->
        <!-- <view class="proposal-item" v-for="(item, index) in proposals" :key="item.id"> ... </view> -->
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-else>
        <text>暂无投票提案，快来发起第一个吧～</text>
        <button class="empty-btn" @click="goToPropose">发起投票</button>
      </view>
    </view>

    <!-- 右下角加号按钮 -->
    <button class="add-btn" @click="goToPropose">
      <text class="plus">+</text>
    </button>
</template>

<script setup lang="ts">
import { reactive, onMounted, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import CourseCard from '@/components/business/course/CourseCard.vue';
import { useTokenStore, http } from '@/config';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';

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
  agreeUserIds?: string[];
}

const tokenStore = useTokenStore();
const proposals = reactive<Proposal[]>([]);
const loading = ref(true);
const error = ref(false);
const currentUserId = ref(tokenStore.userId);

const fetchProposals = async () => {
  loading.value = true;
  error.value = false;

  try {
    const res = await http.ProposalController.proposalListList({ page: 1, pageSize: DEFAULT_PAGE_SIZE });
    const data = res.data?.data?.proposals || res.data?.proposals || [];

    proposals.length = 0;
    proposals.push(...data.map((item: any) => ({
      id: item.id,
      courseName: item.title || item.courseName,
      campus: item.campus || '',
      teachers: item.teacherName || item.teachers || '',
      category: item.category || '',
      reason: item.content || item.reason || '',
      agreeCount: item.agreeCount || 0,
      isAgreed: item.agreeUserIds?.includes(currentUserId.value) || false,
      creatorId: item.creatorId || item.userId || '',
      agreeUserIds: item.agreeUserIds || []
    })));
    loading.value = false;
  } catch (err) {
    console.error('获取提案失败:', err);
    loading.value = false;
    error.value = true;
  }
};

const handleAgree = async (index: number) => {
  const currentProposal = proposals[index];
  const isAgree = !currentProposal.isAgreed;

  try {
    await http.ActionController.likeCreate(currentProposal.id, { targetType: '1' });

    if (isAgree) {
      currentProposal.agreeCount++;
      currentProposal.isAgreed = true;
      if (!currentProposal.agreeUserIds) currentProposal.agreeUserIds = [];
      currentProposal.agreeUserIds.push(currentUserId.value);
      uni.showToast({ title: '已同意', icon: 'success' });
    } else {
      currentProposal.agreeCount--;
      currentProposal.isAgreed = false;
      if (currentProposal.agreeUserIds) {
        const userIdIndex = currentProposal.agreeUserIds.indexOf(currentUserId.value);
        if (userIdIndex > -1) currentProposal.agreeUserIds.splice(userIdIndex, 1);
      }
      uni.showToast({ title: '已取消同意', icon: 'success' });
    }
  } catch (err) {
    console.error('操作失败:', err);
    uni.showToast({ title: '操作失败', icon: 'none' });
  }
};

onMounted(() => { fetchProposals(); });
onShow(() => { fetchProposals(); });
const goToPropose = () => uni.navigateTo({ url: "/pages/proposal/propose/propose" });
</script>

<style scoped lang="scss">
/* 样式部分保持不变 */
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

  // 提案列表样式
  .proposal-list {
    padding: 0 5vw;
  }

  .proposal-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #ffffff;
    border-radius: 3vw;
    padding: 4vw;
    margin-bottom: 3vw;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .proposal-info {
    flex: 1;
    padding-right: 3vw;
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

  .reason {
    font-size: 3.2vw;
    color: #555555;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .proposal-action {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2vw;
  }

  .agree-count {
    font-size: 3.5vw;
    color: #b70030;
    font-weight: bold;
  }

  .agree-btn {
    width: 18vw;
    height: 8vw;
    background-color: #b70030;
    color: white;
    border-radius: 4vw;
    font-size: 3.5vw;
    line-height: 8vw;
    text-align: center;
    border: none;
    padding: 0;
  }

  .agree-btn.agreed {
    background-color: #ccc;
  }

  // 空状态样式
  .empty-state {
    width: 100%;
    padding: 20vw 5vw 0;
    text-align: center;

    .empty-img {
      width: 30vw;
      margin-bottom: 5vw;
    }

    text {
      font-size: 28rpx;
      color: #999999;
      display: block;
      margin-bottom: 5vw;
    }

    .empty-btn {
      background-color: #b70030;
      color: white;
      border-radius: 4vw;
      font-size: 3.5vw;
      padding: 2vw 6vw;
      border: none;
    }
  }



  // 右下角加号按钮
  .add-btn {
    position: fixed;
    bottom: 25vw;
    right: 5vw;
    width: 15vw;
    height: 15vw;
    background-color: #b70030;
    color: white;
    border-radius: 50%;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    box-shadow: 0 4px 10px rgba(183, 0, 48, 0.3);

    .plus {
      font-size: 8vw;
      line-height: 1;
      font-weight: bold;
    }
  }


// 加载动画
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>