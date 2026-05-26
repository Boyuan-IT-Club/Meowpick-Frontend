<template>
  <view class="find-container" :class="{ 'dark-mode': isDark }">
    <!-- 顶部动态 Header -->
    <view 
      class="dynamic-header"
      :class="{ 'is-collapsed': isCollapsed }"
      :style="{ height: headerHeight + 'px' }"
    >
        <!-- Add Comment Search Guide Banner -->
        <view v-if="mode === 'add-comment'" class="search-guide-banner" :style="{ top: (headerHeight) + 'px' }">
            <text>请搜索并选择一门课程进行吐槽</text>
        </view>

        <!-- 搜索功能区容器 -->
        <view 
            class="search-bar-wrapper"
            :style="searchBarWrapperStyle"
        >
            <!-- 左侧：返回按钮 (直接上移) -->
            <view class="nav-back-btn" @click="goBack" :style="navBackBtnStyle">
                <BackBtn />
            </view>

            <!-- 中间：搜索框 (上移同时控制右边距) -->
            <view class="search-input-box" :style="searchInputBoxStyle">
                <image src="@/images/search-icon.png" class="search-icon" />
                <input
                v-model="searchText"
                class="search-input"
                :placeholder="placeHolder"
                :focus="!isResultMode"
                @focus="onInputFocus"
                @blur="isFocused = false"
                @input="onInputChange"
                confirm-type="search"
                @confirm="handleSearch"
                placeholder-class="placeholder-style"
                />
                <view v-if="searchText" class="clear-icon" @click="clearSearch">
                    <text class="clear-text">×</text>
                </view>
            </view>

            <!-- 移除右侧搜索按钮 -->
        </view>
        
        <!-- Filter Bar (Only in Result Mode) -->
        <!-- Inject into header so it stays fixed if needed, or put in scroll view? -->
        <!-- Design choice: usually filter bar is below header. -->
        <!-- But to stick, we can put it here if we want sticky header behavior easily. -->
        <!-- Let's put it in the header container but only visible when Result Mode -->
                <view v-if="isResultMode" class="filter-bar-wrapper" :style="{ top: headerHeight + 'px' }">
                    <view class="filter-bar">
                        <view 
                            class="filter-item" 
                            :class="{ active: currentSort === 'default' }"
                            @click="changeSort('default')"
                        >综合</view>
                        <view 
                            class="filter-item" 
                            :class="{ active: currentSort === 'hot' }"
                            @click="changeSort('hot')"
                        >热度</view>
                        <view 
                            class="filter-item" 
                            :class="{ active: currentSort === 'time' }"
                            @click="changeSort('time')"
                        >时间</view>

                        <view class="filter-action" @click="toggleFilterPanel">
                            <image src="@/images/choose-icon.png" style="width:28rpx;height:28rpx;margin-right:8rpx;" />
                            <text>筛选</text>
                        </view>
                    </view>

                    <!-- Filter panel overlay -->
                    <!-- 修改：Dropdown 模式 -->
                    <!-- 遮罩层：top offset by headerHeight + filterBarHeight (approx 44px) -->
                    <!-- 其实可以直接放在 filter-bar-wrapper 内部，利用 absolute 定位 -->
                    <view v-if="showFilterPanel" 
                        class="mask-overlay" 
                        @click="toggleFilterPanel"
                        :style="{ top: (headerHeight + 44) + 'px' }"
                    >
                        <view class="dropdown-panel" @click.stop>
                            <!-- Remove Header with title/close as it's a dropdown now -->
                            
                            <scroll-view scroll-y class="dropdown-scroll-content">
                                <view class="filter-group">
                                    <text class="group-title">校区选择</text>
                                    <view class="tags-container">
                                        <view 
                                            class="filter-tag" 
                                            :class="{ active: filterState.campuses.includes('闵行') }" 
                                            @click="toggleCampus('闵行')"
                                        >闵行校区</view>
                                        <view 
                                            class="filter-tag" 
                                            :class="{ active: filterState.campuses.includes('普陀') }" 
                                            @click="toggleCampus('普陀')"
                                        >普陀校区</view>
                                    </view>
                                </view>

                                <view class="filter-group">
                                    <text class="group-title">内容类型</text>
                                    <view class="tags-container">
                                        <view 
                                            class="filter-tag" 
                                            :class="{ active: filterState.types.includes('course') }" 
                                            @click="toggleType('course')"
                                        >课程评价</view>
                                        <view 
                                            class="filter-tag" 
                                            :class="{ active: filterState.types.includes('proposal') }" 
                                            @click="toggleType('proposal')"
                                        >新课提议</view>
                                    </view>
                                </view>
                            </scroll-view>

                            <view class="dropdown-footer">
                                <button class="btn-common btn-reset" @click="resetFilters">重置</button>
                                <button class="btn-common btn-confirm" @click="applyFilters">确定</button>
                            </view>
                        </view>
                    </view>

                </view>
    </view>

    <!-- 内容区域 -->
    <scroll-view 
        scroll-y 
        class="content-scroll" 
        :style="{ paddingTop: isResultMode ? (headerHeight + 44) + 'px' : headerHeight + 'px' }" 
        @scroll="onScroll"
        @scrolltolower="handleScrollBottom"
    >
      
      <!-- 场景 A: 有搜索词且不在结果模式 -> 显示建议列表 -->
      <view v-if="searchText && !isResultMode" class="suggest-section">
          <!-- 这里使用真实的模糊搜索列表展示 -->
        <view 
          v-for="(item, index) in suggestList" 
          :key="index"
          class="suggest-item"
          @click="handleSuggestClick(item)"
        >
          <!-- 左侧图标/类型 -->
          <!-- 模糊搜索通常不显示具体类型颜色，或者统一一种颜色 -->
          <view class="item-icon-wrapper">
             <image src="@/images/search-icon.png" class="mini-search-icon" style="width:24rpx;height:24rpx;opacity:0.5;" />
          </view>
          
          <!-- 右侧内容 -->
          <view class="item-content">
             <!-- 渲染内容 -->
             <text class="item-name">{{ item.name }}</text>
             <!-- 模糊搜索通常没有 subInfo，或者 subInfo 是“搜索” -->
          </view>
          
          <!-- 箭头 -->
          <view class="item-arrow">
              <image src="@/images/go-back.png" style="width:24rpx;height:24rpx;transform:rotate(180deg);opacity:0.3;" />
          </view>
        </view>
      </view>

      <!-- 场景 C: 结果模式 -> 显示 Result List -->
      <view v-else-if="isResultMode" class="result-section">
        <view class="list-content" v-if="rows.length > 0" style="padding-top: 15rpx;">
                <!-- Courses Section -->
                <view class="group-section" v-if="groupedRows.courses.length">
                    <view class="group-title">课程</view>
                    <view v-for="(item, idx) in groupedRows.courses" :key="item.id" class="result-card" @click="onResultClick(item)">
                        <view class="result-card-wrapper course-card">
                            <choose-course :data="item" variant="course" />
                        </view>
                    </view>
                </view>

                <view class="bottom" v-if="!showProposalsList">--- 到底了哟 ---</view>

                <!-- Guide to show proposals if hidden -->
                <view v-if="!showProposalsList && groupedRows.proposals.length > 0" class="show-proposals-tip" @click="toggleProposalsList">
                    <text>没有找到你的目标课程？点击查看其他同学的建课提议 👇</text>
                    <image src="@/images/go-back.png" class="tip-arrow" />
                </view>

                <!-- Proposals Section -->
                <view class="group-section" v-if="showProposalsList && groupedRows.proposals.length">
                    <view class="group-title">提议</view>
                    <view v-for="(item, idx) in groupedRows.proposals" :key="item.id" class="result-card" @click="onResultClick(item)">
                        <view class="result-card-wrapper proposal-card">
                            <!-- ensure passing variant proposal -->
                            <choose-course :data="item" variant="proposal" />
                        </view>
                    </view>
                </view>

                <!-- New Card Section -->
                <view v-if="showProposalsList || (!groupedRows.courses.length && !groupedRows.proposals.length)" class="group-section new-section">
                    <!-- If we are showing proposals, we show the "Still nothing?" message -->
                    <view v-if="showProposalsList || groupedRows.courses.length" class="still-nothing-tip">
                         <text>还是没找到你想找的？</text>
                    </view>

                    <view class="group-title" style="margin-top: -10rpx;" v-if="!showProposalsList && !groupedRows.courses.length">新增</view>
                    <view class="result-card new-card" @click="goToProposal">
                        <view class="result-card-wrapper" style="padding: 0; background: transparent; box-shadow: none;">
                            <view class="new-card-content" style="flex-direction: row; align-items: center; justify-content: center; background: linear-gradient(135deg, #c8102e 0%, #ff4d6a 100%); padding: 30rpx 40rpx; border-radius: 20rpx; box-shadow: 0 8rpx 20rpx rgba(200, 16, 46, 0.15);">
                                <view class="new-card-title" style="margin-bottom: 0; color: #fff; font-size: 32rpx; font-weight: 600;">那就亲自提议吧！</view>
                            </view>
                        </view>
                    </view>
                </view>

                <view class="bottom" v-if="showProposalsList">--- 到底了哟 ---</view>
            </view>
            
            <!-- Empty State -->
            <view class="empty-state" v-else-if="!loading">
                <image src="@/images/cat.png" class="empty-img" mode="aspectFit" />
                <text class="empty-text">这里空空如也...</text>
                <text class="empty-sub">没有找到你想要的？</text>
                <view class="proposal-btn" @click="goToProposal">
                    去提议
                </view>
            </view>
      </view>

      <!-- 场景 B: 无搜索词 -> 显示历史记录 & 热门推荐 (Default) -->
      <view v-else class="empty-section">
        
        <!-- 历史记录 -->
        <view class="section-header">
          <text class="section-title">历史搜索</text>
          <view class="clear-history" @click="clearHistory">
             🗑️ <!-- 暂时用 emoji 替代图标 -->
          </view>
        </view>
        
        <view class="history-tags">
            <view 
              v-for="(tag, index) in historyList" 
              :key="index" 
              class="tag-item"
              @click="clickHistory(tag)"
            >
              {{ tag }}
            </view>
            <view v-if="historyList.length === 0" class="no-history">暂无搜索记录</view>
        </view>
        
        <!-- 猜你想搜 -->
        <view class="section-header" style="margin-top: 60rpx;">
          <text class="section-title">猜你想搜</text>
        </view>
        <view class="recommend-list">
           <view 
              v-for="(item, index) in hotList" 
              :key="index" 
              class="recommend-item"
              @click="clickRecommend(item.keyword)"
            >
              <view class="recommend-icon">
                 <image src="@/images/search-icon.png" class="mini-icon" />
              </view>
              <text class="recommend-word">{{ item.keyword }}</text>
              <text class="recommend-tag" v-if="item.tag">{{ item.tag }}</text>
           </view>
        </view>

      </view>

    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import BackBtn from "@/components/common/BackBtn.vue";
import { onMounted, ref, watch, computed } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { http } from "@/config";
import { DEBOUNCE_DELAY_MS } from "@/utils/constants";
import { useThemeStore } from "@/config";
const themeStore = useThemeStore();
const isDark = computed(() => { if (themeStore.theme === 'dark') return true; if (themeStore.theme === 'system') return uni.getSystemInfoSync().theme === 'dark'; return false; });

// 防抖定时器
let suggestDebounceTimer: ReturnType<typeof setTimeout> | null = null;
const SUGGEST_DEBOUNCE_MS = DEBOUNCE_DELAY_MS; 

const props = defineProps<{
    initialMode?: string
}>();

const mode = ref(props.initialMode || ''); // 'add-comment' or empty

// 1. 获取胶囊信息 & 系统信息
const sysInfo = uni.getSystemInfoSync();
// 默认胶囊信息
let menuButtonInfo = { 
    width: 87, 
    height: 32, 
    left: sysInfo.windowWidth - 87 - 10, 
    top: sysInfo.statusBarHeight ? sysInfo.statusBarHeight + 4 : 48, 
    bottom: (sysInfo.statusBarHeight ? sysInfo.statusBarHeight + 4 : 48) + 32, 
    right: sysInfo.windowWidth - 10 
};
try {
    const res = uni.getMenuButtonBoundingClientRect();
    if (res && res.width) {
        menuButtonInfo = {
            width: res.width,
            height: res.height,
            left: res.left,
            top: res.top,
            bottom: res.bottom,
            right: res.right
        };
    }
} catch (e) {}

// 2. 布局常量计算
const NAV_BAR_HEIGHT = menuButtonInfo.bottom + 12; // 胶囊底部 + 间距 = 导航栏高度 (收起态高度)
const EXPANDED_ROW_HEIGHT = 44; // 下方搜索栏的高度
const HEADER_EXPANDED_HEIGHT = NAV_BAR_HEIGHT + EXPANDED_ROW_HEIGHT + 10; // 展开态总高度

// 3. 状态管理
const scrollTop = ref(0);
const isCollapsed = ref(false); // 是否收起
const isFocused = ref(false); // 新增：是否聚焦
const isResultMode = ref(false); // New State: Toggle between Search/Explore and Results
const _resumeGuard = ref(false); // 从详情页返回时的保护标记，防止 onInputFocus 误切模式
const currentSort = ref('default'); // From Result Page
const showProposalsList = ref(false); // New state to toggle proposals

// Import searchText and placeHolder from useInput
const { searchText, placeHolder } = useInput();

// Import useSuggest
import { useSuggest } from "./index";
const { suggestList, suggestContent } = useSuggest(searchText);

// Merge logic from useChoose
import { useChoose } from "@/pages/find/choose/index";
const { keyword: resultKeyword, jump, rows, page, loading, doSearch, filterCampus, filterDepart } = useChoose();

// Add exposed method for parent page to call onShow
const resumeState = () => {
    const savedState = uni.getStorageSync('find_page_state');
    if (savedState && savedState.searchText && savedState.isResultMode) {
        searchText.value = savedState.searchText;
        // 恢复结果模式
        isResultMode.value = true;
        _resumeGuard.value = true; // 设置保护标记，防止 onInputFocus 误切模式
        
        // 如果数据丢失（如页面被重载），重新搜索
        // 增加 forceRefresh 判断
        if (!rows.value || rows.value.length === 0) {
            performSearch(savedState.searchText);
        }
    }
}

// 暴露给父组件
defineExpose({
    resumeState
});

// Restore from Storage on Show (Might not trigger in Component)
// onShow(() => { ... }) // Removed component level onShow to define proper flow from page

const groupedRows = computed(() => {
    const list = rows.value || [];
    return {
        courses: list.filter(item => item.resultType !== 'proposal'),
        proposals: list.filter(item => item.resultType === 'proposal')
    };
});

const toggleProposalsList = () => {
    showProposalsList.value = true;
};

// Local filter panel state
const showFilterPanel = ref(false)
const filterState = reactive({
    campuses: [] as string[],
    types: [] as string[],
    applyMode: 'once'
})

const toggleFilterPanel = () => {
    showFilterPanel.value = !showFilterPanel.value
}

const toggleCampus = (c: string) => {
    const idx = filterState.campuses.indexOf(c)
    if (idx > -1) filterState.campuses.splice(idx, 1)
    else filterState.campuses.push(c)
}

const toggleType = (t: string) => {
    const idx = filterState.types.indexOf(t)
    if (idx > -1) filterState.types.splice(idx, 1)
    else filterState.types.push(t)
}

const setApplyMode = (m: string) => {
    filterState.applyMode = m
}

const resetFilters = () => {
    filterState.campuses = []
    filterState.types = []
    filterState.applyMode = 'once'
}

const applyFilters = () => {
    showFilterPanel.value = false
    // 这里可以触发搜索或重新过滤列表
    // 比如 emit('filter-change', filterState) 或者直接重新调用 doSearch
    // 目前逻辑似乎是动态过滤，所以关闭即可
}

// 4. 动态样式计算
const headerHeight = computed(() => {
    // 增加一点底部间距，避免紧贴胶囊
    return menuButtonInfo.bottom + 12;
});

const refinedSearchBarWrapperStyle = computed(() => {
    const gap = uni.upx2px(32);
    // 右侧留白 = 胶囊区域宽度 (windowWidth - menuButtonInfo.left) + 32rpx 间距
    const paddingRight = (sysInfo.windowWidth - menuButtonInfo.left) + gap;
    
    return {
        // 修改：这里原来似乎有问题，height 设为 headerHeight 会导致它被挤扁如果父容器也是这个高度
        // 其实父容器 dynamic-header 的高度也是 headerHeight
        // wrapper 应该也是这个高度
        height: headerHeight.value + 'px',
        display: 'flex',
        alignItems: 'center', // 修正：垂直居中，而不是 flex-start
        // paddingTop: menuButtonInfo.top + 'px', // 修正：移除 paddingTop，改用 top 定位或 flex 居中
        // 如果用 paddingTop 顶下来，内容高度会被挤压。
        // 我们应该让 search-bar-wrapper 绝对定位或者充满 header
        // 实际上 search-bar-wrapper 已经是 absolute left 0 width 100%。
        // 它的高度完全等于 headerHeight。
        // 它的内容应该位于 menuButton 的水平线上。
        // menuButton 的 top 是已知的。
        // 我们可以让 search-input-box 的 marginTop 等于 menuButton.top
        // 或者更简单的，让 wrapper 顶对齐，paddingTop = menuButton.top, height = bottom + 12
        paddingTop: menuButtonInfo.top + 'px', 
        paddingBottom: '12px', // 底部留白
        paddingLeft: '32rpx', 
        paddingRight: paddingRight + 'px',
        boxSizing: 'border-box'
    };
});

const navBackBtnStyle = computed(() => {
    return {
        height: menuButtonInfo.height + 'px',
        width: menuButtonInfo.height + 'px', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: '12rpx'
    };
});

// 计算 input box 的宽度和位置
const refinedSearchInputBoxStyle = computed((): Record<string, string> => {
    return {
        height: menuButtonInfo.height + 'px',
        flex: '1',
        borderRadius: (menuButtonInfo.height / 2) + 'px',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24rpx',
        border: isFocused.value ? '2rpx solid #c8102e' : '2rpx solid #e0e0e0',
        boxShadow: isFocused.value ? '0 4rpx 12rpx rgba(200, 16, 46, 0.1)' : 'none',
        transition: 'all 0.3s ease',
        boxSizing: 'border-box'
    }
});

const searchBarWrapperStyle = refinedSearchBarWrapperStyle;
const searchInputBoxStyle = refinedSearchInputBoxStyle;

// 5. 滚动监听
const onScroll = (e: any) => {
    // 简单的阈值判定：下滑超过 20px 即收起
    const top = e.detail.scrollTop;
    scrollTop.value = top;
    
    // 防抖或节流可以优化性能，这里简化直接判断
    if (top > 30 && !isCollapsed.value) {
        isCollapsed.value = true;
    } else if (top < 10 && isCollapsed.value) {
        // 只有回到顶部才展开
        isCollapsed.value = false;
    }
};

// 获取搜索历史
const historyList = ref<string[]>([]);
const hotList = ref<{ keyword: string; tag: string }[]>([]);

function fetchSearchHistory() {
    http.SearchController.searchRecentList().then((res: any) => {
        const data = res.data;
        const histories = data?.data?.histories || data?.histories || [];
        historyList.value = histories.map((h: any) => {
            if (typeof h === 'string') return h;
            return h?.query;
        }).filter((h: any) => h && typeof h === 'string');
    }).catch((err: any) => {
        console.error('[find] fetchSearchHistory error:', err);
    });
}

// 获取猜你想搜的推荐（从搜索建议 API 获取）
function fetchHotRecommendations() {
    // 使用默认热门关键词获取推荐
    const defaultKeywords = ['课程', '老师', '必修', '选修'];
    const recommendations: { keyword: string; tag: string }[] = [];

    Promise.all(defaultKeywords.map(keyword =>
        http.SearchController.searchSuggestList({ keyword })
            .then((res: any) => res?.data?.data?.suggestions || [])
            .catch(() => [])
    )).then(results => {
        results.forEach((suggestions: any[]) => {
            if (Array.isArray(suggestions)) {
                suggestions.slice(0, 2).forEach((item: any) => {
                    if (item?.name && !recommendations.find(r => r.keyword === item.name)) {
                        recommendations.push({ keyword: item.name, tag: item.type === 'course' ? '课程' : '教师' });
                    }
                });
            }
        });
        // Use API results if available, even if less than 3
        if (recommendations.length > 0) {
            hotList.value = recommendations;
        } else {
            // Only use fallback if API returned nothing
            hotList.value = [
                { keyword: '西方哲学智慧', tag: '高分课程' },
                { keyword: '王老师', tag: '热门老师' },
                { keyword: '大学物理', tag: '挂科重灾区' },
            ];
        }
    }).catch(() => {
        // Only use fallback if API call failed
        hotList.value = [
            { keyword: '西方哲学智慧', tag: '高分课程' },
            { keyword: '王老师', tag: '热门老师' },
            { keyword: '大学物理', tag: '挂科重灾区' },
        ];
    });
}

onMounted(() => {
    fetchSearchHistory();
    fetchHotRecommendations();
});

// 方法定义
const goBack = () => {
    // If in result mode, go back to explore mode
    if (isResultMode.value) {
        isResultMode.value = false;
        // searchText.value = ''; // Keep text to allow refinement
        uni.removeStorageSync('find_page_state'); // Clear stored state
        return;
    }

    // Check back size
    const pages = getCurrentPages();
    if (pages.length > 1) {
        uni.navigateBack();
    } else {
        // 如果没有上一页（例如分享卡片进入或刷新后），则重定向到首页
        uni.reLaunch({
            url: '/pages/layout/main'
        });
    }
};

const handleSearch = () => {
    isFocused.value = false; // Hide focus ring on search
    performSearch(searchText.value);
};

// Clear Search Logic Update
const clearSearch = () => {
    searchText.value = '';
    isResultMode.value = false; // Return to explore mode
    uni.removeStorageSync('find_page_state'); // Clear stored state
    // Focus optional - actually we might want to focus input
    // so user can type immediately
};

const onInputFocus = () => {
    isFocused.value = true;
    // 如果刚从详情页返回，保护标记生效，不要切走结果模式
    if (_resumeGuard.value) {
        _resumeGuard.value = false;
        return;
    }
    if (isResultMode.value) {
        // Exit result mode to show History/Suggestions
        isResultMode.value = false;
        // The text remains in the box so suggestList will likely show
    }
};

// 用户输入时触发模糊搜索建议（带防抖）
const onInputChange = () => {
    if (suggestDebounceTimer) {
        clearTimeout(suggestDebounceTimer);
    }
    suggestDebounceTimer = setTimeout(() => {
        if (searchText.value && searchText.value.length > 0) {
            if (isResultMode.value) {
                isResultMode.value = false;
            }
            suggestContent(0);
        }
    }, SUGGEST_DEBOUNCE_MS);
};

// 提取通用搜索逻辑，允许传入特定关键词而不改变输入框内容
const performSearch = (keyword: string) => {
    if (!keyword) return;
    
    // Close toggles from previous search
    showProposalsList.value = false;
    
    // 1. Add History
    if (!historyList.value.includes(keyword)) {
        historyList.value.unshift(keyword);
    }
    
    // 2. Switch to Result Mode
    isResultMode.value = true;
    searchText.value = keyword; // Sync input
    
    // 3. Reset Pagination & List
    page.value = 1;
    // rows.value = []; // Clear previous results to trigger loading state or avoid ghostly items
    // If rows is from useChoose, it might be readonly or we might need to reset via store or method if rows is ref.
    // Assuming rows is ref from useChoose.
    if (rows && rows.value) rows.value = []; 
    
    // 4. Trigger Search Logic
    // 这里调用的是 useChoose 里的 doSearch，它是真实 API 调用
    // 确保把关键词传进去
    if(resultKeyword && resultKeyword.value !== undefined) {
         resultKeyword.value = keyword; 
    }
    if (typeof doSearch === 'function') {
        doSearch(true); // true means refresh/reset
    } else {
        console.error("doSearch is not a function");
    }
};

// 清空历史记录
const clearHistory = () => {
    historyList.value = [];
};

// 排序方式切换
const changeSort = (sortType: string) => {
    if (currentSort.value === sortType) return;
    currentSort.value = sortType;
    page.value = 1;
    doSearch(true, sortType);
};

// 滚动到底部加载更多
const handleScrollBottom = () => {
    if (isResultMode.value) {
        page.value++;
        doSearch(false, currentSort.value);
    }
};

// 跳转到提议页面
const goToProposal = () => {
    uni.navigateTo({
        url: '/pages/proposal/propose/propose' 
    });
};

// 提议卡片点击
const clickProposal = (proposal: any) => {
    const dataStr = encodeURIComponent(JSON.stringify(proposal));
    // 强制跳转到 course/proposal-detail
    uni.navigateTo({
        url: `/pages/course/proposal-detail/index?data=${dataStr}`,
        fail: (err) => {
            console.error('[FindPage] Jump to proposal failed:', err);
        }
    });
};

/* 
  Debug: onResultClick 里的 item 结构是什么样的？
  如果 item 是 { type: 'proposal', ... } 那就能跳对。
  如果 item 是 { resultType: 'proposal', ... } 呢？
  之前代码写的是 item.type === 'proposal'
*/
const onResultClick = (item: any) => {
    // 兼容多种可能的字段名
    if (item.type === 'proposal' || item.resultType === 'proposal' || item.voteCount !== undefined) {
         clickProposal(item);
    } else {
         clickCourse(item);
    }
};

// 课程卡片点击
const clickCourse = (course: any) => {
    // 保存当前状态
    uni.setStorageSync('find_page_state', {
         searchText: searchText.value,
         isResultMode: true
    });

    if (mode.value === 'add-comment') {
        uni.navigateTo({
            url: `/pages/course/comment/index?id=${course.id}`
        });
        return;
    }

    // useChoose.jump expects the full item (to inspect resultType etc.)
    jump(course);
};

// 组件挂载后，检查是否有存储的搜索状态
onShow(() => {
    // 检查是否有存储的搜索状态
    const savedState = uni.getStorageSync('find_page_state');
    if (savedState && savedState.searchText) {
        searchText.value = savedState.searchText;
        // 恢复结果模式
        isResultMode.value = true;
        _resumeGuard.value = true; // 设置保护标记，防止 onInputFocus 误切模式
        
        // 可选：如果不希望每次回来都重新搜索，可以不调用 performSearch
        // 但如果不调用，列表可能是空的（因为页面被销毁了？）
        // 如果 find 页面作为 TabBar 页面，组件可能并未销毁，状态还在
        // 但如果从详情页返回，onShow 会触发
        // 如果 rows 还在，就不需要重新搜索
        if ((!rows.value || rows.value.length === 0) && searchText.value) {
            performSearch(searchText.value);
        }
    }
});

// 点击历史记录
const clickHistory = (tag: string) => {
    searchText.value = tag; // 先设置 input
    performSearch(tag); 
};

// 点击推荐词
const clickRecommend = (keyword: string) => {
    searchText.value = keyword;
    performSearch(keyword); 
}

// 处理建议项点击
const handleSuggestClick = (item: any) => {
    searchText.value = item.name;
    performSearch(item.name);
};
</script>

<style scoped lang="scss">
$brand-red: #c8102e;

.find-container {
  height: 100vh;
  background-color: var(--bg-primary);
  display: flex;
  flex-direction: column;
}

// 动态 Header
.dynamic-header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 100;
    background-color: var(--bg-secondary);
    box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    
    &.is-collapsed {
        background-color: rgba(247, 248, 250, 0.98);
        box-shadow: 0 1rpx 0 rgba(0,0,0,0.05);
    }
}

// 搜索栏容器 wrapper
.search-bar-wrapper {
    position: absolute;
    left: 0;
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding-left: 32rpx;
    box-sizing: border-box;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
    z-index: 101; /* Ensure above filter bar */
    
    .nav-back-btn {
        width: 32rpx;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 32rpx;
    }

    .search-input-box {
        flex: 1;
        min-width: 0;
background-color: var(--bg-secondary);
        display: flex;
        align-items: center;
        padding: 0 20rpx;
        border: 1rpx solid var(--border-color);
        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
        box-shadow: 0 2rpx 8rpx var(--shadow-color); 
        
        .search-icon {
            width: 32rpx;
            height: 32rpx;
            margin-right: 16rpx;
            opacity: 0.5;
        }
        
        .search-input {
            flex: 1;
            font-size: 28rpx;
            color: var(--text-primary);
            height: 100%;
        }
        
        .clear-icon {
            width: 36rpx;
            height: 36rpx;
            background-color: var(--bg-tertiary);
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-left: 10rpx;
            
            .clear-text {
                color: var(--text-muted);
                font-size: 28rpx;
                line-height: 1;
                margin-top: -4rpx;
                font-weight: bold;
            }
        }
    }
}

.search-guide-banner {
    position: absolute;
    left: 0; 
    right: 0;
    height: 30px;
    background-color: #fffbe6;
    color: #d48806;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;
    z-index: 90;
}

// 内容区域
.content-scroll {
    flex: 1;
    // paddingTop dynamic
    box-sizing: border-box;
}

.empty-section {
    padding: 40rpx;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;
    
    .section-title {
        font-size: 32rpx;
        font-weight: 700;
        color: var(--text-primary);
    }
    
    .clear-history {
        font-size: 28rpx;
        color: var(--text-muted);
        padding: 10rpx;
    }
}

.history-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
    
    .tag-item {
        padding: 12rpx 30rpx;
        background-color: var(--bg-secondary);
        border-radius: 30rpx;
        font-size: 26rpx;
        color: var(--text-secondary);
        border: 1rpx solid transparent;
        transition: all 0.2s;
        
        &.active {
            background-color: #fff0f0; /* 浅红背景 */
            color: #ff4d4f; /* 品牌红字 */
            border-color: #ff4d4f;
            font-weight: 500;
        }
        
        &:active {
            opacity: 0.8;
        }
    }
    
    .no-history {
        color: var(--text-muted);
        font-size: 26rpx;
        width: 100%;
        text-align: center;
        padding: 40rpx 0;
    }
}

.recommend-list {
    background-color: var(--bg-secondary);
    border-radius: 24rpx;
    padding: 0;
    overflow: hidden;
    box-shadow: 0 4rpx 16rpx var(--shadow-color); 
    
    .recommend-item {
        display: flex;
        align-items: center;
        padding: 24rpx 30rpx;
        border-bottom: 1rpx solid var(--border-color);
        
        &:last-child {
            border-bottom: none;
        }
        
        .recommend-icon {
            margin-right: 20rpx;
            display: flex;
            align-items: center;
            
            .mini-icon {
                width: 32rpx;
                height: 32rpx;
                opacity: 0.4;
            }
        }
        
        .recommend-word {
            flex: 1;
            font-size: 30rpx;
            color: var(--text-primary);
        }
        
        .recommend-tag {
            font-size: 22rpx;
            color: var(--text-muted);
            background-color: var(--bg-tertiary);
            padding: 4rpx 12rpx;
            border-radius: 8rpx;
        }
    }
}

.suggest-section {
    margin: 20rpx 30rpx;
    border-radius: 24rpx;
    overflow: hidden;
    background-color: #ffffff;
    box-shadow: 0 4rpx 16rpx var(--shadow-color);

    .suggest-item {
        display: flex;
        align-items: center;
        padding: 30rpx 40rpx;
        background-color: var(--bg-secondary);
        border-bottom: 1rpx solid var(--border-color);
        
        &:last-child { border-bottom: none; }
        
        .item-icon-wrapper {
            margin-right: 24rpx;
            display: flex;
            align-items: center;
        }
        
        .item-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            .item-name {
                font-size: 30rpx;
                color: var(--text-primary);
                margin-bottom: 6rpx;
            }
        }
        
        .item-arrow {
            color: var(--text-muted);
            font-size: 28rpx;
        }
    }
}

.placeholder-style { color: var(--text-muted); }

/* Result Section Layout */
.result-section {
    padding: 0 32rpx 40rpx 32rpx; // Add padding to container
}

.list-content {
    display: flex;
    flex-direction: column;
    gap: 30rpx; // Add space between sections
}

.group-section {
    margin-bottom: 20rpx;
    margin-top: 10rpx; // 增加顶部间距
    
    .group-title {
        font-size: 28rpx;
        color: var(--text-muted);
        margin-bottom: 20rpx;
        margin-left: 8rpx;
        font-weight: 500;
        display: flex;
        align-items: center;
        
        &::before {
            content: '';
            display: block;
            width: 6rpx;
            height: 24rpx;
            background-color: $brand-red;
            margin-right: 12rpx;
            border-radius: 3rpx;
        }
    }
}

.result-card {
    margin-bottom: 24rpx; /* Card spacing */
}

/* Card Wrapper Styles inside result-card if needed, but actually choose-course is the card.
   Wait, in template:
   <view class="result-card-wrapper course-card">
       <choose-course ... />
       ... tags ...
   </view>
   
   So we need to style .result-card-wrapper
*/

.result-card-wrapper {
    background-color: var(--bg-secondary);
    border-radius: 24rpx;
    padding: 24rpx;
    position: relative;
    box-shadow: 0 4rpx 16rpx var(--shadow-color);
    transition: all 0.2s;
    
    &:active {
        transform: scale(0.995);
        box-shadow: 0 2rpx 8rpx var(--shadow-color);
    }

    &.course-card {
        border-right: 1rpx solid rgba(0,0,0,0.02);
        border-bottom: 1rpx solid rgba(0,0,0,0.02);
    }
    
    &.proposal-card {
        background: linear-gradient(135deg, #ffffff 0%, #fff7f7 100%);
        border: 1rpx solid rgba(255, 77, 79, 0.1);
        
        .result-type-tag.proposal {
            background-color: rgba(255, 77, 79, 0.1);
            color: #ff4d4f;
        }
    }
    
    /* Type Tags */
    .result-type-tag {
        position: absolute;
        top: 24rpx;
        right: 24rpx;
        font-size: 20rpx;
        padding: 4rpx 12rpx;
        border-radius: 8rpx;
        z-index: 10;
        
        &.course {
            right: auto;
            left: 24rpx; /* Course tag on top-left or handled by component? 
               Wait, choose-course layout might conflict.
               Let's leave it absolute top right.
            */
            display: none; // Hiding "Course" tag as it's default
        }
        
        &.proposal {
            background-color: #fff0f0;
            color: #ff4d4f;
            right: 24rpx;
            top: 24rpx;
        }
        
        &.campus {
            top: auto;
            bottom: 24rpx;
            right: 24rpx;
            background-color: var(--bg-tertiary);
            color: var(--text-muted);
        }
    }
}

/* New Card Style */
.new-card-wrapper {
   /* ... */
   height: 100%;
}
.new-card-content {
    display: flex;
    align-items: center;
    
    .new-card-icon {
        width: 80rpx;
        height: 80rpx;
        background-color: $brand-red;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 24rpx;
        box-shadow: 0 8rpx 16rpx rgba(200, 16, 46, 0.2);
    }
    
    .new-card-text {
        flex: 1;
        display: flex;
        flex-direction: column;
        
        .new-title {
            font-size: 30rpx;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 8rpx;
        }
        
        .new-sub {
            font-size: 24rpx;
            color: var(--text-muted);
        }
    }
}

.bottom {
    text-align: center;
    font-size: 24rpx;
    color: var(--text-muted);
    padding: 30rpx 0;
}

// 筛选 Bar
.filter-bar-wrapper {
    position: fixed; 
    left: 0;
    width: 100%;
    z-index: 99;
    /* top dynamically set */
}

.filter-bar {
    display: flex;
    height: 44px; /* Approx 88rpx */
    align-items: center;
    justify-content: space-around;
    background: var(--bg-secondary);
    border-top: 1rpx solid var(--border-color);
    box-shadow: 0 4rpx 8rpx var(--shadow-color);

    .filter-item {
        font-size: 28rpx;
        color: var(--text-secondary);
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        flex: 1;

        &.active {
            color: $brand-red;
            font-weight: 600;

            &::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 32rpx;
                height: 4rpx;
                background-color: $brand-red;
                border-radius: 2rpx;
            }
        }
    }
    
    .filter-action {
        display: flex;
        align-items: center;
        gap: 8rpx;
        padding: 0 30rpx; 
        font-size: 28rpx;
        color: var(--text-primary);
        font-weight: 500;
        border-left: 1rpx solid var(--border-color);
        height: 50%;
    }
}

/* Filter Dropdown Styles */
.filter-bar-wrapper {
    /* Ensure z-index is high enough for mask to cover content but low enough? 
       Actually, if mask is inside wrapper, wrapper needs to allow overflow visible?
       No, fixed position wrapper usually has defined height or auto.
    */
    position: fixed;
    /* overflow: visible; Important for dropdown */
}

.mask-overlay {
    position: fixed; /* Relative to viewport */
    /* Top will be calculated dynamically via style binding or rigid css if header is fixed height */
    /* top: calc(headerHeight + 44px);  handled inline or via computed */
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.4); /* Mask color */
    z-index: 10; /* Lower z-index: just above content (usually z-index 0 or 1) */
    backdrop-filter: blur(2px);
    animation: fadeIn 0.2s ease-out;
}

.dropdown-panel {
    background-color: var(--bg-secondary);
    width: 100%;
    /* max-height: 60vh; */ /* Use content height */
    display: flex;
    flex-direction: column;
    border-radius: 0 0 32rpx 32rpx; /* Increased radius */
    animation: slideDown 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    box-shadow: 0 12rpx 32rpx var(--shadow-color); /* More refined shadow */
    overflow: hidden; /* Ensure content doesn't bleed */
}

.dropdown-scroll-content {
    padding: 30rpx 32rpx; /* Use standard spacing */
    max-height: 50vh; 
    box-sizing: border-box;
    background-color: var(--bg-secondary);
}

.dropdown-footer {
    display: flex;
    justify-content: space-between;
    gap: 24rpx; /* Use gap property */
    padding: 24rpx 32rpx 40rpx; /* More bottom padding for aesthetics */
    border-top: 1rpx solid var(--border-color);
    background-color: var(--bg-secondary);
    
    .btn-common {
        flex: 1; /* Equal width */
        font-size: 30rpx; /* Larger font */
        font-weight: 500;
        height: 84rpx; /* Taller buttons */
        line-height: 84rpx;
        border-radius: 42rpx; /* Fully rounded */
        margin: 0;
        transition: opacity 0.2s;
        
        &::after { border: none; }
        
        &:active { opacity: 0.9; }
    }

    .btn-reset {
        background-color: var(--bg-primary);
        color: var(--text-secondary);
    }
    
    .btn-confirm {
        background-color: #c8102e; /* Brand Red */
        color: #fff;
        box-shadow: 0 6rpx 16rpx rgba(200, 16, 46, 0.25); /* Styled shadow */
    }
}

.show-proposals-tip {
    margin: 30rpx 24rpx;
    padding: 30rpx;
    background: linear-gradient(135deg, #fff5f5 0%, #fff 100%);
    border-radius: 16rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 4rpx 16rpx rgba(200, 16, 46, 0.08); /* 微微得红色阴影 */
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    
    &:active {
        transform: scale(0.98);
        box-shadow: 0 2rpx 8rpx rgba(200, 16, 46, 0.05);
    }
}

.show-proposals-tip text {
    font-size: 28rpx;
    color: #c8102e; /* 配合背景变为主色调字体 */
    font-weight: 500;
    line-height: 1.4;
    flex: 1;
}

.show-proposals-tip .tip-arrow {
    width: 32rpx;
    height: 32rpx;
    transform: rotate(180deg); /* 因为go-back 是向左的，所以转180度指向右 */
    margin-left: 20rpx;
    opacity: 0.6;
}

.still-nothing-tip {
    text-align: center;
    font-size: 24rpx;
    color: var(--text-muted);
    margin-bottom: 24rpx;
    margin-top: 0; /* Changed from 20rpx top margin to completely remove blank space above "still nothing?" tip */
}

.filter-group {
    margin-bottom: 40rpx;
    &:last-child { margin-bottom: 10rpx; }
    
    .group-title {
        font-size: 28rpx;
        color: var(--text-primary); /* Darker title text */
        font-weight: 600; /* Bolder */
        margin-bottom: 24rpx;
        display: block;
    }
}

.tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
}

.filter-tag {
    padding: 14rpx 36rpx;
    background-color: var(--bg-primary);
    color: var(--text-secondary);
    border-radius: 12rpx; /* Rounded rectangles instead of capsules */
    font-size: 26rpx;
    border: 1px solid transparent;
    transition: all 0.2s;
    
    &.active {
        background-color: rgba(200, 16, 46, 0.08); /* light red tint */
        color: $brand-red;
        border: 1px solid $brand-red;
        font-weight: 500;
    }
}
</style>