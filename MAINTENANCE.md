# Meowpick 前端开发维护指南

> 记录开发过程中容易踩的坑、最佳实践和关键架构决策，便于后续维护者快速上手。

---

## 一、常见踩坑记录

### 1. Props 响应式陷阱 ⚠️

**问题描述**：
使用 `ref(props.xxx)` 创建响应式变量时，`ref` 捕获的是创建时的快照值，之后父组件的 props 变化不会更新。

**错误写法**：
```ts
const props = defineProps<{ initialMode?: string }>();
const mode = ref(props.initialMode || ''); // ❌ 快照，不会响应变化
```

**正确写法**：
```ts
const props = defineProps<{ initialMode?: string }>();
const mode = computed(() => props.initialMode || ''); // ✅ 响应式
```
**涉及页面**：`src/components/find/index.vue` - `mode` 属性修复

---

### 2. 微信小程序页面间数据传递

**问题描述**：
页面间通过 URL 参数传递数据时，如果数据较复杂（如对象），需要序列化：
- 发送端：`encodeURIComponent(JSON.stringify(data))`
- 接收端：`JSON.parse(decodeURIComponent(options.data))`

**错误**：直接传递对象或忽略编解码会导致数据解析失败。

**涉及页面**：
- `src/components/find/index.vue` - `clickCourse` 跳转到吐槽页
- `src/pages/course/comment/index.vue` - 接收课程数据

---

### 3. 导航栏高度计算

**问题描述**：
自定义导航栏需要精确适配微信胶囊按钮位置，否则内容会被遮挡或间距过大。

**推荐写法**：
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

const NAVBAR_HEIGHT = menuButtonTop + menuButtonHeight + 12; // 底部留白
```

**内容区域 padding**：
```html
<view :style="{ paddingTop: (NAVBAR_HEIGHT + 8) + 'px' }">
```

---

### 4. 发布类页面的加载状态处理

**问题描述**：
用户点击发布按钮后，如果不做限制，用户仍可继续操作（如修改内容），导致数据不一致。

**解决方案**：
1. 使用 `isClicked` 状态控制所有输入组件
2. 显示全局遮罩层阻止交互
3. 只保留返回操作可用

**涉及页面**：`src/pages/course/comment/index.vue`

---

### 5. API 代码生成流程

**重要**：`src/swagger.json` 是 API 契约的真相来源（Source of Truth）。

每次更新 swagger.json 后，**必须**执行：
```bash
cd Meowpick-Frontend && yarn api
```

这会自动重新生成 `src/api/` 目录下的所有 TypeScript 类型定义和 API 客户端。

---

### 6. 彩蛋实现注意事项（历史参考）

> 以下为历史记录，已回退。后续如需重新实现，请特别注意以下问题。

**实现彩蛋时的核心问题**：
- 使用 `position: fixed` + `transform: scale()` 实现绽放效果
- **禁止**直接修改原始元素的 CSS `transform` 属性用于动画，会导致页面布局重排
- **正确做法**：复制一个替身元素（克隆 Logo）用于动画，原元素保持静止
- Logo 放大比例使用非线性映射（如 `[1, 1.02, 1.08, 1.20, 1.45, 1.9, 3.0]`），前几次点击幅度极小
- 连击窗口判定时间应短于回弹动画时长（约 300ms），建议 280ms 左右
- **触摸事件**：`@touchstart`（按下）和 `@touchend`（松开）分离，按下时放大，松开时回弹
- 替身 Logo 放大到约 **20 倍** 即可覆盖全屏

**涉及文件**（已回退）：`src/components/home-view/index.vue`

---

## 二、架构决策记录

### 1. 路由策略模式

卡片携带 `type` 字段（`complaint` / `proposal`），通过轻量级策略模式映射到路由地址，避免复杂的 if-else 链。

### 2. 声明式过滤

前端维护内存列表 + 选中标签，过滤和排序在渲染前客户端执行，减少 API 请求。

### 3. 组件自动导入

- **全局组件**：`src/components/` 和 NutUI 组件通过 `unplugin-vue-components` 自动导入，无需手动 import
- **Vue/Pinia API**：`ref`, `computed`, `onLoad`, `onShow` 等通过 `unplugin-auto-import` 自动导入
- **路径别名**：`@` 指向 `src/`

### 4. 状态持久化

Pinia store 使用 `pinia-plugin-unistorage` 持久化，刷新或重启后状态保留。

---

## 三、关键文件索引

| 文件路径 | 说明 |
|---------|------|
| `src/swagger.json` | API 契约源文件，修改后需运行 `yarn api` |
| `src/api/http-client.ts` | Axios HTTP 客户端，含拦截器逻辑 |
| `src/api/data-contracts.ts` | API 响应 TypeScript 接口 |
| `src/config/store/` | Pinia stores |
| `src/components/home-view/index.vue` | 首页（注意彩蛋回退状态） |
| `src/components/find/index.vue` | 搜索组件（含新增吐槽入口逻辑） |
| `src/pages/course/comment/index.vue` | 吐槽发布页 |
| `src/pages/layout/main.vue` | 底部导航 TabBar 主布局 |
| `src/utils/init.ts` | 初始化逻辑（登录等） |

---

## 四、Git 工作规范

### 提交信息格式
使用 Conventional Commits：
- `feat:` 新功能
- `fix:` Bug 修复
- `style:` 样式修改（不影响功能）
- `refactor:` 重构

### 分支策略
- `code-cleanup` - 主开发分支
- `main` - 生产分支
- 其他人通过 PR 合并

### 强制更新（Force Push）
**仅在以下情况可 force push**：
- 修正自己的 commit message
- 回退到自己创建的 commit
- **禁止**在已推送的公共分支上使用

---

## 五、常见问题排查

### Q: 页面样式错乱，内容被遮挡或偏移
**检查**：
1. 导航栏高度计算是否正确（参考第一节）
2. 是否有残留的 `position: fixed` 或 `z-index` 问题
3. 微信开发者工具是否清缓存重编译

### Q: API 请求报错 404 或方法名不存在
**检查**：
1. `swagger.json` 是否已更新
2. 是否执行了 `yarn api`
3. 查看 `src/api/` 下的生成文件确认方法名

### Q: 组件不显示或数据不更新
**检查**：
1. Props 是否正确传递（参考第一节）
2. `onLoad` / `onShow` 生命周期是否正确触发
3. `ref` vs `reactive` 使用是否正确

### Q: 编译报错但代码看起来没问题
**检查**：
1. 是否有未关闭的标签
2. TypeScript 类型是否正确
3. 尝试 `yarn install` 重新安装依赖

---

## 六、开发命令速查

```bash
cd Meowpick-Frontend

yarn install              # 安装依赖
yarn api                  # 从 swagger.json 生成 API 代码 ⚠️必做
yarn dev:mp-weixin        # 开发模式编译
yarn build:mp-weixin      # 生产模式编译
yarn type-check           # TypeScript 类型检查
yarn release              # 版本发布（自动 CHANGELOG）
```

**CI 流水线**：
```bash
yarn install && yarn api && yarn build:mp-weixin
```

---

> 最后更新：2026-05-25
> 当前分支：code-cleanup
> 最新 commit：eec60c2 - feat: add loading overlay and disable interactions while publishing
