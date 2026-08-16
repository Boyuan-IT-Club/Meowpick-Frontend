<template>
  <top-bar :selected="1" />
  <view class="comment">
    <!-- 个人信息卡片 -->
    <view class="profile-card">
      <view class="profile-info">
        <view class="profile-avatar">
          <text class="avatar-placeholder">🐱</text>
        </view>
        <view class="profile-detail">
          <text class="profile-name">{{ userInfo.username || '加载中...' }}</text>
          <view class="profile-contribution">
            <text class="contribution-label">贡献值：</text>
            <text class="contribution-value">{{ userInfo.contribution || 0 }}</text>
          </view>
        </view>
      </view>
      <view class="edit-nickname-btn" @click="goToEditNickname">
        <text class="edit-icon">✎</text>
        <text class="edit-text">编辑昵称</text>
      </view>
    </view>

    <view class="tab-bar">
      <view class="tab-container">
        <view
          class="tab-item"
          :class="{ active: activeTab === 'comment' }"
          @click="switchTab('comment')"
        >
          <text class="tab-text">吐槽</text>
        </view>
        <view
          class="tab-item"
          :class="{ active: activeTab === 'proposal' }"
          @click="switchTab('proposal')"
        >
          <text class="tab-text">提案</text>
        </view>
        <view class="tab-indicator-wrapper">
          <view class="tab-indicator" :class="{ 'right': activeTab === 'proposal' }" />
        </view>
      </view>
    </view>

    <scroll @bottom="handleBottom">
      <template v-if="activeTab === 'comment'">
        <view v-for="item of commentList" :key="item.id" class="item">
          <MyCommentBox :data="item" @like="likeComment" />
        </view>
        <view v-if="commentList.length === 0 && !commentLoading" class="empty-state">
          <text class="empty-text">暂无吐槽记录</text>
        </view>
      </template>
      <template v-else>
        <view v-for="(item, index) of proposalList" :key="item.id" class="proposal-item" @click="goToProposalDetail(item)">
          <view class="proposal-card">
            <view class="proposal-header">
              <text class="proposal-title">{{ item.title || item.course?.name || '未知课程' }}</text>
              <view class="status-tag" :class="item.status">{{ getStatusText(item.status) }}</view>
            </view>

            <!-- 审批时间 -->
            <view class="review-time" v-if="item.status === 'approved' || item.status === 'rejected'">
              <text class="review-time-label">{{ item.status === 'approved' ? '通过时间' : '拒绝时间' }}：</text>
              <text class="review-time-value">{{ formatTime(item.updatedAt) }}</text>
            </view>

            <!-- 拒绝原因 -->
            <view class="reject-reason" v-if="item.status === 'rejected' && item.rejectReason">
              <text class="reject-label">拒绝原因：</text>
              <text class="reject-text">{{ item.rejectReason }}</text>
            </view>

            <!-- 原始提交信息 -->
            <view class="proposal-info" v-if="item.course">
              <view class="info-section-title" v-if="item.status === 'approved' && (item as any).finalCourse">原始提交</view>
              <view class="course-detail" v-if="item.course.campuses?.length">
                <span class="detail-item">校区：{{ item.course.campuses.join('、') }}</span>
              </view>
              <view class="course-detail" v-if="item.course.department">
                <span class="detail-item">院系：{{ item.course.department }}</span>
              </view>
              <view class="course-detail" v-if="item.course.category">
                <span class="detail-item">分类：{{ item.course.category }}</span>
              </view>
              <view class="course-detail" v-if="item.course.teachers?.length">
                <span class="detail-item">教师：{{ item.course.teachers.map((t: any) => typeof t === 'string' ? t : t.name || '').join('、') }}</span>
              </view>
            </view>

            <!-- 最终课程信息（已通过且存在finalCourse时双栏展示） -->
            <view class="proposal-info final-info" v-if="item.status === 'approved' && (item as any).finalCourse">
              <view class="info-section-title">最终课程</view>
              <view class="course-detail" v-if="(item as any).finalCourse.campuses?.length">
                <span class="detail-item">校区：{{ (item as any).finalCourse.campuses.join('、') }}</span>
              </view>
              <view class="course-detail" v-if="(item as any).finalCourse.department">
                <span class="detail-item">院系：{{ (item as any).finalCourse.department }}</span>
              </view>
              <view class="course-detail" v-if="(item as any).finalCourse.category">
                <span class="detail-item">分类：{{ (item as any).finalCourse.category }}</span>
              </view>
              <view class="course-detail" v-if="(item as any).finalCourse.teachers?.length">
                <span class="detail-item">教师：{{ (item as any).finalCourse.teachers.map((t: any) => typeof t === 'string' ? t : t.name || '').join('、') }}</span>
              </view>
            </view>

            <!-- 贡献者 -->
            <view class="contributor-row">
              <span class="contributor-text">贡献者：喵同学</span>
            </view>

            <view class="proposal-footer">
              <view class="footer-spacer" />
              <view class="delete-area" @click.stop="handleDelete(index)" v-if="item.status === 'pending'">
                <text class="delete-text">删除</text>
              </view>
              <view class="edit-area" @click.stop="handleReEdit(item)" v-if="item.status === 'rejected'">
                <text class="edit-area-text">重新编辑</text>
              </view>
            </view>
          </view>
        </view>
        <view v-if="proposalList.length === 0 && !proposalLoading" class="empty-state">
          <text class="empty-text">暂无提案记录</text>
        </view>
      </template>
      <view v-if="loading" class="loading-more">
        <text class="loading-text">加载中...</text>
      </view>
      <view class="bottom-safe-area"></view>
    </scroll>
  </view>
</template>

<script setup lang="ts">
import { ref, shallowRef } from "vue";
import { onShow, onPageScroll } from "@dcloudio/uni-app";
import { http } from "@/config";
import type { DtoCommentVO, DtoProposalVO } from "@/api/data-contracts";
import MyCommentBox from "@/pages/my-comments/MyCommentBox.vue";

const activeTab = ref<'comment' | 'proposal'>('comment');
const commentList = ref<DtoCommentVO[]>([]);
const proposalList = ref<DtoProposalVO[]>([]);
const commentPage = shallowRef(0);
const proposalPage = ref(0);
const commentHasMore = ref(true);
const proposalHasMore = ref(true);
const commentLoading = ref(false);
const proposalLoading = ref(false);
const loading = ref(false);
let commentInitialized = false;
let proposalInitialized = false;

// 用户信息（占位，后续接口对接）
const userInfo = ref({
  username: '加载中...',
  contribution: 0
});

function goToEditNickname() {
  uni.showToast({ title: '昵称编辑功能开发中', icon: 'none' });
}

function formatTime(dateStr?: string | Date): string {
  if (!dateStr) return '--';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '--';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day} ${h}:${min}`;
}

function getStatusText(status?: string): string {
  const statusMap: Record<string, string> = {
    'pending': '待审核',
    'approved': '已通过',
    'rejected': '已拒绝'
  };
  return statusMap[status || ''] || status || '';
}

function handleReEdit(item: DtoProposalVO) {
  uni.navigateTo({
    url: `/pages/proposal/propose?editProposalId=${item.id}`
  });
}

onShow(() => {
  uni.hideTabBar();
  if (activeTab.value === 'comment') {
    fetchComments(0);
    commentInitialized = true;
  } else if (activeTab.value === 'proposal') {
    fetchProposals(0);
    proposalInitialized = true;
  }
});

const switchTab = (tab: 'comment' | 'proposal') => {
  if (activeTab.value === tab) return;
  activeTab.value = tab;
  if (tab === 'comment' && !commentInitialized) {
    fetchComments(0);
    commentInitialized = true;
  } else if (tab === 'proposal' && !proposalInitialized) {
    fetchProposals(0);
    proposalInitialized = true;
  }
};

function fetchComments(page: number) {
  if (!commentHasMore.value && page > 0) return;
  commentLoading.value = true;
  loading.value = true;

  if (page === 0) {
    commentList.value = [];
    commentHasMore.value = true;
  }

  http.CommentController.commentHistoryCreate({ page, pageSize: 5 }).then((res) => {
    if (res.data?.code === 0) {
      const responseData = res.data.data || res.data;
      const comments = responseData?.comments || [];
      comments.forEach((comment) => {
        commentList.value.push(comment);
      });
      const total = responseData?.total || 0;
      commentHasMore.value = commentList.value.length < total;
      commentPage.value = page;
    }
  }).catch((err) => {
    console.error('[API] 获取评论历史失败:', err);
  }).finally(() => {
    commentLoading.value = false;
    loading.value = false;
  });
}

function fetchProposals(page: number) {
  if (!proposalHasMore.value && page > 0) return;
  proposalLoading.value = true;
  loading.value = true;

  if (page === 0) {
    proposalList.value = [];
    proposalHasMore.value = true;
  }

  http.ProposalController.proposalHistoryList({ page, pageSize: 5 }).then((res) => {
    if (res.data?.code === 0) {
      const responseData = res.data.data || res.data;
      const proposals = responseData?.proposals || [];
      proposals.forEach((proposal) => {
        proposalList.value.push(proposal);
      });
      const total = responseData?.total || 0;
      proposalHasMore.value = proposalList.value.length < total;
      proposalPage.value = page;
    }
  }).catch((err) => {
    console.error('[API] 获取提案历史失败:', err);
  }).finally(() => {
    proposalLoading.value = false;
    loading.value = false;
  });
}

function likeComment(target: string) {
  const comment = commentList.value.find(c => c.id === target);
  if (!comment) return;

  http.LikeController.likeCreate(target, {
    targetId: target,
    targetType: 'comment'
  }).then((res) => {
    if (res.data?.code === 0) {
      const isLiked = res.data?.like ?? res.data?.data?.like ?? !comment.like;
      const newCnt = res.data?.likeCnt ?? res.data?.data?.likeCnt ?? (isLiked ? comment.likeCnt! + 1 : comment.likeCnt! - 1);
      comment.like = isLiked;
      comment.likeCnt = newCnt;
    }
  }).catch((err) => {
    console.error('[API] 点赞评论失败:', err);
  });
}

function handleDelete(index: number) {
  const proposal = proposalList.value[index];
  if (!proposal?.id) return;

  uni.showModal({
    title: '确认删除',
    content: '确定要删除该提案吗？删除后不可恢复。',
    success: (res) => {
      if (res.confirm) {
        http.ProposalController.proposalDeleteCreate(proposal.id!, {}).then((res) => {
          if (res.data?.code === 0) {
            uni.showToast({ title: '已删除', icon: 'success' });
            proposalList.value.splice(index, 1);
          } else {
            uni.showToast({ title: res.data?.msg || '删除失败', icon: 'none' });
          }
        }).catch((err) => {
          console.error('[API] 删除提案失败:', err);
          uni.showToast({ title: '删除失败', icon: 'none' });
        });
      }
    }
  });
}

function goToProposalDetail(item: DtoProposalVO) {
  uni.navigateTo({
    url: `/pages/proposal/detail?id=${item.id}&data=${encodeURIComponent(JSON.stringify(item))}`
  });
}

function handleBottom() {
  if (activeTab.value === 'comment') {
    if (commentHasMore.value) {
      commentPage.value++;
      fetchComments(commentPage.value);
    }
  } else {
    if (proposalHasMore.value) {
      proposalPage.value++;
      fetchProposals(proposalPage.value);
    }
  }
}

onPageScroll((e) => {
  uni.$emit('pageScroll', e);
});
</script>

<style scoped lang="scss">
.comment {
  margin-top: 30vw;
  margin-left: 5vw;
  margin-right: 5vw;
  height: 200vw;
  width: 90vw;
}

.profile-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 87vw;
  background: linear-gradient(135deg, #fff5f8, #fff);
  border-radius: 3vw;
  box-shadow: 1px 1px 5px 0px #0000001f;
  padding: 4vw;
  margin-bottom: 3vw;

  .profile-info {
    display: flex;
    align-items: center;

    .profile-avatar {
      width: 12vw;
      height: 12vw;
      border-radius: 50%;
      background: linear-gradient(135deg, #ffb3c6, #ff8fab);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      .avatar-placeholder {
        font-size: 6vw;
      }
    }

    .profile-detail {
      margin-left: 3vw;

      .profile-name {
        font-size: 4vw;
        font-weight: bold;
        color: #333;
      }

      .profile-contribution {
        margin-top: 1vw;

        .contribution-label {
          font-size: 3.2vw;
          color: #999;
        }

        .contribution-value {
          font-size: 3.5vw;
          font-weight: 600;
          color: #b70030;
        }
      }
    }
  }

  .edit-nickname-btn {
    display: flex;
    align-items: center;
    background: #fff0f6;
    padding: 2vw 3vw;
    border-radius: 2vw;
    border: 1px solid #ffadd2;

    .edit-icon {
      font-size: 3.5vw;
      color: #b70030;
    }

    .edit-text {
      font-size: 3vw;
      color: #b70030;
      margin-left: 1vw;
    }
  }
}

.tab-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 4vw;
  padding: 2vw 0;
}

.tab-container {
  display: flex;
  position: relative;
  background-color: #f5f5f5;
  border-radius: 8vw;
  padding: 1vw;
}

.tab-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2.5vw 8vw;
  z-index: 2;
  cursor: pointer;
  position: relative;

  .tab-text {
    font-size: 4vw;
    color: #999;
    font-weight: normal;
    transition: color 0.3s;
    text-align: center;
    min-width: 10vw;
  }

  &.active {
    .tab-text {
      color: #b70030;
      font-weight: bold;
    }
  }
}

.tab-indicator-wrapper {
  position: absolute;
  top: 1vw;
  left: 1vw;
  width: calc(50% - 1vw);
  height: calc(100% - 2vw);
  z-index: 1;

  .tab-indicator {
    width: 100%;
    height: 100%;
    background-color: #ffffff;
    border-radius: 7vw;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &.right {
      transform: translateX(100%);
    }
  }
}

.proposal-item {
  margin-bottom: 3vw;
}

.proposal-card {
  background-color: #ffffff;
  width: 87vw;
  border-radius: 3vw;
  box-shadow: 1px 1px 5px 0px #0000001f;
  padding: 4vw;
  margin-top: 3vw;

  .proposal-header {
    display: flex;
    flex-direction: row;
    align-items: center;

    .proposal-title {
      font-size: 4vw;
      font-weight: bold;
      color: #333;
      flex: 1;
    }

    .status-tag {
      font-size: 2.8vw;
      padding: 0.5vw 2vw;
      border-radius: 2vw;
      margin-left: 2vw;

      &.pending {
        background-color: #fff7e6;
        color: #fa8c16;
      }

      &.approved {
        background-color: #f6ffed;
        color: #52c41a;
      }

      &.rejected {
        background-color: #fff1f0;
        color: #ff4d4f;
      }
    }
  }

  .proposal-info {
    margin-top: 3vw;

    .info-section-title {
      font-size: 3vw;
      font-weight: 600;
      color: #b70030;
      margin-bottom: 2vw;
      padding-bottom: 1vw;
      border-bottom: 1px dashed #ffd6e7;
    }

    .course-detail {
      display: flex;
      flex-wrap: wrap;
      gap: 2vw;
      margin-bottom: 2vw;

      .detail-item {
        font-size: 3vw;
        color: #666666;
        background-color: #f5f5f5;
        padding: 0.5vw 2vw;
        border-radius: 2vw;
      }
    }

    &.final-info {
      margin-top: 3vw;
      padding-top: 3vw;
      border-top: 1px solid #f0f0f0;
    }
  }

  .review-time {
    margin-top: 2vw;
    display: flex;
    align-items: center;

    .review-time-label {
      font-size: 3vw;
      color: #999;
    }

    .review-time-value {
      font-size: 3vw;
      color: #666;
      margin-left: 1vw;
    }
  }

  .reject-reason {
    margin-top: 2vw;
    background: #fff1f0;
    border-radius: 2vw;
    padding: 2vw 3vw;

    .reject-label {
      font-size: 3vw;
      color: #ff4d4f;
      font-weight: 600;
    }

    .reject-text {
      font-size: 3vw;
      color: #cf1322;
      margin-left: 1vw;
    }
  }

  .contributor-row {
    margin-bottom: 2vw;

    .contributor-text {
      font-size: 3.2vw;
      color: #888888;
    }
  }

  .proposal-footer {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-top: 3vw;
    padding-top: 3vw;
    border-top: 1px solid #f0f0f0;

    .delete-area {
      padding: 1.5vw 3vw;
      border-radius: 2vw;
      background-color: #fff1f0;

      .delete-text {
        font-size: 3.2vw;
        color: #ff4d4f;
      }
    }

    .edit-area {
      padding: 1.5vw 3vw;
      border-radius: 2vw;
      background-color: #f6ffed;

      .edit-area-text {
        font-size: 3.2vw;
        color: #52c41a;
      }
    }

    .footer-spacer {
      flex: 1;
    }
  }
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20vw 0;

  .empty-text {
    font-size: 4vw;
    color: #999;
  }
}

.loading-more {
  display: flex;
  justify-content: center;
  padding: 4vw 0;

  .loading-text {
    font-size: 3.5vw;
    color: #999;
  }
}

.bottom-safe-area {
  height: 30vw;
}
</style>
