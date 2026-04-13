<!-- d:\MeowPick\Meowpick-Frontend\src\pages\proposal\list.vue -->
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

    <!-- 提议列表 -->
    <div class="proposal-list" v-else-if="filteredProposals.length > 0">
      <div 
        v-for="(item, index) in filteredProposals" 
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
          <!-- 状态标签 -->
          <div class="status-tags" v-if="item.status">
            <span class="status-tag" :class="item.status">{{ getStatusText(item.status) }}</span>
          </div>
        </div>
        <!-- 普通用户操作区 -->
        <div v-if="!isAdmin" class="proposal-action" @click.stop="handleAgree(index)">
          <span class="agree-count">{{ item.agreeCount }}人同意</span>
          <button 
            class="agree-btn" 
            :class="{ 'agreed': item.isAgreed }"
          >
            {{ item.isAgreed ? '已同意' : '同意' }}
          </button>
        </div>
        <!-- 管理员操作区 -->
        <div v-else class="admin-action" @click.stop>
          <span class="agree-count">{{ item.agreeCount }}人同意</span>
          <div class="admin-btns">
            <button 
              v-if="item.status !== 'approved'"
              class="admin-btn approve" 
              @click="handleApprove(index)"
            >
              通过
            </button>
            <button 
              v-if="item.status !== 'rejected'"
              class="admin-btn reject" 
              @click="handleReject(index)"
            >
              下架
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-else>
      <text>暂无提议，快来发起第一个吧～</text>
      <button class="empty-btn" @click="goToPropose">发起提议</button>
    </div>
  </div>

  <!-- 右下角按钮组 -->
  <div class="fab-group">
    <!-- 日志按钮（仅管理员可见） -->
    <button v-if="isAdmin" class="log-btn" @click="goToLog">
      <span class="log-icon">📋</span>
    </button>
    <!-- 新增按钮 -->
    <button class="add-btn" @click="goToPropose">
      <span class="plus">+</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { http } from '@/config';

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
  agreeUserIds?: string[];
  status?: 'pending' | 'approved' | 'rejected'; // 状态：待审核、已通过、已下架
}

// 日志数据结构
interface LogEntry {
  id: string;
  proposalId: string;
  courseName: string;
  action: 'approve' | 'reject' | 'new';
  actionTime: string;
  operator: string;
}

// 本地模拟数据
const mockProposals: Proposal[] = [
  {
    id: '1',
    courseName: '【提议新增】深度学习进阶实战',
    campus: '普陀校区',
    teachers: '建议邀请：张教授团队',
    category: '计算机科学',
    reason: '目前的基础AI课程内容较浅，希望能开设进阶课程，重点讲解Transformer、扩散模型等前沿技术，并增加项目实战环节。',
    agreeCount: 128,
    isAgreed: false,
    creatorId: 'user_654321',
    agreeUserIds: ['user_654321', 'user_789012'],
    status: 'pending'
  },
  {
    id: '2',
    courseName: '【提议新增】咖啡鉴赏与制作',
    campus: '闵行校区',
    teachers: '暂无指定',
    category: '生活美学',
    reason: '希望能有一门放松身心的通识课，学习咖啡豆产地知识、品鉴方法以及基础拉花技巧，丰富校园文化生活。',
    agreeCount: 256,
    isAgreed: true,
    creatorId: 'user_987654',
    agreeUserIds: ['user_123456', 'user_987654'],
    status: 'approved'
  },
  {
    id: '3',
    courseName: '【提议新增】短视频创作与运营',
    campus: '两校区通用',
    teachers: '建议邀请：传播学院老师',
    category: '新媒体',
    reason: '大家平时都拍视频，想系统学习脚本撰写、剪辑运镜以及账号运营策略，提升个人媒体素养。',
    agreeCount: 89,
    isAgreed: false,
    creatorId: 'user_112233',
    agreeUserIds: ['user_112233'],
    status: 'pending'
  },
  {
    id: '4',
    courseName: '【提议新增】Python数据分析实战',
    campus: '闵行校区',
    teachers: '李老师',
    category: '数据科学',
    reason: '希望开设一门实践性强的Python数据分析课程，学习pandas、numpy等工具的使用。',
    agreeCount: 167,
    isAgreed: false,
    creatorId: 'user_445566',
    agreeUserIds: ['user_445566', 'user_778899'],
    status: 'rejected'
  },
  {
    id: '5',
    courseName: '【提议新增】心理学与生活',
    campus: '普陀校区',
    teachers: '王教授',
    category: '心理学',
    reason: '希望能有一门面向全校学生的心理学通识课，帮助大家更好地理解自己和他人。',
    agreeCount: 342,
    isAgreed: true,
    creatorId: 'user_112233',
    agreeUserIds: ['user_123456', 'user_112233', 'user_334455'],
    status: 'approved'
  }
];

// 本地模拟日志数据
const mockLogs: LogEntry[] = [
  { id: '1', proposalId: '2', courseName: '【提议新增】咖啡鉴赏与制作', action: 'approve', actionTime: '2024-01-15 14:30:00', operator: '管理员' },
  { id: '2', proposalId: '5', courseName: '【提议新增】心理学与生活', action: 'new', actionTime: '2024-01-14 10:20:00', operator: 'user_112233' },
  { id: '3', proposalId: '5', courseName: '【提议新增】心理学与生活', action: 'approve', actionTime: '2024-01-14 16:45:00', operator: '管理员' },
  { id: '4', proposalId: '4', courseName: '【提议新增】Python数据分析实战', action: 'reject', actionTime: '2024-01-13 09:15:00', operator: '管理员' },
  { id: '5', proposalId: '1', courseName: '【提议新增】深度学习进阶实战', action: 'new', actionTime: '2024-01-16 08:00:00', operator: 'user_654321' }
];

// 当前用户ID（本地模拟）
const currentUserId = 'user_123456';
// 管理员ID列表（本地模拟）
const adminUserIds = ['user_123456', 'admin_001'];

// 是否是管理员
const isAdmin = ref(false);

// 检查是否是管理员
const checkAdmin = () => {
  console.log('[API] 开始检查管理员权限');
  http.request({
    path: `/api/auth/is_admin`,
    method: 'GET'
  })
  .then((res) => {
    console.log('[API] 管理员检查响应:', res);
    if (res && res.code === 0) {
      isAdmin.value = res.data?.isAdmin ?? false;
      console.log('[API] 管理员检查结果:', isAdmin.value ? '是管理员' : '不是管理员');
    } else {
      throw new Error(res?.msg || '接口失败');
    }
  })
  .catch((err) => {
    console.error('[API] 管理员检查失败:', err.message || err);
    console.log('[FALLBACK] 使用本地管理员列表判断');
    isAdmin.value = adminUserIds.includes(currentUserId);
    console.log('[FALLBACK] 本地判断结果:', isAdmin.value ? '是管理员' : '不是管理员');
  });
};

// 提案列表数据
const proposals = ref<Proposal[]>([]);
// 加载状态
const loading = ref(true);
// 搜索关键词
const searchKeyword = ref('');

// 过滤后的提案列表
const filteredProposals = computed(() => {
  if (!searchKeyword.value.trim()) {
    return proposals.value;
  }
  const keyword = searchKeyword.value.toLowerCase();
  return proposals.value.filter(item => 
    item.courseName.toLowerCase().includes(keyword) ||
    item.teachers.toLowerCase().includes(keyword) ||
    item.category.toLowerCase().includes(keyword)
  );
});

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': '待审核',
    'approved': '已通过',
    'rejected': '已下架'
  };
  return statusMap[status] || status;
};

// 获取提案列表数据
const fetchProposals = () => {
  console.log('[API] 开始获取提案列表');
  loading.value = true;

  checkAdmin();

  http.request({
    path: `/api/proposal/list`,
    method: 'GET',
    query: { page: 0, pageSize: 10 }
  })
  .then((res) => {
    console.log('[API] 提案列表响应:', res);

    // ✅ 第一层：判断业务是否成功
    if (!res) {
      throw new Error('接口响应格式错误');
    }

    // 处理不同的响应情况
    if (res.code === 0) {
      // 成功找到提案
      console.log('[API] 提案列表获取成功');
      // ✅ 第二层：确保 data 存在
      const list = res.data?.proposals || [];

      if (!Array.isArray(list)) {
        throw new Error('proposals 不是数组');
      }

      // ✅ 第三层：安全 map
      proposals.value = list
        .filter(item => item) // 过滤 null
        .map(item => ({
          id: item.id || '',
          courseName: item.title || '未知课程',
          campus: Array.isArray(item.course?.campuses) ? item.course.campuses.join('、') : item.campus || item.course?.campus || '',
          department: item.course?.department || '',
          teachers: Array.isArray(item.course?.teachers) ? item.course.teachers.join('、') : item.teachers || item.course?.teacher || '',
          category: item.course?.category || item.category || '',
          reason: item.content || '',
          agreeCount: item.likeCnt || item.likeCrt || 0,
          isAgreed: item.like || false,
          creatorId: item.userId || '',
          agreeUserIds: [],
          status: item.status || 'pending',
          date: item.createdAt || ''
        }));
      
      // 打印映射后的数据，方便调试
      console.log('[API] 映射后的提案数据:', proposals.value);

      console.log('[API] 提案加载成功，共', proposals.value.length, '个提案');
    } else if (res.code === 108000001 && res.msg === 'failed to find proposals') {
      // 未找到提案，这是正常的业务场景
      console.log('[API] 未找到提案，显示空列表');
      proposals.value = [];
    } else {
      // 其他错误
      throw new Error(res.msg || '接口失败');
    }
  })
  .catch((err) => {
    console.error('[API] 获取提案列表失败:', err.message || err);

    // fallback
    console.log('[FALLBACK] 使用本地模拟数据');
    proposals.value = mockProposals.map(item => ({
      ...item,
      isAgreed: item.agreeUserIds?.includes(currentUserId) || false
    }));
    console.log('[FALLBACK] 本地数据加载完成，共', proposals.value.length, '个提案');
  })
  .finally(() => {
    loading.value = false;
    console.log('[API] 获取提案列表完成');
  });
};

// 搜索功能
const handleSearch = () => {
  // 搜索通过computed自动处理
};

// 同意/取消同意投票（等待后端接口）
const handleAgree = async (index: number) => {
  // 找到在原始数组中的索引
  const originalIndex = proposals.value.findIndex(p => p.id === filteredProposals.value[index].id);
  if (originalIndex === -1) return;
  
  const currentProposal = proposals.value[originalIndex];
  const isAgree = !currentProposal.isAgreed;
  
  try {
    // 这里应该调用后端同意/取消同意的接口
    // 暂时使用本地逻辑
    if (isAgree) {
      // 同意操作
      currentProposal.agreeCount++;
      currentProposal.isAgreed = true;
      if (!currentProposal.agreeUserIds) {
        currentProposal.agreeUserIds = [];
      }
      currentProposal.agreeUserIds.push(currentUserId);
      uni.showToast({ title: '已同意', icon: 'success' });
    } else {
      // 取消同意操作
      currentProposal.agreeCount--;
      currentProposal.isAgreed = false;
      if (currentProposal.agreeUserIds) {
        const userIdIndex = currentProposal.agreeUserIds.indexOf(currentUserId);
        if (userIdIndex > -1) {
          currentProposal.agreeUserIds.splice(userIdIndex, 1);
        }
      }
      uni.showToast({ title: '已取消同意', icon: 'success' });
    }
  } catch (error) {
    console.error('操作失败:', error);
    uni.showToast({ title: '操作失败', icon: 'error' });
  }
};

// 跳转到提议详情页
const goToDetail = (item: Proposal) => {
  uni.navigateTo({ 
    url: `/pages/proposal/detail?data=${encodeURIComponent(JSON.stringify(item))}` 
  });
};

// 跳转到发起提议页面
const goToPropose = () => {
  uni.navigateTo({ 
    url: "/pages/proposal/propose" 
  });
};

// 跳转到日志页面（等待后端接口）
const goToLog = async () => {
  try {
    // 这里应该调用后端获取日志的接口
    // 暂时使用本地模拟数据
    uni.navigateTo({ 
      url: `/pages/proposal/log?logs=${encodeURIComponent(JSON.stringify(mockLogs))}` 
    });
  } catch (error) {
    console.error('获取日志失败:', error);
    uni.showToast({ title: '获取日志失败', icon: 'error' });
  }
};

// 管理员通过提议
const handleApprove = (index: number) => {
  const originalIndex = proposals.value.findIndex(p => p.id === filteredProposals.value[index].id);
  if (originalIndex === -1) return;
  
  const proposal = proposals.value[originalIndex];
  
  console.log('[API] 开始处理提议通过，提案ID:', proposal.id);
  http.request({
    path: `/api/proposal/${proposal.id}/approve`,
    method: 'POST'
  }).then((res) => {
    console.log('[API] 提议通过响应:', res);
    if (res && res.code === 0) {
      console.log('[API] 提议通过成功');
      uni.showToast({
        title: '已通过',
        icon: 'success'
      });
      // 重新获取列表
      fetchProposals();
    } else {
      console.error('[API] 提议通过失败:', res?.msg || '未知错误');
      uni.showToast({
        title: '通过失败',
        icon: 'none'
      });
    }
  }).catch((error) => {
    console.error('[API] 通过提议请求失败:', error.message || error);
    uni.showToast({
      title: '通过失败',
      icon: 'none'
    });
  });
};

// 管理员下架提议（等待后端接口）
const handleReject = async (index: number) => {
  const originalIndex = proposals.value.findIndex(p => p.id === filteredProposals.value[index].id);
  if (originalIndex === -1) return;
  
  const proposal = proposals.value[originalIndex];
  
  try {
    // 这里应该调用后端下架提议的接口
    // 暂时使用本地逻辑
    proposal.status = 'rejected';
    
    // 添加到日志
    mockLogs.unshift({
      id: Date.now().toString(),
      proposalId: proposal.id,
      courseName: proposal.courseName,
      action: 'reject',
      actionTime: new Date().toLocaleString(),
      operator: '管理员'
    });
    
    uni.showToast({ title: '已下架', icon: 'success' });
  } catch (error) {
    console.error('下架提议失败:', error);
    uni.showToast({ title: '操作失败', icon: 'error' });
  }
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
  top: calc(20vw + 44px);
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
  padding-top: calc(38vw + 44px);
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

// 管理员操作区样式
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
}

// 状态标签样式
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

// 提议项状态样式
.proposal-item {
  &.status-approved {
    border-left: 4px solid #52c41a;
  }
  
  &.status-rejected {
    border-left: 4px solid #ff4d4f;
    opacity: 0.7;
  }
}

// 悬浮按钮组
.fab-group {
  position: fixed;
  bottom: 25vw;
  right: 5vw;
  display: flex;
  flex-direction: column;
  gap: 3vw;
  z-index: 1;
}

// 日志按钮
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
  box-shadow: 0 4px 10px rgba(183, 0, 48, 0.3);
  
  .log-icon {
    font-size: 8vw;
    line-height: 1;
    font-weight: bold;
  }
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

// 新增按钮
.add-btn {
  width: 15vw;
  height: 15vw;
  background-color: #b70030;
  color: white;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
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