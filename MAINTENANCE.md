# Meowpick 开发维护参考手册

> 本文档是 Meowpick 前端项目的核心维护文档，包含项目背景、已验证的最佳实践、常见模式模板。
> 面向读者：AI Agent / 后续维护开发者
> 最后更新：2026-05-25

---

## 📌 项目概述

**Meowpick（喵选）** - 华东师范大学学生自主组建的选课信息聚合微信小程序。

**两个核心闭环**：
1. **吐槽/评论闭环**：学生对已有课程发表评价（表情标签 + 文字）
2. **提议闭环**：学生对未收录课程发起提议，其他用户可投票支持/反对

**技术栈**：
- uni-app (Vue 3) + TypeScript + Vite
- SCSS + Tailwind CSS + NutUI
- Pinia + pinia-plugin-unistorage
- Axios + uniapp-axios-adapter
- 包管理器：**yarn**（禁止使用 npm）

**构建目标**：微信小程序 (mp-weixin)

---

## 📁 相关文档索引

项目根目录 `/home/i/MeowpickbyHAppy/` 下包含以下重要文件：

| 文件 | 说明 |
|------|------|
| `AGENTS.md` | AI Agent 操作指令（包含技术栈、目录结构、构建命令） |
| `LOGIC_MANUAL.md` | 产品逻辑说明（页面导航、搜索模式、提议流程、标签系统） |
| `DOC_BACKEND_REQUIREMENTS.md` | 后端接口需求文档（提议系统 CRUD、数据结构要求） |
| `BACKEND_REQUIREMENTS.md` | 后端需求概述 |
| `docs/index.md` | 自动生成的文档索引（架构评审、API 评审、UX 评审等） |
| `docs/frontend-architecture-*.md` | 前端架构评审记录 |
| `1.md` | 原始需求文档（产品汪的第一版需求） |
| `Meowpick-Frontend/` | 前端代码仓库（git 管理） |
| `swagger.json` | API 契约文件（位于 `Meowpick-Frontend/src/swagger.json`） |

---

## 🏗️ 目录结构

```
Meowpick-Frontend/
├── src/
│   ├── api/                    # ⚠️ 自动生成，禁止手动编辑
│   │   ├── http-client.ts     # Axios 客户端（含请求/响应拦截器）
│   │   └── data-contracts.ts # TypeScript 类型定义
│   ├── components/             # Vue 组件（unplugin-vue-components 自动导入）
│   │   ├── home-view/         # 首页组件
│   │   ├── find/              # 搜索组件
│   │   ├── profile-view/      # "我的"页面组件
│   │   └── common/            # 通用组件（如 BackBtn）
│   ├── config/
│   │   └── store/             # Pinia stores（含持久化）
│   ├── pages/
│   │   ├── layout/main.vue   # TabBar 主布局（首页/我的 左右滑动）
│   │   ├── course/
│   │   │   ├── index/        # 课程详情页
│   │   │   └── comment/       # 吐槽发布页
│   │   ├── find/index/        # 搜索入口页（转发 mode 参数）
│   │   └── proposal/
│   │       └── propose/       # 新增提议页
│   ├── utils/
│   ├── swagger.json           # ⚠️ API 契约源文件，修改后必须 yarn api
│   └── MAINTENANCE.md         # 本文档
├── dist/                      # 构建输出目录
├── package.json
└── yarn.lock
```

**路径别名**：`@` 指向 `src/`

---

## 🔧 构建命令

```bash
cd Meowpick-Frontend

yarn install              # 安装依赖
yarn api                  # ⚠️ 从 swagger.json 生成 API 代码（每次修改 swagger.json 后必执行）
yarn dev:mp-weixin        # 开发模式编译 → dist/dev/mp-weixin
yarn build:mp-weixin      # 生产模式编译 → dist/build/mp-weixin
yarn type-check           # TypeScript 类型检查
yarn release              # 版本发布 + 生成 CHANGELOG
```

**CI 流水线**：
```bash
cd Meowpick-Frontend && yarn install && yarn api && yarn build:mp-weixin
```

---

## ✅ 已验证的最佳实践

### 1. 页面间数据传递

**传递对象数据（必须 JSON 序列化）**：

发送端：
```ts
const data = { id: 'xxx', name: '课程名', ... };
const dataStr = encodeURIComponent(JSON.stringify(data));
uni.navigateTo({ url: `/pages/target/index?data=${dataStr}` });
```

接收端：
```ts
onLoad((options: any) => {
  if (options.data) {
    const data = JSON.parse(decodeURIComponent(options.data));
    // 使用 data.id 等
  }
});
```

**简单值（字符串/数字）可直接传递**： `/pages/target/index?id=xxx`

---

### 2. Props 响应式规范 ⚠️

**必须使用 computed 转发 props**，否则捕获的是快照值：

```ts
// ❌ 错误 - ref 捕获创建时的快照
const props = defineProps<{ initialMode?: string }>();
const mode = ref(props.initialMode || '');

// ✅ 正确 - computed 响应式转发
const props = defineProps<{ initialMode?: string }>();
const mode = computed(() => props.initialMode || '');
```

**适用场景**：父组件动态传参，子组件根据该值做条件渲染或逻辑判断。

---

### 3. 自定义导航栏高度计算

**标准模板（复制使用）**：

```ts
const sysInfo = uni.getSystemInfoSync();
let menuButtonTop = sysInfo.statusBarHeight ? sysInfo.statusBarHeight + 4 : 48;
let menuButtonHeight = 32;
try {
  const rect = uni.getMenuButtonBoundingClientRect();
  if (rect && rect.top) {
    menuButtonTop = rect.top;
    menuButtonHeight = rect.height;
  }
} catch (e) {}

const NAVBAR_HEIGHT = menuButtonTop + menuButtonHeight + 12;

const navBarStyle = computed(() => ({
  height: NAVBAR_HEIGHT + 'px',
  paddingTop: menuButtonTop + 'px',
  paddingLeft: '32rpx',
  paddingRight: '32rpx',
  boxSizing: 'border-box'
}));
```

**模板使用**：
```html
<!-- 固定导航栏 -->
<view class="nav-bar" :style="navBarStyle">...</view>

<!-- 内容区域（留出导航栏高度） -->
<view :style="{ paddingTop: (NAVBAR_HEIGHT + 8) + 'px' }">...</view>
```

---

### 4. 发布类页面的加载保护

```ts
// 状态
const isClicked = ref(false);
```

```html
<!-- 可交互区域（禁用态） -->
<view :class="{ 'disabled': isClicked }">
  <!-- 输入框、按钮等 -->
</view>

<!-- 发布中遮罩 -->
<view v-if="isClicked" class="loading-overlay">
  <view class="loading-spinner"></view>
  <text class="loading-text">发布中...</text>
</view>
```

```scss
.disabled { pointer-events: none; opacity: 0.6; }

.loading-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  z-index: 999;
}

.loading-spinner {
  width: 80rpx; height: 80rpx;
  border: 6rpx solid rgba(255,255,255,0.3); border-top-color: #fff;
  border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 24rpx;
}
@keyframes spin { to { transform: rotate(360deg); } }
```

```ts
const commit = async () => {
  if (isClicked.value) return;
  isClicked.value = true;
  try {
    // ... 发布逻辑
  } catch (e) {
    isClicked.value = false; // 失败时解锁
  }
};
```

---

### 5. 搜索页的 mode 参数模式

**父组件（入口页）**：
```html
<!-- src/pages/find/index/index.vue -->
<find :initial-mode="mode" ref="findRef" />
```
```ts
const mode = ref('');
onLoad((options: any) => {
  if (options.mode) mode.value = options.mode;
});
```

**子组件（find/index.vue）**：
```ts
const props = defineProps<{ initialMode?: string }>();
const mode = computed(() => props.initialMode || ''); // ⚠️ 必须用 computed
```
```html
<!-- 使用示例 -->
<view v-if="mode === 'add-comment'" class="search-guide-banner">
  <text>请搜索并选择你要吐槽的课程</text>
</view>
```

---

## 🔄 路由与数据流

### 搜索 → 吐槽发布（新增流程）

```
"我的"页面 → FAB点击 → actionSheet选择"新增吐槽"
  → navigateTo(/pages/find/index/index?mode=add-comment)
    → 搜索组件显示 mode=add-comment 提示横幅
    → 用户搜索并点击课程卡片
    → clickCourse() 检测 mode === 'add-comment'
    → 跳转 /pages/course/comment/index?data=<courseJson>
      → comment/index.vue 解析 data 参数获取 courseId
      → 直接显示发布界面（不请求课程详情）
```

### 搜索状态恢复机制

```
跳转详情页前：
  uni.setStorageSync('find_page_state', { searchText, isResultMode: true })

返回时（onShow）：
  读取状态 → 恢复 searchText 和 isResultMode
  → 设置 _resumeGuard 防止 focus 事件误触发模式切换
```

---

## 🎨 品牌样式规范

| 元素 | 值 |
|------|-----|
| 品牌红 | `#B20035` |
| 品牌渐变 | `linear-gradient(135deg, #b20035, #ff4d6a)` |
| 页面背景 | `#f7f8fa` |
| 卡片背景 | `#ffffff` |
| 文字主色 | `#333333` |
| 文字副色 | `#999999` |
| 标签激活态 | `#fff0f5` + `#ffb6c1` 边框 |

---

## 📋 API 变更流程

```
1. 后端更新 swagger.json（或前端同步更新）
2. 前端执行: yarn api
3. 检查 src/api/data-contracts.ts 确认类型生成正确
4. 使用生成的接口调用 API
```

**禁止**：手动编辑 `src/api/` 下的任何文件（会被 `yarn api` 覆盖）

---

## 🔀 Git 规范

### 提交类型

| 类型 | 使用场景 |
|------|----------|
| `feat:` | 新功能 |
| `fix:` | Bug 修复 |
| `style:` | 样式修改，不影响逻辑 |
| `refactor:` | 重构，不影响功能 |
| `docs:` | 文档更新 |

### Force Push 规则

**仅限以下情况**：
- 修正自己刚推送的 commit message
- 回退自己创建的 commit（本地未合并）
- **禁止**在已合并到其他分支的 commit 上使用

---

## ❓ 常见问题排查

| 问题 | 可能原因 | 解决方案 |
|------|---------|----------|
| 页面内容被导航栏遮挡 | NAVBAR_HEIGHT 计算错误 | 参考本文档"自定义导航栏高度计算"模板 |
| API 404 或方法不存在 | 未执行 `yarn api` | 执行 `yarn api` |
| 组件不响应 props 变化 | 使用了 `ref(props.xxx)` 而非 `computed` | 参考 Props 响应式规范 |
| 编译报错但代码无误 | 依赖损坏 | `yarn install` |
| 微信开发者工具显示异常 | 缓存问题 | 清缓存 → 重新编译 |

---

## 📝 标签/表情系统

| 标签 | Emoji | 含义 |
|------|-------|------|
| 容易 | 🐱 | 课程难度低 |
| 硬核 | 😼 | 课程有挑战性 |
| 避雷 | 🙀 | 建议避开 |
| 推荐 | 😻 | 强烈推荐 |
| 严谨 | 😾 | 老师教学严谨 |
| 枯燥 | 😿 | 课程较枯燥 |
| 幽默 | 😹 | 老师幽默 |
| 好评 | 😻 | 总体好评 |

---

## 📄 页面清单

| 页面 | 路由 | 说明 |
|------|------|------|
| 主布局 | `/pages/layout/main` | TabBar（首页/我的）+ 左右滑动 |
| 首页 | `src/components/home-view/` | Logo + 搜索框 + 统计数据 |
| 搜索 | `src/components/find/` | 搜索入口 + 搜索结果（mode=add-comment 支持） |
| 课程详情 | `/pages/course/index/index` | 课程信息 + 评论列表 |
| 吐槽发布 | `/pages/course/comment/index` | 标签选择 + 内容输入 + 发布保护 |
| 提议详情 | `/pages/course/proposal-detail/index` | 提议投票详情 |
| 新增提议 | `/pages/proposal/propose/propose` | 提议表单 |

---

> 本文档随每次成功修改持续迭代更新
> 最新 commit: `3a5746f` (2026-05-25)
