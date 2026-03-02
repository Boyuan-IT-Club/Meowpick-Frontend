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

// 投票提案数据结构
interface Proposal {
  id: string; // 唯一标识
  courseName: string;
  campus: string;
  teachers: string;
  category: string;
  reason: string;
  agreeCount: number;
  isAgreed: boolean; // 当前用户是否已同意
  creatorId: string; // 创建者ID
  agreeUserIds?: string[]; // 同意用户ID列表
}

// 提案列表数据
const proposals = reactive<Proposal[]>([]);
// 加载状态
const loading = ref(true);
// 错误状态
const error = ref(false);
// 当前用户ID（实际项目中从登录状态获取）
const currentUserId = ref('user_123456'); // 本地调试用固定用户ID

// 本地模拟获取提案列表数据
const mockGetProposals = (): Promise<Proposal[]> => {
  return new Promise((resolve) => {
    // 模拟网络延迟
    setTimeout(() => {
      resolve([
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
          agreeUserIds: ['user_654321', 'user_789012']
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
          agreeUserIds: ['user_123456', 'user_987654']
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
          agreeUserIds: ['user_112233']
        }
      ]);
    }, 800);
  });
};

// 本地模拟同意/取消同意提案接口
const mockToggleAgreeProposal = (id: string, isAgree: boolean): Promise<{ success: boolean }> => {
  return new Promise((resolve) => {
    // 模拟网络延迟
    setTimeout(() => {
      resolve({ success: true });
    }, 500);
  });
};

// 获取提案列表数据
const fetchProposals = async () => {
  // 重置状态
  loading.value = true;
  error.value = false;
  
  try {
    // 本地调试使用模拟数据
    const response = await mockGetProposals();
    
    // 处理返回数据，判断当前用户是否已同意
    const formattedData: Proposal[] = response.map((item) => ({
      ...item,
      isAgreed: item.agreeUserIds?.includes(currentUserId.value) || false
    }));
    
    // 清空并添加新数据
    proposals.length = 0;
    proposals.push(...formattedData);
    loading.value = false;
  } catch (err) {
    console.error('获取提案失败:', err);
    loading.value = false;
    error.value = true;
  }
};

// 同意/取消同意投票
const handleAgree = async (index: number) => {
  const currentProposal = proposals[index];
  // 确定当前操作是同意还是取消同意
  const isAgree = !currentProposal.isAgreed;
  
  try {
    // 调用模拟接口，传入当前操作类型
    await mockToggleAgreeProposal(currentProposal.id, isAgree);
    
    // 接口成功后更新UI
    if (isAgree) {
      // 同意操作
      currentProposal.agreeCount++;
      currentProposal.isAgreed = true;
      if (!currentProposal.agreeUserIds) {
        currentProposal.agreeUserIds = [];
      }
      currentProposal.agreeUserIds.push(currentUserId.value);
      uni.showToast({ title: '已同意', icon: 'success' });
    } else {
      // 取消同意操作
      currentProposal.agreeCount--;
      currentProposal.isAgreed = false;
      if (currentProposal.agreeUserIds) {
        const userIdIndex = currentProposal.agreeUserIds.indexOf(currentUserId.value);
        if (userIdIndex > -1) {
          currentProposal.agreeUserIds.splice(userIdIndex, 1);
        }
      }
      uni.showToast({ title: '已取消同意', icon: 'success' });
    }
  } catch (err) {
    // 接口失败时不更新UI
    console.error('操作失败:', err);
    uni.showToast({ title: '操作失败', icon: 'none' });
  }
};

// 页面挂载时获取数据
onMounted(() => {
  fetchProposals();
});

// 页面显示时重新获取数据（处理从发布页返回的场景）
onShow(() => {
  fetchProposals();
});

// 页面隐藏时的处理逻辑
onHide(() => {
  // 页面隐藏时可以执行的清理操作
});
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