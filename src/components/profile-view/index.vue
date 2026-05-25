<template>
  <view class="profile-container" :style="{ paddingTop: (menuButtonInfo.top + 20) + 'px' }">

    <!-- 胶囊遮罩：挡住胶囊上方的内容 -->
    <view class="capsule-mask" :style="{ height: (menuButtonInfo.top + menuButtonInfo.height + 20) + 'px' }" />

    <!-- 1. Header Area: Large & Breathable -->
     <view class="header-section" :style="{ marginTop: '20rpx', marginBottom: '40rpx' }">
      <view class="title-wrapper">
         <text class="page-title">我的发布</text>
         <text class="sub-title">{{ loading ? '加载中...' : (filteredList.length + ' 条记录') }}</text>
      </view>
    </view>

    <!-- 首次使用引导弹窗 -->
    <view v-if="showGuide" class="guide-overlay" @click="hideGuide">
      <view class="guide-content" @click.stop>
        <view class="guide-header">
          <text class="guide-title">欢迎来到"我的发布" 🎉</text>
          <text class="guide-subtitle">管理你的吐槽和提议</text>
        </view>
        <view class="guide-sections">
          <view class="guide-section">
            <view class="section-icon">📝</view>
            <view class="section-text">
              <text class="section-title">吐槽 & 提议</text>
              <text class="section-desc">这里汇总了你发布的所有吐槽和提议，可按类型筛选查看</text>
            </view>
          </view>
          <view class="guide-section">
            <view class="section-icon">➕</view>
            <view class="section-text">
              <text class="section-title">新增内容</text>
              <text class="section-desc">点击右下角 "+" 按钮，可以新增吐槽或发起新课程提议</text>
            </view>
          </view>
          <view class="guide-section">
            <view class="section-icon">✋</view>
            <view class="section-text">
              <text class="section-title">长按操作</text>
              <text class="section-desc">长按任意记录可查看详情、修改或删除（提议有投票时修改会清空票数）</text>
            </view>
          </view>
        </view>
        <view class="guide-footer">
          <button class="start-btn" @click="hideGuide">我知道了</button>
        </view>
      </view>
    </view>

    <!-- 2. Filter Bar: Minimalist Text Tabs -->
    <view class="sticky-bar" :style="{ top: (menuButtonInfo.top + 20) + 'px', height: menuButtonInfo.height + 'px' }">
       <view class="filter-row">
            <view
                class="filter-pill"
                :class="{ active: currentFilter === 'all' }"
                @click="setFilter('all')"
            >
                <text>全部</text>
            </view>
            <view
                class="filter-pill"
                :class="{ active: currentFilter === 'comment' }"
                @click="setFilter('comment')"
            >
                <text>吐槽</text>
            </view>
            <view
                class="filter-pill"
                :class="{ active: currentFilter === 'proposal' }"
                @click="setFilter('proposal')"
            >
                <text>提议</text>
            </view>
       </view>
    </view>

    <!-- 3. List Content -->
    <view class="list-container">
       <!-- 加载状态 -->
       <view class="loading-state" v-if="loading">
         <view class="loading-spinner"></view>
         <text class="loading-text">加载中...</text>
       </view>

       <!-- 错误状态 -->
       <view class="error-state" v-else-if="error">
         <text class="error-text">加载失败</text>
         <button class="retry-btn" @click="loadData">重试</button>
       </view>

       <!-- 空状态 -->
       <view class="empty-tip" v-else-if="filteredList.length === 0">
          <text>这里空空如也~</text>
       </view>

       <view
         v-else
         v-for="(item, index) in filteredList"
         :key="item.id"
         class="list-item"
         @click="onItemClick(item)"
         @longpress="onLongPress(item)"
       >
          <!-- Comment Item -->
          <view v-if="item.type === 'comment'" class="card comment-card">
              <view class="card-main">
                  <view class="course-row-top">
                      <text class="course-name">{{ item.courseName }}</text>
                      <text class="time-text">{{ item.time }}</text>
                  </view>
                  
                  <view class="course-row-middle">
                       <view class="course-info-item">
                            <image src="@/images/depart-icon.png" class="info-icon" />
                            <text>未知院系</text>
                       </view>
                  </view>

                  <text class="content-text">{{ item.content }}</text>
                  
                  <view class="footer-row">
                     <view class="likes-box">
                        <image src="@/images/like-icon.png" class="like-icon" />
                        <text class="likes-text">{{ item.likes || 0 }}</text>
                     </view>
                  </view>
              </view>
          </view>

          <!-- Proposal Item -->
          <view v-if="item.type === 'proposal'" class="card proposal-card">
              <view class="card-main">
                  <view class="course-row-top">
                      <text class="course-name">{{ item.courseName }}</text>
                      <text class="time-text">{{ item.time }}</text>
                  </view>
                  
                  <view class="course-row-middle">
                       <view class="course-info-item">
                            <image src="@/images/depart-icon.png" class="info-icon" />
                            <text>未知院系</text>
                       </view>
                  </view>

                  <text class="content-text">{{ item.reason }}</text>
                  
                   <view class="footer-row">
                      <view class="vote-count-box">
                         <image src="@/images/like_active.png" class="vote-icon" />
                         <text class="vote-num">{{ item.voteCount || 0 }}</text>
                         <text class="vote-label">支持</text>
                      </view>
                     <text
                        class="status-badge"
                        :class="{
                          'status-approved': item.status === 'approved',
                          'status-rejected': item.status === 'rejected',
                          'status-pending': item.status === 'pending'
                        }"
                     >
                        {{ item.status === 'approved' ? '已采纳' : item.status === 'rejected' ? '已拒绝' : '投票中' }}
                     </text>
                  </view>
              </view>
          </view>
       </view>
       </view>

       <!-- Bottom Spacer for FAB -->
       <view style="height: 160rpx;"></view>
    </view>

    <!-- Floating Action Button -->
    <view class="fab-btn" @click="onAddClick">
      <view class="plus-icon">+</view>
    </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { waitForLogin } from '@/utils/init';
import { http } from '@/config';
import { HISTORY_PAGE_SIZE } from '@/utils/constants';

// System Info Logic for Header Alignment
const sysInfo = uni.getSystemInfoSync();
let menuButtonInfo = {
    top: sysInfo.statusBarHeight ? sysInfo.statusBarHeight : 20,
    height: 32
};
try {
    const res = uni.getMenuButtonBoundingClientRect();
    if (res && res.top) {
        menuButtonInfo = {
            top: res.top,
            height: res.height
        };
    }
} catch (e) {}

const navBarHeight = menuButtonInfo.height;
const paddingTotal = menuButtonInfo.top + menuButtonInfo.height + 10;

onMounted(async () => { await waitForLogin(); loadData(); });

// Types
type ItemType = 'comment' | 'proposal';
interface ListItem {
    id: string;
    type: ItemType;
    time: string;
    courseName: string;
    content?: string;
    likes?: number;
    reason?: string;
    voteCount?: number;
    status?: 'pending' | 'approved' | 'rejected';
}

const listData = ref<ListItem[]>([]);
const loading = ref(false);
const error = ref(false);

// 首次使用引导弹窗
const showGuide = ref(false);
const GUIDE_KEY = 'meowpick_profile_guide_seen';

const loadData = async () => {
    loading.value = true;
    error.value = false;
    try {
        const [commentRes, proposalRes] = await Promise.all([
            http.CommentController.commentHistoryCreate({ page: 1, pageSize: HISTORY_PAGE_SIZE }),
            http.ProposalController.proposalHistoryList({ page: 1, pageSize: HISTORY_PAGE_SIZE })
        ]);

        const comments = (commentRes.data?.data?.comments || commentRes.data?.comments || []).map((c: any) => ({
            id: c.id || c.courseId,
            type: 'comment' as ItemType,
            time: c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : '',
            courseName: c.name || c.courseName || '未知课程',
            content: c.content || c.text || '',
            likes: c.likeCnt || 0
        }));

        const proposals = (proposalRes.data?.data?.proposals || proposalRes.data?.proposals || []).map((p: any) => ({
            id: p.id,
            type: 'proposal' as ItemType,
            time: p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : '',
            courseName: p.title || p.courseName || '未知提议',
            reason: p.content || p.reason || '',
            voteCount: p.likeCnt || p.agreeCount || 0,
            status: p.status === 'approved' ? 'approved' : p.status === 'rejected' ? 'rejected' : 'pending'
        }));

        listData.value = [...comments, ...proposals];
    } catch (err) {
        console.error('[profile-view] loadData error:', err);
        error.value = true;
        uni.showToast({ title: '加载失败，请重试', icon: 'none' });
    } finally {
        loading.value = false;
    }
};

const currentFilter = ref<'all' | 'comment' | 'proposal'>('all');

const setFilter = (filter: 'all' | 'comment' | 'proposal') => {
    currentFilter.value = filter;
};

const filteredList = computed(() => {
    let result = [...listData.value];
    if (currentFilter.value !== 'all') {
        result = result.filter(item => item.type === currentFilter.value);
    }
    return result.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
});

// Actions
const onAddClick = () => {
    // If specific filter is selected, no menu, strictly filter related action? 
    // Requirement 6: "并且此时点击新增也无子菜单选择" (Wait, requirement 6 says: "点击'提议'或'吐槽'可以只筛选相关内容，并且此时点击新增也无子菜单选择")
    
    if (currentFilter.value === 'comment') {
        goToAddComment();
        return;
    }
    if (currentFilter.value === 'proposal') {
        goToAddProposal();
        return;
    }

    // Default: Show Action Sheet
    uni.showActionSheet({
        itemList: ['新增吐槽', '新增提议'],
        success: (res) => {
            if (res.tapIndex === 0) {
                goToAddComment();
            } else if (res.tapIndex === 1) {
                goToAddProposal();
            }
        }
    });
};

const goToAddComment = () => {
    // Navigate to Search page with mode parameter
    uni.navigateTo({ url: '/pages/find/index/index?mode=add-comment' });
};

const goToAddProposal = () => {
    uni.navigateTo({ url: '/pages/proposal/propose/propose' });
};

const onLongPress = (item: ListItem) => {
    const itemList: string[] = [];
    
    // Logic for Proposal
    if (item.type === 'proposal') {
        if (item.voteCount === undefined || item.voteCount === 0) {
             itemList.push('修改', '删除');
        } else {
             // 需求: 有投票数时支持查看，如果修改或删除则投票数清零
             // We allow modify/delete but warn user
             itemList.push('查看详情', '修改 (清空票数)', '删除');
        }
    } 
    // Logic for Comment
    else {
        itemList.push('查看详情', '修改', '删除');
    }

    uni.showActionSheet({
        itemList: itemList,
        success: (res) => {
            const action = itemList[res.tapIndex || 0];
            if (action.includes('删除')) {
                deleteItem(item);
            } else if (action.includes('修改')) {
                uni.showToast({ title: '功能正在开发中', icon: 'none' });
            } else if (action.includes('查看')) {
                onItemClick(item);
            }
        }
    });
};

const onItemClick = (item: ListItem) => {
    if (item.type === 'comment') {
        uni.navigateTo({
            url: `/pages/course/index/index?id=${item.id}`
        });
    } else {
        const dataStr = encodeURIComponent(JSON.stringify(item));
        uni.navigateTo({
            url: `/pages/course/proposal-detail/index?data=${dataStr}`
        });
    }
};

const deleteItem = async (item: ListItem) => {
    try {
        if (item.type === 'proposal') {
            await http.ProposalController.proposalDeleteCreate(item.id);
        } else {
            // Comment deletion not available in API
            uni.showToast({ title: '评论暂不支持删除', icon: 'none' });
            return;
        }
        listData.value = listData.value.filter(i => i.id !== item.id);
        uni.showToast({ title: '已删除', icon: 'success' });
    } catch (err) {
        console.error('Delete failed:', err);
        uni.showToast({ title: '删除失败', icon: 'none' });
    }
};

onMounted(async () => { await waitForLogin(); loadData(); });

onShow(() => {
  // 检查是否首次使用"我的"页面
  const hasSeenGuide = uni.getStorageSync(GUIDE_KEY);
  if (!hasSeenGuide) {
    showGuide.value = true;
  }
});

const hideGuide = () => {
  showGuide.value = false;
  uni.setStorageSync(GUIDE_KEY, true);
};
</script>

<style scoped lang="scss">
.profile-container {
    position: relative;
    padding-right: 0;
    min-height: 100vh;
    box-sizing: border-box;
    background-color: #f7f8fa;
}

.capsule-mask {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    background-color: #f7f8fa;
    z-index: 99;
    pointer-events: none;
}

/* 1. Header: Breathable & Bold */
.header-section {
    position: relative;
    z-index: 100; /* Above capsule-mask (99) */
    padding: 0 40rpx;
    display: flex;
    align-items: flex-end;
    position: relative;
    
    .title-wrapper {
        display: flex;
        align-items: baseline; 
    }

    .page-title {
        font-size: 56rpx; /* Big Title */
        font-weight: 800; /* Extra Bold */
        color: #1f1f1f;
        margin-right: 20rpx;
        line-height: 1;
        letter-spacing: -2rpx; /* Tighter tracking for modern look */
    }

    .sub-title {
        font-size: 26rpx;
        color: #999;
        font-weight: 400;
    }

    .help-icon {
        position: absolute;
        right: 40rpx;
        top: 50%;
        transform: translateY(-50%);
        width: 48rpx;
        height: 48rpx;
        border-radius: 50%;
        background-color: #f0f0f0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28rpx;
        color: #666;
        font-weight: 600;
    }

    .guide-icon {
        position: absolute;
        right: 40rpx;
        top: 50%;
        transform: translateY(-50%);
        width: 48rpx;
        height: 48rpx;
        border-radius: 50%;
        background-color: #f0f0f0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28rpx;
        color: #666;
        font-weight: 600;
    }
}

/* 2. Filter Bar: Sticky & Clean */
.sticky-bar {
    position: sticky;
    z-index: 100;
    left: 0;
    right: 0;
    padding: 0 40rpx;
    background-color: rgba(247, 248, 250, 0.85);
    backdrop-filter: blur(20px);

    .filter-row {
        display: inline-flex;
        align-items: center;
        background: #fff;
        border-radius: 100rpx;
        padding: 0 6rpx;
        box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.06);
        height: 100%;
    }

    .filter-pill {
        padding: 0 24rpx;
        border-radius: 60rpx;
        font-size: 28rpx;
        font-weight: 500;
        color: #666;
        transition: all 0.12s cubic-bezier(0.25, 0.8, 0.25, 1);
        box-sizing: border-box;
        height: 64rpx;
        line-height: 64rpx;

        &.active {
            background: linear-gradient(135deg, #b20035, #ff4d6a);
            color: #fff;
            font-weight: 600;
            box-shadow: 0 6rpx 16rpx rgba(183, 0, 48, 0.3);
        }
    }
}

.list-container {
    padding: 80rpx 32rpx 40rpx;
}

.card {
    background: #ffffff;
    border-radius: 24rpx;
    box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.05); 
    display: flex;
    overflow: hidden;
    position: relative;
    margin-bottom: 24rpx; 
    border: 1px solid #f0f0f0;
    transition: all 0.12s ease;

    &:active {
        transform: scale(0.96);
        box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.03);
    }

    &.proposal-card {
        background: linear-gradient(135deg, #fff5f6 0%, #ffffff 100%);
        box-shadow: 0 8rpx 24rpx rgba(178, 0, 53, 0.06); 
        border: 1px solid rgba(178, 0, 53, 0.15);

        .course-row-middle {
            background: rgba(255, 255, 255, 0.8);
            border: 1px solid rgba(178, 0, 53, 0.08);
            box-shadow: inset 0 2rpx 8rpx rgba(0,0,0,0.01);
        }
    }

    .card-main {
        flex: 1;
        padding: 32rpx; 
        display: flex;
        flex-direction: column;
    }

    .course-row-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 24rpx;

        .course-name {
            font-size: 36rpx; 
            font-weight: 700;
            color: #1a1a1a; 
            line-height: 1.4;
            flex: 1;
            margin-right: 20rpx;
            letter-spacing: 1rpx;
        }
        .time-text {
            font-size: 24rpx;
            color: #999; 
            font-weight: 400;
            white-space: nowrap;
        }
    }

    .course-row-middle {
        display: flex;
        flex-direction: row; 
        flex-wrap: wrap; 
        align-items: center;
        margin-bottom: 32rpx;
        background: #f8f9fa;
        padding: 20rpx 24rpx;
        border-radius: 16rpx;
        
        .course-info-item {
             display: flex;
             align-items: center;
             font-size: 26rpx;
             color: #555;
             margin-right: 40rpx; 
             font-weight: 500;

             .info-icon {
                  width: 30rpx;
                  height: 30rpx;
                  margin-right: 12rpx;
                  opacity: 0.8; 
             }
        }
    }

    .content-text {
        font-size: 28rpx;
        color: #333; 
        line-height: 1.6; 
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3; 
        overflow: hidden;
        margin-bottom: 24rpx;
        text-align: justify;
    }

    .footer-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px dashed rgba(0,0,0,0.05);
        padding-top: 24rpx;
        
        .likes-box {
            display: flex;
            align-items: center;
            
            .like-icon {
                width: 36rpx;
                height: 36rpx;
                margin-right: 8rpx;
                opacity: 0.6;
            }
            .likes-text {
                font-size: 26rpx;
                color: #666;
            }
        }

        .vote-count-box {
             display: flex;
             align-items: center;
             background: linear-gradient(90deg, #fff0f2, #fff5f6);
             padding: 10rpx 24rpx;
             border-radius: 30rpx;
             border: 1px solid rgba(178, 0, 53, 0.05);
             
             .vote-icon {
                  width: 30rpx;
                  height: 30rpx;
                  margin-right: 12rpx;
             }
             .vote-num {
                  font-size: 32rpx;
                  font-weight: 800;
                  color: #b20035;
                  margin-right: 6rpx;
             }
             .vote-label {
                  font-size: 24rpx;
                  color: #b20035;
                  opacity: 0.9;
                  font-weight: 500;
             }
        }

        .status-badge {
            padding: 10rpx 20rpx;
            border-radius: 30rpx;
            font-size: 24rpx;
            font-weight: 600;
            
            &.status-pending {
                background: linear-gradient(90deg, rgba(0, 102, 204, 0.08), rgba(0, 102, 204, 0.04));
                color: #0066cc;
                border: 1px solid rgba(0, 102, 204, 0.05);
            }
            &.status-approved {
                background: linear-gradient(90deg, rgba(56, 142, 60, 0.08), rgba(56, 142, 60, 0.04));
                color: #388E3C;
                border: 1px solid rgba(56, 142, 60, 0.05);
            }
            &.status-rejected {
                background: linear-gradient(90deg, rgba(178, 0, 53, 0.08), rgba(178, 0, 53, 0.04));
                color: #b20035;
                border: 1px solid rgba(178, 0, 53, 0.05);
            }
        }
    }
}

.fab-btn {
    position: fixed;
    right: 40rpx;
    bottom: 200rpx; /* Above bottom tab bar */
    width: 110rpx;
    height: 110rpx;
    background: linear-gradient(135deg, #b20035, #ff4d6a);
    border-radius: 50%;
    box-shadow: 0 8rpx 30rpx rgba(178, 0, 53, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    transition: transform 0.05s;

    &:active {
        transform: scale(0.94);
    }

    .plus-icon {
        color: #fff;
        font-size: 60rpx;
        font-weight: 300;
        margin-top: -8rpx;
    }
}

// 加载状态
.empty-tip {
    padding: 200rpx 0;
    text-align: center;

    text {
        font-size: 28rpx;
        color: #999999;
    }
}

.loading-state {
    width: 100%;
    padding: 200rpx 0;
    text-align: center;

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
        background: linear-gradient(135deg, #b20035, #ff4d6a);
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
</style>

<style lang="scss">
.guide-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  box-sizing: border-box;
}

.guide-content {
  width: 100%;
  max-width: 600rpx;
  background-color: #ffffff;
  border-radius: 32rpx;
  padding: 48rpx 40rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.3);
}

.guide-header {
  text-align: center;
  margin-bottom: 48rpx;

  .guide-title {
    display: block;
    font-size: 44rpx;
    font-weight: 800;
    color: #1a1a1a;
    margin-bottom: 16rpx;
  }

  .guide-subtitle {
    display: block;
    font-size: 26rpx;
    color: #999;
  }
}

.guide-sections {
  margin-bottom: 48rpx;
}

.guide-section {
  display: flex;
  align-items: flex-start;
  margin-bottom: 36rpx;

  &:last-child {
    margin-bottom: 0;
  }

  .section-icon {
    width: 80rpx;
    height: 80rpx;
    background-color: #fff5f7;
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40rpx;
    margin-right: 24rpx;
    flex-shrink: 0;
  }

  .section-text {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .section-title {
    font-size: 30rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 8rpx;
  }

  .section-desc {
    font-size: 24rpx;
    color: #888;
    line-height: 1.5;
  }
}

.guide-footer {
  .start-btn {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    background: linear-gradient(135deg, #b20035, #ff4d6a);
    color: #fff;
    font-size: 32rpx;
    font-weight: 600;
    border-radius: 44rpx;
    border: none;
    box-shadow: 0 8rpx 24rpx rgba(178, 0, 53, 0.3);

    &:active {
      transform: scale(0.98);
      opacity: 0.9;
    }
  }
}
</style>
