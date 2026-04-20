# 前端功能修复与优化记录

> **作者**: Claude (AI Assistant)
> **日期**: 2026-04-20
> **分支**: HAppy
> **范围**: 删除评论功能、提议提交 API 对接

---

## 一、本次修复内容

### 1.1 删除评论功能 ✅

**问题**: `my-comments.vue` 中长按删除评论时显示"功能开发中"，未对接真实 API

**修复**:

| 文件 | 修改内容 |
|------|----------|
| `src/api/Comment.ts` | 新增 `commentDelete DELETE:/api/comment/{id}` 接口 |
| `src/pages/my-comments/utils.ts` | 新增 `remove(id)` 函数，调用删除接口并更新列表状态 |
| `src/pages/my-comments/my-comments.vue` | 替换 TODO 注释为真实 API 调用，确认弹窗后执行删除 |

**代码变更**:

```typescript
// utils.ts 新增
function remove(id: string) {
  return http.CommentController.commentDelete(id).then((res: any) => {
    if (res.data?.code === 200 || res.data?.success) {
      list.value = list.value.filter(c => c.id !== id);
      return true;
    }
    return false;
  });
}
```

**交互流程**:
1. 长按评论卡片 → 显示操作菜单
2. 点击"删除该评价" → 确认弹窗
3. 确认后调用 `remove()` → 成功后 toast 提示并从列表移除

**Commit**: `0e36dc5` - `feat(my-comments): 实现删除评论功能`

---

### 1.2 提议提交 API 对接 ✅

**问题**: `propose.vue` 中提交提议使用 `setTimeout` 模拟，未对接真实 API

**修复**:

| 文件 | 修改内容 |
|------|----------|
| `src/pages/proposal/propose/propose.vue` | 替换模拟提交为 `http.ProposalController.proposalAddCreate` 调用 |

**代码变更**:

```typescript
// 替换前
setTimeout(() => {
    uni.showToast({ title: '提交成功', icon: 'success' });
    setTimeout(() => uni.navigateBack(), 1500);
    submitting.value = false;
}, 1000);

// 替换后
const reqData = {
  title: formData.courseName,
  content: formData.reason,
  course: {
    name: formData.courseName,
    code: formData.courseCode,
    department: formData.department,
    campuses: formData.campuses,
  }
};

http.ProposalController.proposalAddCreate(reqData).then((res: any) => {
  submitting.value = false;
  if (res.data?.code === 200) {
    uni.showToast({ title: '提交成功', icon: 'success' });
    setTimeout(() => uni.navigateBack(), 1500);
  } else {
    uni.showToast({ title: res.data?.message || '提交失败', icon: 'none' });
  }
}).catch((err: any) => {
  submitting.value = false;
  uni.showToast({ title: '提交失败', icon: 'none' });
  console.error('[propose] submit error:', err);
});
```

**Commit**: `9dcc86f` - `feat(propose): 对接真实提议提交 API`

---

## 二、待完成工作

### 2.1 编辑页面跳转 (profile-view)

**位置**: `src/components/profile-view/index.vue:280`

**问题**: 长按提议卡片选择"修改"时，显示"即将跳转修改..."但未实现跳转逻辑

**说明**: 需要创建新的编辑页面，当前仅显示 toast 提示。编辑功能需要额外设计编辑页面的路由和数据传递，暂时标记为待后续开发。

### 2.2 其他后端依赖功能

以下功能前端已预留接口，等待后端实现：

| 功能 | 接口 | 状态 |
|------|------|------|
| 提议列表 | `GET /api/proposal/list` | 后端待开发 |
| 提议详情 | `GET /api/proposal/{id}` | 后端待开发 |
| 提议投票 | `POST /api/proposal/{id}/vote` | 后端待开发 |
| 搜索提议 | `GET /api/search?type=proposal` | 后端待开发 |
| 删除评论 | `DELETE /api/comment/{id}` | ✅ 前端已完成，待后端确认 |
| 创建提议 | `POST /api/proposal/add` | ✅ 前端已完成，待后端确认 |

---

## 三、已完成的前端可单独工作

| 优先级 | 功能 | 文件 | 状态 |
|--------|------|------|------|
| P0 | 删除评论功能 | `my-comments.vue` | ✅ 已完成 |
| P0 | 提议提交 API | `propose.vue` | ✅ 已完成 |
| P1 | 编辑页面跳转 | `profile-view/index.vue` | ⏳ 需新建页面 |
| P2 | 加载状态优化 | - | ⏳ 待开发 |
| P2 | 空状态优化 | - | ⏳ 待开发 |

---

## 四、相关文档

- `BACKEND_REQUIREMENTS.md` - 后端接口需求清单（提议模块）
- `CHANGELOG_HAPPY.md` - 前端更新日志
- `LOGIC_MANUAL.md` - 前端操作逻辑说明
