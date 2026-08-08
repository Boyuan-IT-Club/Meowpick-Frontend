<template>
  <view class="feed-page" :class="themeStore.themeClass">

    <!-- 顶部导航栏 -->
    <view class="nav-bar" :style="{ height: navBarHeight + 'px', paddingTop: menuButtonInfo.top + 'px' }">
      <view class="nav-content" :style="{ height: menuButtonInfo.height + 'px' }">
        <view class="back-btn-wrapper" @click="goBack" :style="{ width: menuButtonInfo.height + 'px', height: '100%' }">
          <BackBtn />
        </view>
        <view class="nav-title-container">
          <text class="nav-title">提议广场</text>
          <text class="nav-subtitle">{{ loading ? '加载中...' : `${total} 个已通过提议` }}</text>
        </view>
      </view>
    </view>

    <!-- 顶部留白 -->
    <view :style="{ height: navBarHeight + 'px' }"></view>

    <!-- 搜索框（保留，按提案标题搜索） -->
    <view class="search-bar" v-if="false">
      <!-- 暂不展示，预留扩展位 -->
    </view>

    <!-- 列表 -->
    <view class="list-container">
      <!-- 加载 -->
      <view v-if="loading && proposals.length === 0" class="loading-state">
        <view class="loading-spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 错误 -->
      <view v-else-if="error" class="error-state">
        <text class="error-text">加载失败</text>
        <button class="retry-btn" @click="fetchProposals">重试</button>
      </view>

      <!-- 空 -->
      <view v-else-if="proposals.length === 0" class="empty-tip">
        <text>暂无已通过提案</text>
      </view>

      <!-- 列表 -->
      <view v-else>
        <choose-course
          v-for="item in proposals"
          :key="item.id"
          :data="item"
          class="proposal-card-item"
          @click="onProposalClick(item)"
        />
      </view>

      <!-- 底部留白 -->
      <view style="height: 60rpx;"></view>
    </view>

  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import BackBtn from '@/components/common/BackBtn.vue';
import ChooseCourse from '@/components/choose/choose-course/index.vue';
import { http, useThemeStore } from '@/config';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';

const themeStore = useThemeStore();

interface ProposalItem {
  id: string;
  resultType?: string;
  name?: string;
  teacherName?: string;
  department?: string;
  voteCount?: number;
  agreeCount?: number;
  course?: any;
  finalCourse?: any;
}

const proposals = ref<ProposalItem[]>([]);
const total = ref(0);
const loading = ref(false);
const error = ref(false);

// 胶囊位置计算
const sysInfo = uni.getSystemInfoSync();
let menuButtonInfo = {
  top: sysInfo.statusBarHeight ? sysInfo.statusBarHeight + 4 : 48,
  height: 32
};
try {
  const res = uni.getMenuButtonBoundingClientRect();
  if (res && res.top) {
    menuButtonInfo = { top: res.top, height: res.height };
  }
} catch (e) {}

const navBarHeight = (menuButtonInfo.top || 0) + (menuButtonInfo.height || 0) + 12;

const fetchProposals = async () => {
  loading.value = true;
  error.value = false;
  try {
    const res: any = await http.ProposalController.proposalFilterList({
      status: ['approved'],
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE
    });

    const raw = res.data?.data?.proposals || res.data?.proposals || [];
    total.value = res.data?.data?.total ?? raw.length;

    // 将后端 ProposalVO 转为 choose-course 期望的格式
    proposals.value = raw.map((p: any) => {
      // 已通过的提案使用 finalCourse 显示，没有则用 course
      const finalCourse = p.finalCourse || p.course || {};
      const teachers = (finalCourse.teachers || [])
        .map((t: any) => t.name)
        .filter(Boolean);
      const teacherName = teachers.join('、') || '未知教师';

      return {
        id: p.id,
        resultType: 'proposal',
        name: finalCourse.name || p.title || '未知提案',
        teacherName,
        department: Array.isArray(finalCourse.department)
          ? finalCourse.department.join('、')
          : (finalCourse.department || '全校'),
        voteCount: p.likeCnt || 0,
        course: finalCourse
      };
    });
  } catch (err) {
    console.error('[proposal-feed] fetchProposals error:', err);
    error.value = true;
    uni.showToast({ title: '加载失败，请重试', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

const onProposalClick = (item: ProposalItem) => {
  // 点击已通过提案，进入关联课程详情（如果有 finalCourse.id）或提议详情
  const courseId = item.course?.id;
  if (courseId) {
    uni.navigateTo({ url: `/pages/course/index/index?id=${courseId}` });
  } else {
    // 降级：进入提议详情
    const dataStr = encodeURIComponent(JSON.stringify(item));
    uni.navigateTo({ url: `/pages/course/proposal-detail/index?data=${dataStr}` });
  }
};

const goBack = () => uni.navigateBack();

onLoad(() => {
  fetchProposals();
});

onShow(() => {
  // 暂不刷新，等提案模块完善后再做"发布后自动刷新"
});
</script>

<style lang="scss">
.feed-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  box-sizing: border-box;
}

.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background: #ffffff;
  z-index: 100;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.02);
}

.nav-content {
  display: flex;
  align-items: center;
  padding-left: 32rpx;
  box-sizing: border-box;
}

.back-btn-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-title-container {
  margin-left: 32rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;

  .nav-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #333;
    line-height: 1.2;
  }

  .nav-subtitle {
    font-size: 22rpx;
    color: #999;
    margin-top: 4rpx;
  }
}

.list-container {
  padding: 24rpx 32rpx;
}

.loading-state,
.error-state,
.empty-tip {
  padding: 200rpx 0;
  text-align: center;
}

.loading-spinner {
  width: 80rpx;
  height: 80rpx;
  margin: 0 auto 24rpx;
  border: 4rpx solid #ddd;
  border-top-color: #b20035;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: 28rpx;
  color: #666;
}

.error-text {
  font-size: 28rpx;
  color: #f43f30;
  display: block;
  margin-bottom: 32rpx;
}

.retry-btn {
  background: linear-gradient(135deg, #b20035, #ff4d6a);
  color: white;
  border-radius: 24rpx;
  font-size: 28rpx;
  padding: 16rpx 48rpx;
  border: none;
}

.empty-tip text {
  font-size: 28rpx;
  color: #999;
}

.proposal-card-item {
  display: block;
  margin-bottom: 24rpx;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Dark Mode */
.feed-page.dark-theme { background-color: #121212; }
.feed-page.dark-theme .nav-bar { background: #1e1e1e; box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15); }
.feed-page.dark-theme .nav-title-container .nav-title { color: #e0e0e0; }
.feed-page.dark-theme .nav-title-container .nav-subtitle { color: #888; }
.feed-page.dark-theme .loading-text { color: #888; }
.feed-page.dark-theme .error-text { color: #ff6b6b; }
.feed-page.dark-theme .empty-tip text { color: #555; }
</style>