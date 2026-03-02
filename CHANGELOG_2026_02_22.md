# Meowpick 小程序修改记录文档

本文档详细记录了 Meowpick 小程序（Meowpick-Frontend-feat-proposal）相对于初始版本进行的所有代码修改、UI 重构及逻辑调整。旨在通过本文档能够复刻当前版本的状态。

## 1. 全局样式与组件修改

### 1.1 返回按钮 (`src/components/common/BackBtn.vue`)
**目标**：优化返回按钮样式，使其更加精致且符合主题色。
*   **修改内容**：
    *   去除了原有的伪元素渐变实现。
    *   使用 CSS `border` 绘制箭头。
    *   **样式参数**：
        *   颜色：主题红 (`#c8102e`)
        *   粗细：`4.5rpx`
        *   尺寸：`22rpx` × `22rpx`
        *   圆角：`4rpx`
        *   位置：`margin-left: 2rpx` (向左微调)

---

## 2. 核心业务组件修改

### 2.1 课程/提议卡片 (`src/components/choose/choose-course/index.vue`)
**目标**：重构列表卡片，支持“提议新增”类型的展示，并统一课程卡片的视觉风格。

#### 2.1.1 结构调整
*   **Template逻辑**：
    *   最外层容器 `search-result-box` 的背景色设为透明，移除动态类名绑定（避免双重Padding）。
    *   引入 `isProposal` 计算属性判断数据类型。
    *   **提议卡片 (Proposal Card)**：
        *   包含：顶部（课程名）、中部（教师/学院信息）、底部（左侧“提议新增”标签，右侧投票数）。
    *   **课程卡片 (Course Card)**：
        *   重构为与提议卡片一致的三段式结构。
        *   包含：顶部（课程名+分类标签）、中部（教师列表+学院）、底部（标签列表+描述）。

#### 2.1.2 样式调整 (`<style scoped>`)
*   **通用**：
    *   统一了 `.proposal-card` 和 `.search-result` 的 `border-radius: 16rpx`, `box-shadow`, `padding: 24rpx`。
    *   课程描述 (`.desc`) 限制为 2 行省略。
*   **提议卡片 (`.proposal-card`)**：
    *   **背景**：线性渐变 `linear-gradient(145deg, #ffffff 0%, #fff5f6 100%)` (微红白色)。
    *   **字体**：标题加粗，字号 `32rpx`。
*   **课程卡片 (`.search-result`)**：
    *   **背景**：纯白 `#ffffff`。
    *   **标签**：改为清爽的边框风格 (`border: 1px solid #ffebeb`, 背景 `#fffcfc`)。
    *   移除了原本的圆点分隔符，改用 Icon 图标（`@/images/teacher-icon.png`, `@/images/depart-icon.png`）。

#### 2.1.3 TypeScript逻辑
*   扩展 Type `MixedResult`，增加字段：
    *   `teacherName`, `voteCount`, `agreeCount`, `proposalReason`, `resultType`.

---

## 3. 页面逻辑与数据 Mock 修改

### 3.1 发现/选课页逻辑 (`src/pages/find/choose/index.ts`)
**目标**：在搜索结果中混合展示“课程”和“提议”。
*   **Mock 数据更新**：
    *   修改 `list.value` 的模拟数据填充逻辑。
    *   **新增提议数据**：
        *   Example: `{ id: 'proposal-1', resultType: 'proposal', name: '深度学习进阶', teacherName: '李教授', department: '计算机学院', agreeCount: 45, ... }`
    *   **清洗数据**：移除了原模拟数据中课程名称自带的 `【提议新增】` 前缀字符串，由 UI 标签负责展示。
    *   **普通课程数据**：保留 `resultType: 'course'`。

### 3.2 提议列表页 (`src/pages/proposal/list/list.vue`)
**目标**：更新列表页的 Mock 数据以匹配新需求（虽然主要交互主要发生在选课搜索页，但此页数据也做了同步）。
*   **修改内容**：
    *   更新了 `proposals` 数组的模拟对象，包含更详细的课程信息与投票数。

### 3.3 初始化逻辑 (`src/utils/init.ts`)
**目标**：绕过后端登录限制，允许前端独立开发调试。
*   **修改内容**：
    *   在 `Init` 函数中增加了 `setTimeout` 模拟登录成功。
    *   调用 `uni.hideLoading()` 和 `uni.reLaunch({ url: '/pages/home/home' })` 自动跳转至首页。
    *   **状态**：*注意，此文件曾因语法错误导致编译失败，后已修复（补充了缺失的闭合括号）。*

---

## 4. 资源引用
*   **图标使用**：
    *   `@/images/teacher-icon.png` (教师)
    *   `@/images/depart-icon.png` (学院)
    *   `@/images/like_active.png` (投票/点赞)
    *   `@/images/add_white.png` (虽引入但最终设计可能未使用或仅作为备选)

## 5. 复刻步骤摘要
1.  **替换 BackBtn 组件**：用新版 CSS 边框重写逻辑替换原文件。
2.  **替换 Course/Proposal 卡片组件**：用上述三段式布局代码替换 `choose-course/index.vue`。
3.  **注入 Mock 数据**：在 `find/choose/index.ts` 中注入混合类型的 Mock 列表。
4.  **应用 Login Bypass**：修改 `init.ts` 解除登录鉴权阻塞。

---
*文档生成时间：2026年2月22日*
