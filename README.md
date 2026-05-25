# Meowpick 喵选

> 华东师范大学学生自主组建的选课信息聚合微信小程序

---

## 快速开始

```bash
cd Meowpick-Frontend
yarn install
yarn api                    # ⚠️ 每次修改 swagger.json 后必执行
yarn dev:mp-weixin         # 开发模式 → dist/dev/mp-weixin
```

导入 `dist/dev/mp-weixin` 到微信开发者工具即可预览。

---

## 项目简介

**两个核心闭环**：

1. **吐槽/评论**：学生对已有课程发表评价（表情标签 + 文字）
2. **提议闭环**：学生对未收录课程发起提议，其他用户可投票支持/反对

**技术栈**：uni-app (Vue 3) + TypeScript + Vite + SCSS + NutUI + Pinia

**⚠️ 包管理器**：yarn（禁止使用 npm）

---

## 目录结构

```
Meowpick-Frontend/
├── src/
│   ├── api/                  # 自动生成（yarn api）
│   ├── components/           # 全局组件
│   │   ├── home-view/       # 首页
│   │   ├── find/            # 搜索
│   │   └── profile-view/    # 我的
│   ├── pages/
│   │   ├── layout/main.vue  # TabBar 主布局
│   │   └── course/comment/  # 吐槽发布
│   ├── config/store/         # Pinia stores
│   └── swagger.json          # ⚠️ API 契约源文件
├── dist/                     # 构建输出
└── MAINTENANCE.md           # 详尽项目文档
```

---

## 常用命令

| 命令 | 说明 |
|------|------|
| `yarn install` | 安装依赖 |
| `yarn api` | 从 swagger.json 生成 API 代码 |
| `yarn dev:mp-weixin` | 开发编译 |
| `yarn build:mp-weixin` | 生产编译 |
| `yarn type-check` | TypeScript 检查 |

**CI 流水线**：`yarn install && yarn api && yarn build:mp-weixin`

---

## 品牌色

| 用途 | 色值 |
|------|------|
| 品牌红 | `#B20035` |
| 渐变 | `linear-gradient(135deg, #b20035, #ff4d6a)` |
| 页面背景 | `#f7f8fa` |

---

## 相关资源

- **详尽文档**：`MAINTENANCE.md` — 包含完整的逻辑说明、已验证的最佳实践、API 规范、踩坑记录
- **API 契约**：`src/swagger.json`
