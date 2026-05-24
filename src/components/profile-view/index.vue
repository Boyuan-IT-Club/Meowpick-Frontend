<template>
  <view class="profile-container" :style="{ paddingTop: menuButtonInfo.top + 'px' }">

    <!-- 1. Header Area: Large & Breathable -->
    <view class="header-section" :style="{ marginTop: '20rpx', marginBottom: '40rpx' }">
      <view class="title-wrapper">
         <text class="page-title">我的发布</text>
         <text class="sub-title">{{ loading ? '加载中...' : (filteredList.length + ' 条记录') }}</text>
      </view>
    </view>

    <!-- 2. Filter Bar: Minimalist Text Tabs -->
    <view class="sticky-bar" :style="{ top: (menuButtonInfo.top) + 'px' }">
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
                        <text class="vote-label">票</text>
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
const paddingTotal = menuButtonInfo.top + menuButtonInfo.height + 10; // 10rpx spacing

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
onShow(async () => { await waitForLogin(); loadData(); });
</script>

<style scoped lang="scss">
.profile-container {
    padding-left: 0;
    padding-right: 0;
    min-height: 100vh;
    box-sizing: border-box;
    background-color: #f7f8fa; /* Global BG */
}

/* 1. Header: Breathable & Bold */
.header-section {
    padding: 0 40rpx; /* Matches list side padding */
    display: flex;
    align-items: flex-end; /* Align baseline */
    position: relative;
    z-index: 101; /* Ensure title is above the sticky bar mask */
    
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
}

/* 2. Filter Bar: Sticky & Clean */
.sticky-bar {
    position: sticky;
    z-index: 100;
    // background-color: rgba(247, 248, 250, 0.95); <--- Remove hardcoded bg color to let blur work better or keep it subtle
    /* Use a very light blur background */
    background-color: rgba(247, 248, 250, 0.85); 
    backdrop-filter: blur(20px); 
    padding: 20rpx 40rpx;
    margin-bottom: 20rpx;
    display: flex; /* Changed from just flex to align items */
    align-items: center; /* Center vertically */
    
    /* Add a top mask to prevent content from showing above the sticky bar when scrolling */
    &::before {
        content: '';
        position: absolute;
        bottom: 100%; /* Start exactly at the top of the sticky bar */
        left: 0;
        right: 0;
        height: 100vh; /* Extend upwards enough to cover the entire screen above */
        background-color: #f7f8fa; /* Match the global background color */
        z-index: -1;
    }

    .filter-row {
        display: flex;
        align-items: center;
        background: #fff; 
        border-radius: 100rpx;
        padding: 6rpx; /* Slightly reduced padding */
        box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.06); /* Softer, deeper shadow */
    }
    
    .filter-pill {
        padding: 12rpx 40rpx;
        border-radius: 60rpx;
        font-size: 28rpx;
        font-weight: 500;
        color: #666;
        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
        
        &.active {
            /* Replace black bg with gradient from layout/main.vue */
            background: linear-gradient(90deg, #b70030, #ff4d6a); 
            color: #fff;
            font-weight: 600;
            box-shadow: 0 6rpx 16rpx rgba(183, 0, 48, 0.3); /* Colored shadow matching brand */
        }
    }
}

.list-container {
    padding: 0 32rpx;
    padding-bottom: 40rpx;
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
    transition: all 0.3s ease;

    &:active {
        transform: scale(0.98);
        box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.03);
    }

    &.proposal-card {
        background: linear-gradient(135deg, #fff5f6 0%, #ffffff 100%);
        box-shadow: 0 8rpx 24rpx rgba(200, 16, 46, 0.06); 
        border: 1px solid rgba(200, 16, 46, 0.15);

        .course-row-middle {
            background: rgba(255, 255, 255, 0.8);
            border: 1px solid rgba(200, 16, 46, 0.08);
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
             border: 1px solid rgba(200, 16, 46, 0.05);
             
             .vote-icon {
                  width: 30rpx;
                  height: 30rpx;
                  margin-right: 12rpx;
             }
             .vote-num {
                  font-size: 32rpx;
                  font-weight: 800;
                  color: #c8102e;
                  margin-right: 6rpx;
             }
             .vote-label {
                  font-size: 24rpx;
                  color: #c8102e;
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
                background: linear-gradient(90deg, rgba(200, 16, 46, 0.08), rgba(200, 16, 46, 0.04));
                color: #c8102e;
                border: 1px solid rgba(200, 16, 46, 0.05);
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
    background-color: #c8102e;
    border-radius: 50%;
    box-shadow: 0 8rpx 30rpx rgba(200, 16, 46, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    transition: transform 0.1s;

    &:active {
        transform: scale(0.95);
    }

    .plus-icon {
        color: #fff;
        font-size: 60rpx;
        font-weight: 300;
        margin-top: -8rpx;
    }
}

// 加载状态
.loading-state {
    width: 100%;
    padding: 200rpx 0;
    text-align: center;

    .loading-spinner {
        width: 80rpx;
        height: 80rpx;
        margin: 0 auto 24rpx;
        border: 4rpx solid #ddd;
        border-top-color: #c8102e;
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
        background-color: #c8102e;
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
