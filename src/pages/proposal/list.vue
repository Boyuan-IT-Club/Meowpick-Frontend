<template>
  <top-bar :selected="2" />

  <div class="search-bar">
    <div class="search-input">
      <image src="@/images/search-icon.png" class="search-icon" />
      <input 
        type="text" 
        placeholder="搜索课程或教师" 
        v-model="searchKeyword"
        @input="handleSearchDebounce"
        @confirm="handleSearchConfirm"
      />
      <view v-if="searchKeyword" class="clear-btn" @click="clearSearch">
        <text class="clear-text">✕</text>
      </view>
    </div>
    <button class="filter-btn" :class="{ active: isFiltered }" @click="showFilterModal = true">
      <text class="filter-icon">筛选</text>
    </button>
  </div>

  <div class="content" @scroll="handleContentScroll">
    <div class="loading-state" v-if="loading">
      <div class="loading-spinner"></div>
      <text class="loading-text">加载中...</text>
    </div>

    <div class="proposal-list" v-else-if="proposals.length > 0">
      <div 
        v-for="(item, index) in proposals" 
        :key="item.id" 
        class="proposal-item"
        :class="{ 'status-approved': item.status === 'approved', 'status-rejected': item.status === 'rejected' }"
        @click="goToDetail(item)"
      >
        <div class="proposal-info">
          <h3 class="course-name">{{ item.courseName }}</h3>
          <div class="course-detail">
            <span class="detail-item">校区：{{ item.campus }}</span>
          </div>
          <div class="course-detail">
            <span class="detail-item">院系：{{ item.department }}</span>
          </div>
          <div class="course-detail">
            <span class="detail-item">分类：{{ item.category }}</span>
          </div>
          <div class="course-detail">
            <span class="detail-item">教师：{{ item.teachers || '暂无' }}</span>
          </div>
          <p class="reason">{{ item.reason }}</p>
          <div class="status-tags" v-if="item.status">
            <span class="status-tag" :class="item.status">{{ getStatusText(item.status) }}</span>
          </div>
        </div>
        <div v-if="!isAdmin" class="proposal-action" @click.stop="handleAgree(index)">
          <span class="agree-count">{{ item.agreeCount }}人同意</span>
          <button 
            class="agree-btn" 
            :class="{ 'agreed': item.isAgreed }"
          >
            {{ item.isAgreed ? '已同意' : '同意' }}
          </button>
        </div>
        <div v-else class="admin-action" @click.stop>
          <span class="agree-count">{{ item.agreeCount }}人同意</span>
          <div class="admin-btns">
            <template v-if="item.status === 'pending'">
              <button 
                class="admin-btn approve" 
                @click="handleApprove(index)"
              >
                通过
              </button>
              <button 
                class="admin-btn reject" 
                @click="handleReject(index)"
              >
                下架
              </button>
            </template>
            <button 
              v-else
              class="admin-btn withdraw" 
              @click="handleWithdraw(index)"
            >
              撤回
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="empty-state" v-else>
      <text>暂无提议，快来发起第一个吧～</text>
      <button class="empty-btn" @click="goToPropose">发起提议</button>
    </div>

    <div v-if="noMore && proposals.length > 0 && !loading" class="no-more">
      <text class="no-more-text">没有更多了</text>
    </div>
  </div>

  <div class="fab-group">
    <button v-if="isAdmin" class="log-btn" @click="goToLog">
      <span class="log-icon">📋</span>
    </button>
    <button class="add-btn" @click="goToPropose">
      <span class="plus">+</span>
    </button>
  </div>

  <div class="modal-mask" v-if="showFilterModal" @click="showFilterModal = false">
    <div class="modal-content" @click.stop :class="{ 'modal-content-enter': showFilterModal }">
      <div class="modal-header">
        <div class="modal-title">筛选条件</div>
        <div class="close-btn" @click="showFilterModal = false">×</div>
      </div>
      <div class="filter-content">
        <div class="filter-section">
          <div class="filter-label">提案状态 <span class="required-mark">(多选)</span></div>
          <div class="tags-group">
            <div 
              class="tag-item" 
              v-for="status in statusOptions" 
              :key="status.value"
              :class="{ active: filterForm.status.includes(status.value) }"
              @click="toggleStatus(status.value)"
            >
              {{ status.label }}
            </div>
          </div>
          <div class="divider"></div>
        </div>

        <div class="filter-section">
          <div class="filter-label">校区 <span class="required-mark">(多选)</span></div>
          <div class="tags-group">
            <div 
              class="tag-item" 
              v-for="campus in campusOptions" 
              :key="campus"
              :class="{ active: filterForm.campus.includes(campus) }"
              @click="toggleCampus(campus)"
            >
              {{ campus }}
            </div>
          </div>
          <div class="divider"></div>
        </div>

        <div class="filter-section">
          <div class="filter-label">开课院系</div>
          <div class="form-row" @click="openSearchModal('department')">
            <div class="input-display">{{ filterForm.department || '请输入开课院系' }}</div>
            <text class="arrow">›</text>
          </div>
          <div class="divider"></div>
        </div>

        <div class="filter-section">
          <div class="filter-label">课程分类</div>
          <div class="form-row" @click="openSearchModal('category')">
            <div class="input-display">{{ filterForm.category || '请输入课程分类' }}</div>
            <text class="arrow">›</text>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="reset-btn" @click="resetFilter">重置</button>
        <button class="confirm-btn" @click="applyFilter">确定</button>
      </div>
    </div>
  </div>

  <SearchModal
    v-model:visible="showSearchModal"
    :title="modalTitle"
    :placeholder="searchPlaceholder"
    :field="currentField"
    @select="handleSearchSelect"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onShow, onPageScroll } from '@dcloudio/uni-app';
import { http } from '@/config';
import { campusesData } from '@/data/mappingData';
import SearchModal from '@/components/proposal-components/SearchModal.vue';

interface Proposal {
  id: string;
  courseName: string;
  campus: string;
  department: string;
  teachers: string;
  category: string;
  reason: string;
  agreeCount: number;
  isAgreed: boolean;
  creatorId: string;
  status?: 'pending' | 'approved' | 'rejected';
  date: string;
}

const isAdmin = ref(false);
const proposals = ref<Proposal[]>([]);
const loading = ref(true);
const searchKeyword = ref('');
const showFilterModal = ref(false);
const showSearchModal = ref(false);
const currentField = ref('');
const currentPage = ref(0);
const pageSize = 10;
const noMore = ref(false);
const isFilterMode = ref(false);
let searchTimer: ReturnType<typeof setTimeout> | null = null;

const statusOptions = [
  { label: '待审核', value: 'pending' },
  { label: '已通过', value: 'approved' },
  { label: '已下架', value: 'rejected' }
];

const campusOptions = campusesData;

const filterForm = ref({
  status: statusOptions.map(s => s.value),
  campus: [...campusOptions] as string[],
  department: '',
  category: ''
});

const modalTitle = computed(() => {
  const titles: Record<string, string> = {
    department: '开课院系',
    category: '课程分类'
  };
  return titles[currentField.value] || '搜索';
});

const searchPlaceholder = computed(() => {
  const placeholders: Record<string, string> = {
    department: '请输入开课院系进行搜索',
    category: '请输入课程分类进行搜索'
  };
  return placeholders[currentField.value] || '请输入关键词';
});

const isFiltered = computed(() => {
  return filterForm.value.status.length > 0 ||
         filterForm.value.campus.length > 0 ||
         filterForm.value.department ||
         filterForm.value.category;
});

const checkAdmin = async () => {
  try {
    const res = await http.AuthController.authIsAdminList();
    if (res.data?.code === 0) {
      const responseData = res.data.data || res.data;
      isAdmin.value = responseData?.isAdmin ?? res.data?.isAdmin ?? false;
    }
  } catch {
    isAdmin.value = false;
  }
};

const mapProposalItem = (item: any): Proposal => ({
  id: item.id || '',
  courseName: item.title || '未知课程',
  campus: Array.isArray(item.course?.campuses) ? item.course.campuses.join('、') : '',
  department: item.course?.department || '',
  teachers: Array.isArray(item.course?.teachers) 
    ? item.course.teachers.map((t: any) => typeof t === 'string' ? t : t.name || '').join('、') 
    : '',
  category: item.course?.category || '',
  reason: item.content || '',
  agreeCount: item.likeCnt || 0,
  isAgreed: item.like || false,
  creatorId: item.userId || '',
  status: item.status || 'pending',
  date: item.createdAt || ''
});

const fetchProposals = async (page: number = 0) => {
  if (loading.value && page > 0) return;
  loading.value = true;

  try {
    const res = await http.ProposalController.proposalListList({
      page,
      pageSize
    });

    if (res.data?.code === 0) {
      const responseData = res.data.data || res.data;
      const list = responseData?.proposals || [];
      const mapped = list.filter((item: any) => item).map(mapProposalItem);
      if (page === 0) {
        proposals.value = mapped;
      } else {
        proposals.value = [...proposals.value, ...mapped];
      }
      const total = responseData?.total || 0;
      noMore.value = proposals.value.length >= total;
      currentPage.value = page;
    } else if (res.data?.code === 108000001) {
      proposals.value = [];
      noMore.value = true;
    } else {
      proposals.value = [];
      noMore.value = true;
    }
  } catch (err) {
    console.error('[API] 获取提案列表失败:', err);
    proposals.value = [];
    noMore.value = true;
  } finally {
    loading.value = false;
  }
};

const fetchFilteredProposals = async (page: number = 0) => {
  loading.value = true;

  try {
    const res = await http.ProposalController.proposalFilterList({
      status: filterForm.value.status,
      campus: filterForm.value.campus,
      department: filterForm.value.department || undefined,
      category: filterForm.value.category || undefined,
      page,
      pageSize
    });

    if (res.data?.code === 0) {
      const responseData = res.data.data || res.data;
      const list = responseData?.proposals || [];
      const mapped = list.filter((item: any) => item).map(mapProposalItem);
      if (page === 0) {
        proposals.value = mapped;
      } else {
        proposals.value = [...proposals.value, ...mapped];
      }
      const total = responseData?.total || 0;
      noMore.value = proposals.value.length >= total;
      currentPage.value = page;
    } else {
      proposals.value = [];
      noMore.value = true;
    }
  } catch (err) {
    console.error('[API] 筛选提案失败:', err);
    proposals.value = [];
    noMore.value = true;
  } finally {
    loading.value = false;
  }
};

const handleSearchDebounce = () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    handleSearchConfirm();
  }, 500);
};

const handleSearchConfirm = async () => {
  const keyword = searchKeyword.value.trim();
  if (!keyword) {
    isFilterMode.value = false;
    currentPage.value = 0;
    noMore.value = false;
    fetchProposals(0);
    return;
  }

  loading.value = true;
  try {
    const res = await http.ProposalController.proposalSuggestCreate({
      keyword,
      page: 0,
      pageSize: 50
    });

    if (res.data?.code === 0) {
      const suggestData = res.data.data || res.data;
      const suggestions = suggestData?.suggestions || [];
      if (suggestions.length > 0) {
        const ids = suggestions.map((s: any) => s.id).filter(Boolean);
        if (ids.length > 0) {
          const detailPromises = ids.map((id: string) => 
            http.ProposalController.proposalDetail(id, id).catch(() => null)
          );
          const results = await Promise.all(detailPromises);
          proposals.value = results
            .filter((r: any) => r?.data?.code === 0)
            .map((r: any) => {
              const proposal = r.data?.proposal || r.data?.data?.proposal;
              return proposal ? mapProposalItem(proposal) : null;
            })
            .filter(Boolean) as Proposal[];
        } else {
          proposals.value = [];
        }
      } else {
        proposals.value = [];
      }
    } else {
      proposals.value = [];
    }
    noMore.value = true;
  } catch (err) {
    console.error('[API] 搜索提案失败:', err);
    proposals.value = [];
    noMore.value = true;
  } finally {
    loading.value = false;
  }
};

const clearSearch = () => {
  searchKeyword.value = '';
  isFilterMode.value = false;
  currentPage.value = 0;
  noMore.value = false;
  fetchProposals(0);
};

const toggleStatus = (status: string) => {
  const index = filterForm.value.status.indexOf(status);
  if (index > -1) {
    filterForm.value.status.splice(index, 1);
  } else {
    filterForm.value.status.push(status);
  }
};

const toggleCampus = (campus: string) => {
  const index = filterForm.value.campus.indexOf(campus);
  if (index > -1) {
    filterForm.value.campus.splice(index, 1);
  } else {
    filterForm.value.campus.push(campus);
  }
};

const openSearchModal = (field: string) => {
  currentField.value = field;
  showSearchModal.value = true;
};

const handleSearchSelect = (item: string) => {
  switch (currentField.value) {
    case 'department':
      filterForm.value.department = item;
      break;
    case 'category':
      filterForm.value.category = item;
      break;
  }
};

const resetFilter = () => {
  filterForm.value = {
    status: statusOptions.map(s => s.value),
    campus: [...campusOptions],
    department: '',
    category: ''
  };
};

const applyFilter = () => {
  showFilterModal.value = false;
  isFilterMode.value = true;
  currentPage.value = 0;
  noMore.value = false;
  fetchFilteredProposals(0);
};

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': '待审核',
    'approved': '已通过',
    'rejected': '已下架'
  };
  return statusMap[status] || status;
};

const handleAgree = async (index: number) => {
  const proposal = proposals.value[index];
  if (!proposal) return;

  try {
    const res = await http.LikeController.likeCreate(proposal.id, {
      targetId: proposal.id,
      targetType: '1'
    });

    if (res.data?.code === 0) {
      const isLiked = res.data?.like ?? res.data?.data?.like ?? !proposal.isAgreed;
      const newCnt = res.data?.likeCnt ?? res.data?.data?.likeCnt ?? (isLiked ? proposal.agreeCount + 1 : proposal.agreeCount - 1);
      proposal.isAgreed = isLiked;
      proposal.agreeCount = newCnt;
      uni.showToast({ title: isLiked ? '已同意' : '已取消同意', icon: 'success' });
    } else {
      uni.showToast({ title: '操作失败', icon: 'none' });
    }
  } catch (err) {
    console.error('[API] 点赞失败:', err);
    uni.showToast({ title: '操作失败', icon: 'none' });
  }
};

const goToDetail = (item: Proposal) => {
  uni.navigateTo({ 
    url: `/pages/proposal/detail?id=${item.id}&data=${encodeURIComponent(JSON.stringify(item))}` 
  });
};

const goToPropose = () => {
  uni.navigateTo({ 
    url: "/pages/proposal/propose" 
  });
};

const goToLog = () => {
  uni.navigateTo({ 
    url: "/pages/proposal/log" 
  });
};

const handleApprove = async (index: number) => {
  const proposal = proposals.value[index];
  if (!proposal) return;

  try {
    const res = await http.ProposalController.proposalApproveCreate(proposal.id);
    if (res.data?.code === 0) {
      uni.showToast({ title: '已通过', icon: 'success' });
      if (isFilterMode.value) {
        fetchFilteredProposals(currentPage.value);
      } else {
        fetchProposals(currentPage.value);
      }
    } else {
      uni.showToast({ title: '通过失败', icon: 'none' });
    }
  } catch (err) {
    console.error('[API] 通过提议失败:', err);
    uni.showToast({ title: '通过失败', icon: 'none' });
  }
};

const handleReject = async (index: number) => {
  const proposal = proposals.value[index];
  if (!proposal) return;

  uni.showToast({ title: '下架接口暂未提供', icon: 'none' });
};

const handleWithdraw = async (index: number) => {
  const proposal = proposals.value[index];
  if (!proposal) return;

  try {
    const res = await http.ProposalController.proposalUpdateCreate(proposal.id, {
      title: proposal.courseName,
      content: proposal.reason,
      course: {
        name: proposal.courseName,
        department: proposal.department,
        category: proposal.category,
        campuses: proposal.campus ? proposal.campus.split('、') : [],
        teachers: []
      }
    });

    if (res.data?.code === 0) {
      uni.showToast({ title: '已撤回至待审核', icon: 'success' });
      if (isFilterMode.value) {
        fetchFilteredProposals(currentPage.value);
      } else {
        fetchProposals(currentPage.value);
      }
    } else {
      uni.showToast({ title: '撤回失败', icon: 'none' });
    }
  } catch (err) {
    console.error('[API] 撤回提议失败:', err);
    uni.showToast({ title: '撤回失败', icon: 'none' });
  }
};

onMounted(() => {
  checkAdmin();
  fetchProposals(0);
});

onShow(() => {
  checkAdmin();
  if (isFilterMode.value) {
    fetchFilteredProposals(0);
  } else {
    fetchProposals(0);
  }
});

uni.$on('proposalLikeUpdated', (data: any) => {
  if (!data?.id) return;
  const idx = proposals.value.findIndex(p => p.id === data.id);
  if (idx > -1) {
    proposals.value[idx].isAgreed = data.like ?? proposals.value[idx].isAgreed;
    proposals.value[idx].agreeCount = data.likeCnt ?? proposals.value[idx].agreeCount;
  }
});

onPageScroll((e) => {
  uni.$emit('pageScroll', e);
});

const handleContentScroll = (e: any) => {
  const target = e.target || e.detail;
  const scrollTop = target?.scrollTop || 0;
  uni.$emit('pageScroll', { scrollTop });
};
</script>

<style scoped lang="scss">
.search-bar {
  position: fixed;
  top: calc(20vw + 44px);
  left: 0;
  right: 0;
  padding: 2vw 5vw;
  background-color: #fff;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 2vw;
  height: 15vw;
  box-sizing: border-box;
}

.search-input {
  flex: 1;
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border-radius: 40rpx;
  height: 11vw;
  padding: 0 3vw;
  border: 1px solid #E8E8E8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-icon {
  width: 4vw;
  height: 4vw;
  margin-right: 2vw;
  opacity: 0.6;
}

.search-input input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 3.5vw;
  color: #333;
  outline: none;
  
  &::placeholder {
    color: #999;
  }
}

.clear-btn {
  width: 5vw;
  height: 5vw;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 2vw;

  .clear-text {
    font-size: 3.5vw;
    color: #999;
  }
}

.filter-btn {
  background-color: #ffffff;
  color: #333;
  border: 1px solid #E8E8E8;
  border-radius: 40rpx;
  height: 11vw;
  padding: 0 4vw;
  font-size: 3.5vw;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
  flex-shrink: 0;
  
  &:active {
    background-color: #F5F5F5;
    transform: scale(0.98);
  }
  
  &.active {
    background-color: #b70030;
    color: white;
    border-color: #b70030;
    box-shadow: 0 2px 8px rgba(183, 0, 48, 0.2);
    
    &:active {
      background-color: #9a0028;
    }
  }
}

.filter-icon {
  font-size: 3.5vw;
}

.content {
  position: fixed;
  top: calc(20vw + 44px + 15vw);
  left: 0;
  right: 0;
  bottom: 0;
  padding: 0;
  width: 100%;
  box-sizing: border-box;
  overflow-y: auto;
  z-index: 1;
}

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

.admin-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2vw;
}

.admin-btns {
  display: flex;
  flex-direction: column;
  gap: 2vw;
}

.admin-btn {
  width: 18vw;
  height: 7vw;
  border-radius: 3.5vw;
  font-size: 3vw;
  line-height: 7vw;
  text-align: center;
  border: none;
  padding: 0;
  
  &.approve {
    background-color: #52c41a;
    color: white;
  }
  
  &.reject {
    background-color: #ff4d4f;
    color: white;
  }
  
  &.withdraw {
    background-color: #fa8c16;
    color: white;
  }
}

.status-tags {
  margin-top: 2vw;
}

.status-tag {
  font-size: 2.8vw;
  padding: 1vw 3vw;
  border-radius: 2vw;
  
  &.pending {
    background-color: #fff7e6;
    color: #fa8c16;
  }
  
  &.approved {
    background-color: #f6ffed;
    color: #52c41a;
  }
  
  &.rejected {
    background-color: #fff1f0;
    color: #ff4d4f;
  }
}

.proposal-item {
  &.status-approved {
    border-left: 4px solid #52c41a;
  }
  
  &.status-rejected {
    border-left: 4px solid #ff4d4f;
    opacity: 0.7;
  }
}

.fab-group {
  position: fixed;
  bottom: 25vw;
  right: 5vw;
  display: flex;
  flex-direction: column;
  gap: 3vw;
  z-index: 1;
}

.log-btn {
  width: 15vw;
  height: 15vw;
  background-color: #b70030;
  color: white;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(183, 0, 48, 0.3);
  
  &:active {
    transform: scale(0.95);
  }
  
  .log-icon {
    font-size: 6vw;
  }
}

.add-btn {
  width: 15vw;
  height: 15vw;
  background: linear-gradient(135deg, #b70030, #ff4d6a);
  color: white;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(183, 0, 48, 0.3);
  
  &:active {
    transform: scale(0.95);
  }
  
  .plus {
    font-size: 8vw;
    line-height: 1;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30vw 0;
  text-align: center;
  
  text {
    font-size: 4vw;
    color: #999;
    margin-bottom: 4vw;
  }
  
  .empty-btn {
    background: linear-gradient(90deg, #b70030, #ff4d6a);
    color: white;
    border: none;
    border-radius: 40rpx;
    padding: 2vw 8vw;
    font-size: 3.5vw;
    box-shadow: 0 4px 12px rgba(183, 0, 48, 0.2);
  }
}

.no-more {
  display: flex;
  justify-content: center;
  padding: 3vw 0 6vw;

  .no-more-text {
    font-size: 3vw;
    color: #ccc;
  }
}

.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 200;
  display: flex;
  align-items: flex-end;
}

.modal-content {
  width: 100%;
  background-color: #fff;
  border-radius: 24rpx 24rpx 0 0;
  max-height: 80vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;

  .modal-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
  }

  .close-btn {
    font-size: 40rpx;
    color: #999;
    padding: 0 10rpx;
  }
}

.filter-content {
  padding: 24rpx 32rpx;
}

.filter-section {
  margin-bottom: 20rpx;

  .filter-label {
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
    margin-bottom: 16rpx;

    .required-mark {
      color: #ff4d4f;
      font-size: 24rpx;
    }
  }

  .tags-group {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
  }

  .tag-item {
    padding: 12rpx 24rpx;
    background: #f5f5f5;
    border-radius: 32rpx;
    font-size: 26rpx;
    color: #666;
    border: 1px solid transparent;
    transition: all 0.2s;

    &.active {
      background: #fff0f6;
      color: #b70030;
      border-color: #ffadd2;
    }
  }

  .divider {
    height: 1rpx;
    background-color: #f0f0f0;
    margin-top: 24rpx;
  }
}

.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;

  .input-display {
    flex: 1;
    font-size: 28rpx;
    color: #333;
  }

  .arrow {
    color: #ccc;
    font-size: 36rpx;
    margin-left: 10rpx;
  }
}

.modal-footer {
  display: flex;
  gap: 20rpx;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #f0f0f0;

  .reset-btn {
    flex: 1;
    height: 80rpx;
    line-height: 80rpx;
    border-radius: 40rpx;
    background: #f5f5f5;
    color: #666;
    font-size: 28rpx;
    border: none;
  }

  .confirm-btn {
    flex: 1;
    height: 80rpx;
    line-height: 80rpx;
    border-radius: 40rpx;
    background: linear-gradient(90deg, #b70030, #ff4d6a);
    color: #fff;
    font-size: 28rpx;
    border: none;
    box-shadow: 0 4px 12px rgba(183, 0, 48, 0.2);
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
