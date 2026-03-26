<template>
  <top-bar :selected="2" />

  <!-- 搜索栏 -->
  <div class="search-bar">
    <div class="search-input">
      <image src="@/images/search-icon.png" class="search-icon" />
      <input 
        type="text" 
        placeholder="搜索课程或教师" 
        v-model="searchKeyword"
        @input="handleSearch"
      />
    </div>
  </div>

  <!-- 正文内容区域 -->
  <div class="content">
    <!-- 加载状态 -->
    <div class="loading-state" v-if="loading">
      <div class="loading-spinner"></div>
      <text class="loading-text">加载中...</text>
    </div>

    <!-- 错误状态 -->
    <div class="error-state" v-else-if="error">
      <text class="error-text">加载失败，请点击重试</text>
      <button class="retry-btn" @click="fetchProposals">重试</button>
    </div>

    <!-- 投票列表 -->
    <div class="proposal-list" v-else-if="proposals.length > 0">
      <div 
        v-for="(item, index) in proposals" 
        :key="item.id" 
        class="proposal-item"
        @click="goToDetail(item.id)"
      >
        <div class="proposal-info">
          <h3 class="course-name">{{ item.courseName }}</h3>
          <div class="course-detail">
            <span class="detail-item">校区：{{ item.campus }}</span>
            <span class="detail-item">教师：{{ item.teachers }}</span>
            <span class="detail-item">分类：{{ item.category }}</span>
          </div>
          <p class="reason">{{ item.reason }}</p>
        </div>
        <div class="proposal-action" @click.stop="handleAgree(index)">
          <span class="agree-count">{{ item.agreeCount }}人同意</span>
          <button 
            class="agree-btn" 
            :class="{ 'agreed': item.isAgreed }"
          >
            {{ item.isAgreed ? '已同意' : '同意' }}
          </button>
        </div>
      </div>

      <!-- 分页控制 -->
      <div class="pagination" v-if="totalPages > 1">
        <button 
          class="page-btn" 
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 0"
          :class="{ 'disabled': currentPage === 0 }"
        >
          上一页
        </button>
        <div class="page-info">
          <text>{{ currentPage + 1 }} / {{ totalPages }}</text>
        </div>
        <button 
          class="page-btn" 
          @click="changePage(currentPage + 1)"
          :disabled="currentPage === totalPages - 1"
          :class="{ 'disabled': currentPage === totalPages - 1 }"
        >
          下一页
        </button>
      </div>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-else>
      <text>暂无投票提案，快来发起第一个吧～</text>
      <button class="empty-btn" @click="goToPropose">发起投票</button>
    </div>
  </div>

  <!-- 右下角加号按钮 -->
  <button class="add-btn" @click="goToPropose">
    <span class="plus">+</span>
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import api from '@/config/utils/http';

// 投票提案数据结构
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
}

// 提案列表数据
const proposals = ref<Proposal[]>([]);
// 加载状态
const loading = ref(true);
// 错误状态
const error = ref(false);
// 分页状态
const currentPage = ref(0);
const pageSize = 10;
const total = ref(0);
const totalPages = ref(0);
// 搜索关键词
const searchKeyword = ref('');

// 获取提案列表数据
const fetchProposals = async () => {
  loading.value = true;
  error.value = false;
  
  try {
    const response = await api.ProposalController.proposalListList({
      page: currentPage.value,
      pageSize: pageSize
    });
    
    if (response.data && response.data.data) {
      const data = response.data.data;
      
      if (data.proposals) {
        proposals.value = data.proposals.map((item: any) => ({
          id: item.id || '',
          courseName: item.course?.name || '',
          campus: item.course?.campuses?.join(', ') || '',
          teachers: item.course?.teachers?.map((t: any) => t.name).join(', ') || '',
          category: item.course?.category || '',
          reason: item.content || '',
          agreeCount: item.likeCnt || 0,
          isAgreed: item.like || false,
          creatorId: item.userId || ''
        }));
        
        total.value = data.total || 0;
        totalPages.value = Math.ceil(total.value / pageSize);
      } else {
        proposals.value = [];
      }
    } else {
      proposals.value = [];
    }
  } catch (err) {
    console.error('获取提案失败:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

// 搜索功能
const handleSearch = () => {
  currentPage.value = 0;
  fetchProposals();
};

// 切换页面
const changePage = (page: number) => {
  if (page >= 0 && page < totalPages.value) {
    currentPage.value = page;
    fetchProposals();
  }
};

// 同意/取消同意投票
const handleAgree = async (index: number) => {
  const currentProposal = proposals.value[index];
  
  try {
    const response = await api.LikeController.likeCreate(currentProposal.id, {
      targetId: currentProposal.id,
      targetType: '1'
    });
    
    if (response.data && response.data.data) {
      const { like, likeCnt } = response.data.data;
      currentProposal.isAgreed = like || false;
      currentProposal.agreeCount = likeCnt || 0;
      uni.showToast({ title: like ? '已同意' : '已取消同意', icon: 'success' });
    }
  } catch (err) {
    console.error('操作失败:', err);
    uni.showToast({ title: '操作失败', icon: 'none' });
  }
};

// 跳转到提议详情页
const goToDetail = (id: string) => {
  uni.navigateTo({ 
    url: `/pages/proposal/detail?id=${id}` 
  });
};

// 跳转到发起提议页面
const goToPropose = () => {
  uni.navigateTo({ 
    url: "/pages/proposal/propose" 
  });
};

// 页面挂载时获取数据
onMounted(() => {
  fetchProposals();
});

// 页面显示时重新获取数据
onShow(() => {
  fetchProposals();
});
</script>

<style scoped lang="scss">
/* 搜索栏样式 */
.search-bar {
  position: fixed;
  top: 20vw;
  left: 0;
  right: 0;
  padding: 2vw 5vw;
  background-color: #fff;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-input {
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 4vw;
  padding: 2vw 3vw;
}

.search-icon {
  width: 4vw;
  height: 4vw;
  margin-right: 2vw;
}

.search-input input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 3.5vw;
  color: #333;
}

.content {
  padding-top: 38vw;
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
  @apply bg-white rounded p-4 my-3 shadow-md;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.proposal-item:active {
  transform: scale(0.98);
}

.proposal-info {
  flex: 1;
  padding-right: 3vw;
}

.course-name {
  font-size: 4.5vw;
  font-weight: bold;
  color: #333333;
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
  cursor: pointer;
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

// 分页控制样式
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 3vw;
  padding: 4vw 0;
  margin-top: 2vw;
}

.page-btn {
  background-color: #b70030;
  color: white;
  border-radius: 3vw;
  font-size: 3.2vw;
  padding: 1.5vw 4vw;
  border: none;
}

.page-btn.disabled {
  background-color: #ccc;
  opacity: 0.6;
}

.page-info {
  font-size: 3.5vw;
  color: #666;
  padding: 0 2vw;
}

// 空状态样式
.empty-state {
  width: 100%;
  padding: 20vw 5vw 0;
  text-align: center;

  text {
    font-size: 4vw;
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
  z-index: 1;
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