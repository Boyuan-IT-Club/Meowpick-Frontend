<template>
  <view class="container">
      <!-- 1. Custom Header -->
      <view class="custom-header">
          <!-- Status Bar Height -->
          <!-- We don't need separate status bar view if we pad the container -->
          <!-- But keeping it simple is good. -->
          
          <!-- Nav Bar Content -->
          <!-- Adjusted to match Search Page Layout: align with capsule -->
          <view class="nav-row" :style="navRowStyle">
             <view class="back-btn-wrapper" @click="goBack" :style="backBtnStyle">
                <BackBtn />
             </view>
             <view class="search-input-mock" @click="goBack" :style="inputBoxStyle">
                 <image src="@/images/search-icon.png" class="search-icon" />
                 <text v-if="keyword" class="search-text">{{ keyword }}</text>
                 <text v-else class="search-placeholder">搜索课程/老师</text>
                 <view v-if="keyword" class="clear-icon" @click.stop="clearKeyword">
                    <text class="clear-text">×</text>
                </view>
             </view>
          </view>
          
          <!-- Filter Bar -->
          <view class="filter-bar">
              <view class="refresh-btn" @click="refreshSearch">
                  <image src="@/images/go-back2.png" class="refresh-icon" :class="{ spinning: loading }" />
              </view>

              <view
                class="filter-item"
                :class="{ active: currentSort === 'time' }"
                @click="changeSort('time')"
              >最新评论</view>
              <view
                class="filter-item"
                :class="{ active: currentSort === 'hot' }"
                @click="changeSort('hot')"
              >评论数</view>

              <!-- Filter Button -->
               <view class="filter-btn" @click="toggleMoreFilter">
                  <text class="filter-btn-text">筛选</text>
                  <image src="@/images/search_black.png" class="filter-btn-icon" />
               </view>
          </view>
          
          <!-- Filter Dropdowns for Campus and Depart (original) -> REMOVED/REPLACED by new logic -->
          <!-- The user wants "Comprehensive Sort", "Sort by Comment Count", "Sort by Newest Comment" -->
          <!-- And ONE "Filter" button that opens a complex filter panel (Campus + Card Type) -->
          
          <!-- New Filter Panel -->
          <view v-if="showMoreFilter" class="filter-panel-mask" @click="closeFilters"></view>
          <view v-if="showMoreFilter" class="filter-panel" :style="{ top: realHeaderTotalHeight + 'px' }">
               <view class="filter-section">
                   <view class="filter-title">校区</view>
                   <view class="filter-tags">
                       <view 
                         class="tag-item" 
                         :class="{ active: filterState.campus.includes('普陀校区') }"
                         @click="toggleFilter('campus', '普陀校区')"
                       >普陀</view>
                       <view 
                         class="tag-item" 
                         :class="{ active: filterState.campus.includes('闵行校区') }"
                         @click="toggleFilter('campus', '闵行校区')"
                       >闵行</view>
                   </view>
               </view>
               
               <view class="filter-section">
                   <view class="filter-title">卡片类型</view>
                   <view class="filter-tags">
                       <view 
                         class="tag-item" 
                         :class="{ active: filterState.type.includes('course') }"
                         @click="toggleFilter('type', 'course')"
                       >课程</view>
                       <view 
                         class="tag-item" 
                         :class="{ active: filterState.type.includes('proposal') }"
                         @click="toggleFilter('type', 'proposal')"
                       >提议</view>
                   </view>
               </view>
               
               <view class="filter-actions">
                   <view class="action-btn reset" @click="resetFilters">重置</view>
                   <view class="action-btn confirm" @click="confirmFilters">确定</view>
               </view>
          </view>

          <!-- Original Dropdowns removed -->
      </view>

      <!-- 2. Result Scroll Area -->
      <!-- margin-top = headerTotalHeight + filterBarHeight (approx 80rpx) -->
      <scroll-view
        class="result-scroll"
        :style="{ paddingTop: realHeaderTotalHeight + 'px' }"
        scroll-y
        @scrolltolower="handleScrollBottom"
      >
        <!-- Loading State -->
        <view class="loading-state" v-if="loading">
            <view class="loading-spinner"></view>
            <text class="loading-text">加载中...</text>
        </view>

        <!-- Course Results -->
        <view class="list-content" v-if="!loading && groupedRows.course.length > 0">
            <view class="group-section">
                <view class="group-title">课程</view>
                <view
                    v-for="(item, index) in groupedRows.course"
                    :key="'c_'+index"
                    class="course-li"
                    @click="jump(item)"
                >
                    <choose-course :data="item" />
                </view>
            </view>

            <view class="bottom">--- 到底了哟 ---</view>

            <!-- 查看其他同学提议按钮 -->
            <view class="show-proposals-tip" @click="onShowProposals">
                <text>没找到你想找的课程？看看其他同学的建课提议吧</text>
                <image src="@/images/go-back.png" class="tip-arrow" />
            </view>
        </view>

        <!-- No courses but has keyword - show proposals directly -->
        <view class="list-content" v-if="!loading && groupedRows.course.length === 0 && keyword">
            <view class="empty-hint">--- 暂无相关课程 ---</view>

            <!-- 查看其他同学提议按钮 -->
            <view class="show-proposals-tip" @click="onShowProposals">
                <text>没找到你想找的课程？看看其他同学的建课提议吧</text>
                <image src="@/images/go-back.png" class="tip-arrow" />
            </view>
        </view>

        <!-- Proposal Results (after clicking button) -->
        <view class="list-content" v-if="showProposalsList && groupedRows.proposal.length > 0">
            <view class="group-section">
                <view class="group-title">提议</view>
                <view
                    v-for="(item, index) in groupedRows.proposal"
                    :key="'p_'+index"
                    class="course-li"
                    @click="jump(item)"
                >
                    <choose-course :data="item" />
                </view>
            </view>

            <!-- Proposal loading -->
            <view class="loading-state" v-if="proposalLoading">
                <view class="loading-spinner"></view>
                <text class="loading-text">加载提议中...</text>
            </view>

            <view class="bottom">--- 到底了哟 ---</view>

            <!-- 发起新课程提议按钮 -->
            <view class="add-proposal-bar">
                 <view class="add-proposal-btn" @click="goToProposal">
                    +  没找到想要的？发起新课程提议
                 </view>
            </view>
        </view>

        <!-- Proposal section opened but no proposals -->
        <view class="list-content" v-if="showProposalsList && groupedRows.proposal.length === 0 && !proposalLoading">
            <view class="empty-hint">--- 暂无相关提议 ---</view>

            <!-- 发起新课程提议按钮 -->
            <view class="add-proposal-bar">
                 <view class="add-proposal-btn" @click="goToProposal">
                    +  没找到想要的？发起新课程提议
                 </view>
            </view>
        </view>

        <!-- Initial state - empty search -->
        <view class="list-content" v-if="!loading && !keyword">
            <view class="empty-state">
                <text class="empty-text">搜索课程或老师</text>
            </view>
        </view>

        <!-- Add a padding block to ensure scroll view can scroll enough -->
        <view style="height: 40rpx;"></view>

      </scroll-view>
  </view>
</template>
<script setup lang="ts">
import BackBtn from "@/components/common/BackBtn.vue";
import { onShow, onLoad } from "@dcloudio/uni-app";
import { ref, onMounted, computed } from "vue";
import { useChoose } from "./index";
import ChooseCourse from "@/components/choose/choose-course/index.vue";

const { keyword, jump, rows, proposalRows, page, loading, proposalLoading, loadProposals, loadMoreProposals, doSearch } = useChoose();

// Filter States
const currentSort = ref('default'); // default, comment_count, latest_comment
const showMoreFilter = ref(false);
const showProposalsList = ref(false); // 是否显示提议列表

const filterState = ref({
    campus: ['普陀校区', '闵行校区', '两校区通用'], // Default select all
    type: ['course', 'proposal'] // Default select all
});

// Mock Data Transformation for Grouping
const groupedRows = computed(() => {
    const list = rows.value || [];
    const filtered = list.filter(item => {
        // Filter by Campus
        const itemCampus = item.campus || '';
        const campusMatch = filterState.value.campus.some(c => itemCampus.includes(c) || c === '两校区通用'); // Simple loose match

        // Filter by Type
        const itemType = item.resultType || 'course';
        const typeMatch = filterState.value.type.includes(itemType);

        return campusMatch && typeMatch;
    });

    // proposals from proposalRows (loaded on demand)
    const proposals = proposalRows.value || [];

    return {
        course: filtered.filter(item => item.resultType !== 'proposal'),
        proposal: proposals
    };
});

// Sort logic (Mock)
const changeSort = (sortType: string) => {
    currentSort.value = sortType;
    uni.showToast({ title: '功能正在开发中', icon: 'none' });
};

const toggleMoreFilter = () => {
    showMoreFilter.value = !showMoreFilter.value;
};

const closeFilters = () => {
    showMoreFilter.value = false;
};

const toggleFilter = (category: 'campus' | 'type', value: string) => {
    const arr = filterState.value[category];
    const index = arr.indexOf(value);
    if (index > -1) {
        // Handle deselect
        if (arr.length > 1) {
             arr.splice(index, 1);
        } else {
             // Maybe prevent empty selection or handle differently
             // For now, allow empty
             arr.splice(index, 1);
        }
    } else {
        // Handle select
        arr.push(value);
    }
};

const resetFilters = () => {
    filterState.value.campus = ['普陀校区', '闵行校区', '两校区通用'];
    filterState.value.type = ['course', 'proposal'];
};

const confirmFilters = () => {
    showMoreFilter.value = false;
};

// Toggle proposals list visibility
const toggleProposalsList = () => {
    showProposalsList.value = true;
};

// 点击"查看其他同学提议"按钮
const onShowProposals = () => {
    showProposalsList.value = true;
    loadProposals(true); // 加载提议
};

// 跳转到新增提议页面
const goToProposal = () => {
    uni.navigateTo({
        url: '/pages/proposal/propose/propose'
    });
};

// System Info
const sysInfo = uni.getSystemInfoSync();
const statusBarHeight = sysInfo.statusBarHeight || 0;
const navBarHeight = 44; // Fixed height for nav bar
const realHeaderTotalHeight = ref(statusBarHeight + navBarHeight);

// Watchers
watchEffect(() => {
    // Update header height on mount and when system info changes
    const updateHeaderHeight = () => {
        nextTick(() => {
            realHeaderTotalHeight.value = statusBarHeight + navBarHeight;
        });
    };

    updateHeaderHeight();
    onMounted(updateHeaderHeight);
});

// Load initial data - wait for keyword to be set
onMounted(() => {
    // keyword should be set from find page before navigating here
    if (keyword.value) {
        doSearch(true, '');
    }
});

// Pull down to refresh
const onPullDownRefresh = () => {
    // Reset page number or any other state if needed
    // For demo, we just reload the data
    doSearch(true, '');
};

const refreshSearch = () => {
    if (loading.value) return;
    doSearch(true, '');
};

// Infinite scroll / Load more
const handleScrollBottom = () => {
    if (loading.value) return;
    if (showProposalsList.value) {
        // 加载更多提议
        loadMoreProposals();
    } else {
        // 加载更多课程
        doSearch(false, '');
    }
};

// Expose to template
const goBack = () => {
    uni.navigateBack();
};

const clearKeyword = () => {
    // Clear keyword and trigger search
    keyword.value = '';
    doSearch(true, '');
};
</script>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.custom-header {
    background-color: #fff;
    /* Add other styles as needed */
}

.nav-row {
    display: flex;
    align-items: center;
    height: 88rpx;
    padding: 0 30rpx;
    /* Add other styles as needed */
}

.back-btn-wrapper {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.search-input-mock {
    flex: 1;
    height: 60rpx;
    border-radius: 30rpx;
    background-color: #f5f5f5;
    display: flex;
    align-items: center;
    padding: 0 20rpx;
    position: relative;
}

.search-icon {
    width: 24rpx;
    height: 24rpx;
}

.search-text {
    flex: 1;
    margin-left: 10rpx;
    font-size: 28rpx;
    color: #333;
}

.search-placeholder {
    flex: 1;
    margin-left: 10rpx;
    font-size: 28rpx;
    color: #999;
}

.clear-icon {
    width: 24rpx;
    height: 24rpx;
    position: absolute;
    right: 10rpx;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
}

.filter-bar {
    display: flex;
    height: 80rpx;
    align-items: center;
    justify-content: space-between;
    padding: 0 30rpx;
    background-color: #fff;
    border-top: 1px solid #eaeaea;
    border-bottom: 1px solid #eaeaea;
}

.filter-item {
    flex: 1;
    text-align: center;
    font-size: 28rpx;
    color: #333;
    padding: 10rpx 0;
}

.filter-item.active {
    color: #007aff;
    font-weight: bold;
}

.refresh-btn {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.refresh-icon {
    width: 36rpx;
    height: 36rpx;
    transition: transform 0.3s;
}

.refresh-icon.spinning {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.filter-btn {
    width: 120rpx;
    height: 60rpx;
    border-radius: 30rpx;
    background-color: #007aff;
    display: flex;
    align-items: center;
    justify-content: center;
}

.filter-btn-text {
    font-size: 28rpx;
    color: #fff;
}

.filter-btn-icon {
    width: 24rpx;
    height: 24rpx;
    margin-left: 10rpx;
}

.filter-panel-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
}

.filter-panel {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    max-width: 750rpx;
    background: #fff;
    border-top-left-radius: 30rpx;
    border-top-right-radius: 30rpx;
    padding: 20rpx;
    z-index: 1001;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.2);
}

.filter-section {
    margin-bottom: 20rpx;
}

.filter-title {
    font-size: 32rpx;
    color: #333;
    margin-bottom: 10rpx;
}

.filter-tags {
    display: flex;
    flex-wrap: wrap;
}

.tag-item {
    padding: 10rpx 20rpx;
    border-radius: 15rpx;
    background: #f0f0f0;
    color: #333;
    font-size: 28rpx;
    margin-right: 10rpx;
    margin-bottom: 10rpx;
    cursor: pointer;
}

.tag-item.active {
    background: #007aff;
    color: #fff;
}

.filter-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 20rpx;
}

.action-btn {
    padding: 10rpx 20rpx;
    border-radius: 15rpx;
    font-size: 28rpx;
    cursor: pointer;
}

.action-btn.reset {
    background: #f0f0f0;
    color: #333;
    margin-right: 10rpx;
}

.action-btn.confirm {
    background: #007aff;
    color: #fff;
}

.result-scroll {
    flex: 1;
    background-color: #f9f9f9;
}

.list-content {
    padding: 20rpx;
}

.bottom {
    text-align: center;
    font-size: 24rpx;
    color: #999;
    margin: 20rpx 0;
}

.empty-hint {
    text-align: center;
    font-size: 28rpx;
    color: #999999;
    margin: 40rpx 0;
}

.group-section {
    margin-bottom: 40rpx;
}

.group-title {
    font-size: 32rpx;
    color: #333;
    margin-bottom: 20rpx;
}

.course-li {
    margin-bottom: 20rpx;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 500rpx;
    text-align: center;
}

.empty-img {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 20rpx;
}

.empty-text {
    font-size: 28rpx;
    color: #999;
    margin-bottom: 20rpx;
}

.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 200rpx 0;
}

.loading-spinner {
    width: 60rpx;
    height: 60rpx;
    border: 4rpx solid #ddd;
    border-top-color: #c8102e;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20rpx;
}

.loading-text {
    font-size: 28rpx;
    color: #666;
}

.new-card {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 80rpx;
    padding: 0 20rpx;
    border-radius: 40rpx;
    background-color: #007aff;
    color: #fff;
    font-size: 28rpx;
    cursor: pointer;
}

.new-card-content {
    flex: 1;
    text-align: center;
}

.new-card-title {
    font-weight: bold;
}

.new-card-sub {
    font-size: 24rpx;
    color: #fff;
}

.new-card-icon {
    width: 32rpx;
    height: 32rpx;
    margin-left: 10rpx;
}

.add-proposal-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 80rpx;
    background-color: #fff;
    border-top: 1px solid #eaeaea;
    border-bottom: 1px solid #eaeaea;
}

.add-proposal-btn {
    padding: 10rpx 20rpx;
    border-radius: 15rpx;
    background-color: #007aff;
    color: #fff;
    font-size: 28rpx;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.add-proposal-btn:before {
    content: '+';
    margin-right: 10rpx;
    font-size: 32rpx;
    line-height: 1;
}

.show-proposals-tip {
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(200, 16, 46, 0.05); /* 软糯的主题红背景 */
    color: #c8102e; /* 经典的主题红字体 */
    font-size: 26rpx; /* 字体稍微小一点，显得不厚重 */
    font-weight: 500;
    padding: 24rpx 10rpx;
    border-radius: 12rpx; /* 微圆角 */
    margin: 30rpx 0;
    transition: all 0.2s ease;
}

.show-proposals-tip:active {
    background: rgba(200, 16, 46, 0.1); /* 点击时的视觉反馈 */
}

.tip-arrow {
    width: 24rpx;
    height: 24rpx;
    margin-left: 10rpx;
    opacity: 0.8;
}

.still-nothing-tip {
    text-align: center;
    font-size: 24rpx;
    color: #999;
    margin-bottom: 24rpx;
    margin-top: 40rpx;
}
</style>
