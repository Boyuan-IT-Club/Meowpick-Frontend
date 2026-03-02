# Meowpick 小程序全量修改复刻文档 (完整版)

**文档目标**：本文档记录了从项目初始状态到当前最终状态的所有代码变更。按照此文档操作，可将原版小程序复刻为当前的演示版本。

注意：本文档不仅包含本次会话中进行的（UI重构、逻辑调整）修改，还包含近期历史修改记录。

---

## 一、 基础设施与工具类修改

### 1.1 绕过后端登录鉴权
**文件**：`src/utils/init.ts`
**目的**：解决开发环境下无后端导致的无法进入主页问题。
**修改内容**：
在 `Init` 函数中增加 Mock 登录逻辑：
```typescript
export function Init() {
  uni.showLoading({ title: "初始化中" });
  
  // [新增] 模拟登录绕过逻辑
  setTimeout(() => {
     uni.hideLoading();
     console.log('Mock Login Bypass');
     // 检查页面栈，避免重复跳转
     const pages = getCurrentPages();
     if (pages.length > 0 && pages[pages.length-1].route === 'pages/home/home') {
         return;
     }
     console.log("Mock login triggered, re-launching home");
     uni.reLaunch({
         url: '/pages/home/home'
     });
  }, 1000);
}
```

---

## 二、 公共组件修改

### 2.1 返回按钮重塑
**文件**：`src/components/common/BackBtn.vue`
**目的**：将原本可能基于图片或粗糙样式的返回按钮，改为 CSS 绘制的精致红色箭头。
**核心代码变更**：
*   **Template**：保持简洁 `<view class="css-back-arrow"></view>`。
*   **Style**：
    ```css
    .css-back-arrow {
        width: 22rpx; 
        height: 22rpx;
        transform: rotate(45deg);
        /* 核心修改：使用边框绘制箭头，位置微调 */
        margin-left: 2rpx; 
        border-bottom: 4.5rpx solid #c8102e; /* 主题红，加粗 */
        border-left: 4.5rpx solid #c8102e;   
        border-radius: 4rpx; /* 圆角优化 */
    }
    /* 移除所有伪元素 (:before/:after) 实现 */
    ```

---

## 三、 核心业务页面：发现/选课 (`Find` 模块)

### 3.1 混合搜索数据逻辑
**文件**：`src/pages/find/choose/index.ts`
**目的**：让搜索结果同时展示“正式课程”和“新增提议”。
**修改内容**：
1.  **Mock 数据结构增强**：
    *   在 `list.value` 中注入 `resultType: 'proposal'` 的数据项。
    *   在 `list.value` 中注入 `resultType: 'course'` 的数据项。
2.  **字段清洗**：
    *   移除 Mock 数据中 `name` 字段里的 `【提议新增】` 前缀字符串（由 UI 组件负责展示）。
    *   为 Mock 数据补充 `teacherName`、`department`、`agreeCount` (票数)、`category` (分类) 等字段。

### 3.2 筛选与入口 UI
**文件**：`src/pages/find/choose/index.vue`
**修改内容**：
1.  **新增入口**：在搜索栏或页面显著位置增加“新增提议”按钮（具体实现视 `index.vue` 最终布局而定）。
2.  **筛选栏优化**：
    *   修复下拉菜单（Dropdown）的层级 (`z-index`) 问题，确保不被列表遮挡。
    *   确保筛选条件（校区/学院）能正确触发（逻辑层）。

---

## 四、 核心组件：列表卡片重构 (重点)

**文件**：`src/components/business/course/CourseCard.vue` (原路径 `src/components/choose/choose-course/index.vue`)
*注意：在最近的重构中，原 `choose-course/index.vue` 可能已被移动或重命名为 `CourseCard.vue`，或者您在复刻时应注意文件路径的一致性。本文档基于最终生效的卡片代码。*

**目的**：将原本单一的课程卡片，重构为支持“课程/提议”双模式，并统一视觉风格为“三段式”布局。

### 4.1 逻辑层 (`<script>`)
1.  **Type 定义**：
    ```typescript
    type MixedResult = CourseVO & {
      resultType?: string; // 区分类型
      teacherName?: string;
      voteCount?: number;
      agreeCount?: number;
      proposalReason?: string;
      // ...其他字段
    };
    ```
2.  **计算属性**：增加 `isProposal` 判断当前卡片类型。
3.  **工具函数**：`getTop3List` 用于处理标签显示。

### 4.2 结构层 (`<template>`)
**统一采用三段式布局**：
*   **容器**：外层 `div.search-result-box` (无特定样式，仅作为容器)。
*   **内容**：
    *   **模式 A：提议卡片 (`v-if="isProposal"`)**
        *   **Top**: 课程名称。
        *   **Middle**: 教师图标+姓名 | 学院图标+学院名。
        *   **Bottom**: 左侧“提议新增”标签 | 右侧 票数展示 (Icon + 数字)。
    *   **模式 B：课程卡片 (`v-else`)**
        *   **Top**: 课程名称 (限2行) + 分类标签 (如“工学”)。
        *   **Middle**: 教师图标+姓名列表 | 学院图标+学院名。
        *   **Bottom**: 标签列表 (Emoji + 文字) + 描述文本。

### 4.3 样式层 (`<style>`)
**风格统一化**：
1.  **容器复位**：
    *   `.search-result-box` 背景设为 `transparent`，移除动态 class 绑定。
2.  **提议卡片 (`.proposal-card`)**：
    *   背景：`linear-gradient(145deg, #ffffff 0%, #fff5f6 100%)` (红白渐变)。
    *   边框/阴影：`border-radius: 16rpx`, `box-shadow`。
    *   Padding：`24rpx`。
3.  **课程卡片 (`.search-result`)**：
    *   背景：`#ffffff` (纯白)。
    *   边框/阴影/Padding：与提议卡片完全一致。
    *   **细节**：
        *   标签样式：`.tag-item` 使用 `border: 1px solid #ffebeb`，背景 `#fffcfc`。
        *   分隔符：移除原来的圆点 (`.circle`)，改用图标区分信息。

---

## 五、 提议列表页修正

### 5.1 列表数据同步
**文件**：`src/pages/proposal/list/list.vue`
**修改内容**：
*   同步更新了该页面的 `proposals` Mock 数据结构，去除名称中的前缀，确保全站数据展示逻辑一致。

---

## 六、 资源引用
*   **图标使用**：
    *   `src/images/teacher-icon.png` (教师)
    *   `src/components/images/depart-icon.png` (学院) - *需确认路径*
    *   `src/images/like_active.png` (投票/点赞)

---

## 七、 历史与关联修改 (Recent History)
以下文件也在近期被修改，如果您的原版代码较旧，可能也需要关注：
*   `src/components/find/index.vue`: 更新了组件逻辑（可能涉及筛选或展示）。
*   `src/pages/proposal/detail/index.vue`: 提议详情页逻辑更新。
*   `src/pages/proposal/propose/propose.vue`: 提议发起页逻辑更新。
*   `src/pages/course/comment/index.vue`: 课程评论逻辑更新。
*   `src/pages/home/update-log.vue`, `src/pages/home/letter.vue`: 首页相关组件更新。
*   `src/pages.json`: 可能涉及页面路由配置的变动。

---

## 八、 复刻操作指南

如果您拿到了最原版的代码，请按以下顺序操作：

1.  **对比文件差异**：重点关注上述列出的核心文件。
2.  **覆盖/合并代码**：
    *   **必选项**：`init.ts` (登录), `BackBtn.vue` (UI), `choose/index.ts` & `index.vue` (搜索逻辑), `CourseCard.vue` (卡片样式)。
    *   **建议项**：`proposal/list.vue` 以及第七点中提及的其他近期修改文件，以确保整个应用的一致性。

