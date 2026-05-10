// API Pagination Constants
export const DEFAULT_PAGE_SIZE = 20;
export const SEARCH_PAGE_SIZE = 10;
export const TEACHER_SEARCH_PAGE_SIZE = 5;
export const MY_COMMENTS_PAGE_SIZE = 5;
export const HISTORY_PAGE_SIZE = 50;

// UI Constants
export const DEBOUNCE_DELAY_MS = 300;
export const TOAST_DURATION_MS = 1500;
export const COLLAPSE_SCROLL_THRESHOLD = 30;
export const EXPAND_SCROLL_THRESHOLD = 10;
export const MAX_HISTORY_SIZE = 50;
export const EXPANDED_ROW_HEIGHT = 44; // 下方搜索栏的高度
export const HEADER_EXPANDED_PADDING = 10; // 展开态额外高度

// Sort Types
export const SORT_DEFAULT = 'default';
export const SORT_HOT = 'hot';
export const SORT_TIME = 'time';

// Comment Target Type
export const TARGET_TYPE_COMMENT = '2';
export const TARGET_TYPE_PROPOSAL = '1';

// API Default Constants
export const PROPOSAL_PAGE_SIZE_DEFAULT = 10;
export const PROPOSAL_FIELD_PAGE_SIZE_DEFAULT = 10;
export const ADMIN_LOG_PAGE_SIZE_DEFAULT = 20;

// Hot Recommendations
export const DEFAULT_HOT_RECOMMENDATIONS = [
    { keyword: '西方哲学智慧', tag: '高分课程' },
    { keyword: '王老师', tag: '热门老师' },
    { keyword: '大学物理', tag: '挂科重灾区' },
] as const;