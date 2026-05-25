# 选课猫 项目详尽文档

> 面向后续维护开发者 / AI Agent
> 包含从 main 分支重构至今的所有重要决策、逻辑说明，最佳实践

---

## 一、项目背景

### 1.1 产品定位

**选课猫** — 华东师范大学学生自主组建的选课信息聚合微信小程序。

**核心设计原则**：
- 不涉及对老师的直接评分，避免负面影响
- 采用表情标签 + 评论文字的形式
- 课程信息力求完善（同一老师带的不同课程、同一课程的不同老师、不同校区等均纳入区分）

### 1.2 两个核心闭环

**闭环一：课程评论（吐槽）**
```
学生为已存在课程提供评论 → 其他人搜索、筛选、查看评论
```

**闭环二：建课提议**
```
学生提议尚未收录的课程 → 其他用户支持/反对投票 → 达到阈值后管理员收录
```

### 1.3 原始产品需求（来自 `1.md`）

- TabBar 分两项："首页" 和 "我的"，左右滑动切换
- 首页包含：Logo（点击动画）、搜索框、致用户的一封信、更新日志、吐槽条数统计
- "我的"页面包含：我的吐槽/我的提议陈列 + 筛选栏 + 右下角新增按钮
- 搜索页包含：搜索框、搜索历史、模糊搜索建议、搜索结果
- 新增提议和新增吐槽内容不进行修改
- 除主页和我的之外的所有页面左上角添加统一返回按钮
- 统一主题色（ECNU深红色 `#B20035`）

---

## 二、技术规范

### 2.1 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | uni-app (DCloud) with Vue 3 + TypeScript |
| 构建 | Vite + @dcloudio/vite-plugin-uni |
| 包管理 | **yarn**（禁止 npm） |
| 样式 | SCSS + Tailwind CSS + NutUI |
| 状态 | Pinia + pinia-plugin-unistorage（持久化） |
| API | Axios + uniapp-axios-adapter |

### 2.2 目录结构

```
src/
├── api/                    # ⚠️ 自动生成，禁止手动编辑
│   ├── http-client.ts     # Axios 客户端（含拦截器）
│   └── data-contracts.ts # TypeScript 类型定义
├── components/             # Vue 组件（unplugin-vue-components 全局自动导入）
│   ├── home-view/        # 首页组件
│   ├── find/             # 搜索组件
│   ├── profile-view/     # "我的"页面组件
│   └── common/           # 通用组件（BackBtn 等）
├── config/
│   └── store/            # Pinia stores（含持久化）
├── pages/
│   ├── layout/main.vue   # TabBar 主布局（首页/我的 左右滑动）
│   ├── course/
│   │   ├── index/       # 课程详情页
│   │   └── comment/      # 吐槽发布页
│   ├── find/index/       # 搜索入口页（转发 mode 参数）
│   └── proposal/
│       └── propose/      # 新增提议页
├── utils/
├── swagger.json           # ⚠️ API 契约源文件
└── MAINTENANCE.md       # 本文档
```

### 2.3 路径别名

- `@` → `src/`
- 全局声明：`uni`, `wx`, `UniNamespace`, `uniCloud`, `tt`, `getCurrentPages`

### 2.4 组件自动导入

- `src/components/` 下的组件全局自动导入，**无需手动 import**
- Vue Composition API (`ref`, `computed`, `watch` 等) 自动导入
- uni-app 生命周期 (`onLoad`, `onShow` 等) 自动导入

---

## 三、页面架构

### 3.1 完整页面跳转流程

```
┌──────────────────────────────────────────────────────┐
│  主布局 (main.vue)                                    │
│  TabBar: 首页 / 我的  ←→ 左右滑动切换                  │
└──────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────┐    ┌─────────────────┐
│    首页         │    │    我的          │
│  home-view     │    │  profile-view   │
└─────────────────┘    └─────────────────┘
           │                    │
           ▼                    ▼
    搜索页 ──────────────────►  FAB + 新增
    (find/index)              (actionSheet)
           │
           ▼
    搜索结果页 (find/choose)
           │
           ├─► 课程详情页 (course/index)
           │        │
           │        └─► 吐槽发布页 (course/comment)
           │
           └─► 提议详情页 (course/proposal-detail)
                    │
                    └─► 新增提议页 (proposal/propose)
```

### 3.2 搜索页三种模式

```
[初始状态] ← 点击输入框 → [模糊联想模式] ← 输入文字
                                    │
                          点击建议项 / 回车 / 搜索按钮
                                    │
                                    ▼
                            [搜索结果模式]
                                    │
                          点击输入框重新聚焦
                                    │
                                    ▼
                            [模糊联想模式]（清空结果）
```

**搜索结果分组**：
```ts
groupedRows = {
  courses: list.filter(item => item.resultType !== 'proposal'),   // 课程组
  proposals: list.filter(item => item.resultType === 'proposal')  // 提议组
}
```

展示顺序：课程 → 提议 → "去提议"按钮

### 3.3 搜索状态恢复机制

**问题**：用户从搜索结果进入详情页，返回时搜索状态丢失

**解决方案**：
```ts
// 跳转前存入 Storage
uni.setStorageSync('find_page_state', {
  searchText: '关键词',
  isResultMode: true
});

// 返回时（onShow）读取恢复
const saved = uni.getStorageSync('find_page_state');
if (saved && saved.searchText) {
  searchText.value = saved.searchText;
  isResultMode.value = true;
  _resumeGuard.value = true; // 防止 focus 事件误触发模式切换
}
```

---

## 四、核心功能逻辑

### 4.1 新增吐槽流程（从"我的"页面出发）

```
"我的"页面 → FAB点击 → actionSheet选择"新增吐槽"
  → navigateTo(/pages/find/index/index?mode=add-comment)
    → 搜索组件检测 mode === 'add-comment' → 显示提示横幅
    → 用户搜索并点击课程卡片
    → clickCourse() 检测 mode === 'add-comment'
      → 数据序列化后跳转 /pages/course/comment/index?data=<courseJson>
        → comment/index.vue 解析 data 参数获取 courseId
        → 直接显示发布界面（不请求课程详情）
```

### 4.2 提议功能

**提议表单字段**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| courseName | text | ✅ | 课程名称 |
| courseCode | text | ❌ | 课程代码 |
| department | picker | ✅ | 开课院系 |
| teacher | text | ❌ | 任课教师 |
| reason | textarea | ✅ | 提议理由 |

**提交流程**：填写 → 前端校验 → API提交 → 成功提示 → 1.5s后返回

**投票逻辑**：
```
用户点击「支持」/「反对」
  → 检查 hasVoted
    ├── 未投 → API投票 → 更新计数 + 标记已投
    └── 已投 → 提示"已投票"
```

### 4.3 标签/表情系统

**八大标签**：

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

**Emoji 匹配策略**：
```
精确匹配 → 同义词映射 → 子串匹配 → 词拆分匹配 → 兜底返回 EasyCat
```

**展示位置**：
- 搜索结果卡片底部：Top3 标签（emoji + 名称 + 计数）
- 课程详情评论：右上角展示该评论者选择的标签 emoji

---

## 五、已验证的最佳实践

### 5.1 页面间数据传递

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
    course_id = data.id;
  }
});
```

**简单值（字符串/数字）可直接传递**：`/pages/target/index?id=xxx`

---

### 5.2 Props 响应式规范 ⚠️ 重要

**必须使用 computed 转发 props**，否则捕获的是快照值，后续父组件 props 变化不会更新：

```ts
// ❌ 错误 - ref 捕获创建时的快照
const props = defineProps<{ initialMode?: string }>();
const mode = ref(props.initialMode || '');

// ✅ 正确 - computed 响应式转发
const props = defineProps<{ initialMode?: string }>();
const mode = computed(() => props.initialMode || '');
```

---

### 5.3 自定义导航栏高度计算

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

<!-- 内容区域 -->
<view :style="{ paddingTop: (NAVBAR_HEIGHT + 8) + 'px' }">...</view>
```

---

### 5.4 发布类页面的加载保护

```ts
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

### 5.5 搜索页 mode 参数模式

用于区分"普通搜索"和"新增吐槽入口"两种场景。

**父组件（入口页）**：
```html
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
<view v-if="mode === 'add-comment'" class="search-guide-banner">
  <text>请搜索并选择你要吐槽的课程</text>
</view>
```

---

## 六、API 规范

### 6.1 API 变更流程

```
swagger.json 修改 → yarn api → 自动生成 src/api/ 下的类型和客户端
```

**禁止**：手动编辑 `src/api/` 下的任何文件（会被 `yarn api` 覆盖）

### 6.2 关键 API 端点

| Controller | 关键端点 |
|------------|---------|
| CourseController | courseDetail, campuses, categories, departs |
| CommentController | listComments, createComment, commentHistory, commentAdd |
| ProposalController | add, list, detail, suggest, history, update, delete, vote |
| SearchController | searchSuggestions |
| AuthController | sign_in |
| AdminController | listChangeLogs |

### 6.3 后端数据要求（来自 `DOC_BACKEND_REQUIREMENTS.md`）

- 列表/搜索接口需支持混合返回（comment + proposal）
- 需有 `type` 字段区分数据类型
- 提议实体需包含 `voteCount`、`reason` 等字段
- 同一用户对同一提议只能投票一次
- 提议被修改后投票数需清零

---

## 七、品牌样式规范

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

## 八、Git 规范

### 8.1 提交类型

| 类型 | 使用场景 |
|------|----------|
| `feat:` | 新功能 |
| `fix:` | Bug 修复 |
| `style:` | 样式修改，不影响逻辑 |
| `refactor:` | 重构，不影响功能 |
| `docs:` | 文档更新 |

### 8.2 Force Push 规则

**仅限以下情况**：
- 修正自己刚推送的 commit message
- 回退自己创建的 commit（本地未合并）
- **禁止**在已合并到其他分支的 commit 上使用

---

## 九、常见问题排查

| 问题 | 可能原因 | 解决方案 |
|------|---------|----------|
| 页面内容被导航栏遮挡 | NAVBAR_HEIGHT 计算错误 | 参考本文档"自定义导航栏高度计算"模板 |
| API 404 或方法不存在 | 未执行 `yarn api` | 执行 `yarn api` |
| 组件不响应 props 变化 | 使用了 `ref(props.xxx)` 而非 `computed` | 参考 Props 响应式规范 |
| 编译报错但代码无误 | 依赖损坏 | `yarn install` |
| 微信开发者工具显示异常 | 缓存问题 | 清缓存 → 重新编译 |
| mode 参数不生效 | props 未用 computed 转发 | 参考搜索页 mode 参数模式 |

---

## 十、踩坑记录（已解决）

### ✅ Props 响应式陷阱（已解决）
- **现象**：`mode` 属性在父组件变化后子组件不更新
- **根因**：`ref(props.initialMode)` 捕获的是创建时的快照值
- **方案**：改用 `computed(() => props.initialMode)`

### ✅ 导航栏高度计算错误（已解决）
- **现象**：吐槽发布页内容被遮挡或偏移
- **根因**：`bottom` 属性计算方式在不同设备不一致
- **方案**：统一使用 `menuButtonTop + menuButtonHeight + 12`

### ✅ 发布中可修改内容（已解决）
- **现象**：点击发布后，用户仍可修改输入内容
- **方案**：添加 `isClicked` 状态 + 全屏遮罩禁止交互

---

## 十一、待完成/优化项

- [ ] 彩蛋动画（Logo 连击 7 次绽放效果）— 已回退，待重新实现
- [ ] Admin 后台日志页面 — 彩蛋第 7 次点击的管理员入口
- [ ] 排序功能（搜索结果综合/热度/时间）
- [ ] 筛选功能（校区、学院）

---

> 本文档随每次成功修改持续迭代
> 最新更新：2026-05-25
