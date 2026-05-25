# Meowpick 微信小程序前端

> 基于 uni-app + Vue 3 + TypeScript 的校园课程吐槽平台

---

## 项目信息

- **技术栈**：uni-app (DCloud) / Vue 3 / TypeScript / Vite / SCSS / NutUI / Pinia
- **构建目标**：微信小程序 (mp-weixin)
- **包管理器**：yarn（**请勿使用 npm**）
- **分支策略**：`code-cleanup` 为开发分支，`main` 为生产分支

---

## 快速开始

```bash
# 1. 安装依赖
yarn install

# 2. 生成 API 类型（每次修改 swagger.json 后必执行）
yarn api

# 3. 开发模式编译
yarn dev:mp-weixin
# 输出目录：dist/dev/mp-weixin

# 4. 生产模式编译
yarn build:mp-weixin
# 输出目录：dist/build/mp-weixin
```

在微信开发者工具中导入 `dist/dev/mp-weixin` 或 `dist/build/mp-weixin` 目录即可预览。

---

## 开发规范

### API 变更流程

`src/swagger.json` 是 API 契约的**唯一真相来源**。

```
swagger.json 修改 → yarn api → 自动生成 src/api/ 下的类型和客户端
```

### Git 提交规范

使用 Conventional Commits：

| 类型 | 用途 |
|------|------|
| `feat:` | 新功能 |
| `fix:` | Bug 修复 |
| `style:` | 样式修改（不影响逻辑） |
| `refactor:` | 重构（不影响功能） |
| `perf:` | 性能优化 |

### 强制更新（Force Push）

**仅限以下情况**：
- 修正自己刚推送的 commit message
- 回退自己创建的 commit
- **禁止**在已合并到其他分支的 commit 上使用

---

## 核心架构

### 目录结构

```
src/
├── api/                  # 自动生成，请勿手动编辑
│   ├── http-client.ts   # Axios 客户端（含拦截器）
│   └── data-contracts.ts # TypeScript 接口定义
├── components/           # Vue 组件（全局自动导入）
│   ├── home-view/       # 首页组件
│   ├── find/            # 搜索组件
│   ├── profile-view/    # 我的页面组件
│   └── common/          # 通用组件（如 BackBtn）
├── config/
│   └── store/           # Pinia stores（含持久化）
├── pages/               # 页面
│   ├── layout/          # 主布局（含 TabBar）
│   ├── course/          # 课程详情、吐槽发布
│   ├── find/           # 搜索入口页
│   └── home/            # 站内信、更新日志
├── utils/               # 工具函数
├── wxcomponents/        # Vant WeApp 组件
└── swagger.json         # ⚠️ API 契约源文件
```

### 组件自动导入

- `src/components/` 下的组件全局自动导入，无需 import
- Vue 3 Composition API (`ref`, `computed`, `watch` 等) 自动导入
- uni-app 生命周期钩子 (`onLoad`, `onShow` 等) 自动导入
- 路径别名 `@` 指向 `src/`

### 状态管理

Pinia + `pinia-plugin-unistorage` 实现状态持久化，页面刷新后状态保留。

### 路由策略模式

卡片携带 `type` 字段（`complaint`/`proposal`），通过策略模式映射到路由地址，避免复杂条件判断。

---

## 重要页面说明

### 首页 (`src/components/home-view/index.vue`)

- 包含 Logo 连击彩蛋（已回退到禁用状态）
- 展示统计数据、致用户信、更新日志入口

### 搜索页 (`src/components/find/index.vue`)

- `mode=add-comment` 参数：从"我的"页面新增吐槽入口
- 搜索结果点击后直接跳转吐槽发布页，不经过课程详情页

### 吐槽发布页 (`src/pages/course/comment/index.vue`)

- 支持通过 `id` 参数（课程详情页入口）或 `data` 参数（搜索页直接入口）两种方式进入
- 发布中有加载遮罩和交互禁用保护

### 主布局 (`src/pages/layout/main.vue`)

- 底部 TabBar：首页 / 我的
- 滑动切换，禁止垂直滚动穿透

---

## 维护文档

开发过程中遇到的常见问题和踩坑记录，请查阅：

👉 [MAINTENANCE.md](./MAINTENANCE.md)

包括：
- Props 响应式陷阱
- 页面间数据传递规范
- 导航栏高度计算
- API 代码生成流程
- 常见问题排查

---

## 环境要求

- Node.js >= 16
- yarn >= 1.22
- 微信开发者工具（导入 `dist/dev/mp-weixin`）

---

> 最后更新：2026-05-25
