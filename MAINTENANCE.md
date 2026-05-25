# Meowpick 开发维护参考手册

> 本文档随每次成功修改持续更新，记录已验证的最佳实践。
> 代码即文档，文档即代码。

---

## 一、页面间数据传递

### 传递对象数据（完整示例）

发送端（From）：
```ts
// src/components/find/index.vue 或任意跳转发起处
const course = { id: 'xxx', name: '课程名', ... };
const dataStr = encodeURIComponent(JSON.stringify(course));
uni.navigateTo({
  url: `/pages/course/comment/index?data=${dataStr}`
});
```

接收端（To）：
```ts
// src/pages/course/comment/index.vue
onLoad((options: any) => {
  if (options.data) {
    const data = JSON.parse(decodeURIComponent(options.data));
    course_id = data.id;
  }
});
```

**规则**：
- 任何非字符串数据（对象、数组）必须 JSON 序列化 + encodeURIComponent
- 接收端必须用 decodeURIComponent + JSON.parse 解析
- 简单值（如 id）可直接当 URL 参数传递

---

## 二、Props 响应式规范

### 必须使用 computed 转发 props

**错误**：
```ts
const props = defineProps<{ initialMode?: string }>();
const mode = ref(props.initialMode || ''); // ❌ 快照，不会响应变化
```

**正确**：
```ts
const props = defineProps<{ initialMode?: string }>();
const mode = computed(() => props.initialMode || ''); // ✅ 响应式
```

**适用场景**：父组件通过 props 向子组件传递动态值，且子组件内部需要基于该值做条件渲染或逻辑判断。

---

## 三、自定义导航栏高度计算

### 标准模板（复制使用）

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

**使用**：
```html
<view class="nav-bar" :style="navBarStyle">...</view>
<view class="content-body" :style="{ paddingTop: (NAVBAR_HEIGHT + 8) + 'px' }">...</view>
```

**说明**：
- `NAVBAR_HEIGHT` = 胶囊顶部 + 胶囊高度 + 12px 底部间距
- 内容区域 `paddingTop` 额外加 8px 避免紧贴

---

## 四、发布类页面的加载保护

### 标准模板

```ts
// 状态
const isClicked = ref(false);
```

```html
<!-- 模板 -->
<view :class="{ 'disabled': isClicked }">
  <!-- 可交互区域 -->
</view>

<view v-if="isClicked" class="loading-overlay">
  <view class="loading-spinner"></view>
  <text class="loading-text">发布中...</text>
</view>
```

```css
.disabled {
  pointer-events: none;
  opacity: 0.6;
}

.loading-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.loading-spinner {
  width: 80rpx; height: 80rpx;
  border: 6rpx solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 24rpx;
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

## 五、API 变更流程

### 唯一正确流程

```
1. 后端更新 swagger.json
2. 前端执行: cd Meowpick-Frontend && yarn api
3. 检查 src/api/data-contracts.ts 确认类型生成正确
4. 使用生成的接口调用 API
```

**禁止**：
- 手动编辑 `src/api/` 下的任何文件（会被 `yarn api` 覆盖）
- 猜测 API 方法名，必须以 swagger.json 和生成文件为准

---

## 六、条件渲染模式判断

### 搜索页的 add-comment 模式

搜索页支持两种模式：普通搜索 和 新增吐槽入口。

**父组件传参**：
```html
<!-- src/pages/find/index/index.vue -->
<find :initial-mode="mode" ref="findRef" />
```

```ts
// src/pages/find/index/index.vue
const mode = ref('');
onLoad((options: any) => {
  if (options.mode) mode.value = options.mode;
});
```

**子组件接收**（必须用 computed）：
```ts
const props = defineProps<{ initialMode?: string }>();
const mode = computed(() => props.initialMode || '');
```

**使用示例**：
```html
<view v-if="mode === 'add-comment'" class="search-guide-banner">
  <text>请搜索并选择你要吐槽的课程</text>
</view>
```

---

## 七、Git 规范

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
- 修正自己的 commit message
- 回退自己创建的 commit（本地未合并）
- **禁止**在已推送至其他分支的 commit 上使用

---

## 八、目录结构速查

```
src/
├── api/                    # ⚠️ 自动生成，禁止手动编辑
│   ├── http-client.ts     # Axios 客户端
│   └── data-contracts.ts  # 类型定义
├── components/             # 全局组件（自动导入）
│   ├── home-view/         # 首页
│   ├── find/              # 搜索组件
│   ├── profile-view/     # 我的页面
│   └── common/            # 通用组件
├── config/
│   └── store/             # Pinia stores
├── pages/
│   ├── layout/main.vue    # TabBar 主布局
│   ├── course/
│   │   ├── index/         # 课程详情
│   │   └── comment/       # 吐槽发布
│   └── find/index/        # 搜索入口页
├── utils/
├── swagger.json           # ⚠️ API 契约源文件
└── MAINTENANCE.md         # 本文档
```

---

## 九、常见问题

### Q: 页面内容被导航栏遮挡
→ 检查 NAVBAR_HEIGHT 计算和 content-body 的 paddingTop

### Q: API 404 或方法不存在
→ 确认执行了 `yarn api`，检查 swagger.json 是否最新

### Q: 组件不响应 props 变化
→ 确认使用了 `computed(() => props.xxx)` 而非 `ref(props.xxx)`

### Q: 编译报错但代码无误
→ 尝试 `yarn install` 重装依赖

---

> 本文档随代码更新持续迭代
> 上次更新：2026-05-25 (commit: 3a5746f)
