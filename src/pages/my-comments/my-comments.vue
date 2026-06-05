<template>
  <top-bar :selected="1" />
  <view class="comment">
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
              <text class="proposal-title">{{ item.title || '未知课程' }}</text>
              <view class="status-tag" :class="item.status">{{ getStatusText(item.status) }}</view>
            </view>
            <view class="proposal-info" v-if="item.course">
              <view class="info-row" v-if="item.course.department">
                <view class="info-dot" />
                <text class="info-label">院系：</text>
                <text class="info-text">{{ item.course.department }}</text>
              </view>
              <view class="info-row" v-if="item.course.category">
                <view class="info-dot" />
                <text class="info-label">分类：</text>
                <text class="info-text">{{ item.course.category }}</text>
              </view>
              <view class="info-row" v-if="item.course.campuses?.length">
                <view class="info-dot" />
                <text class="info-label">校区：</text>
                <text class="info-text">{{ item.course.campuses.join('、') }}</text>
              </view>
              <view class="info-row" v-if="item.course.teachers?.length">
                <view class="info-dot" />
                <text class="info-label">教师：</text>
                <text class="info-text">{{ item.course.teachers.map((t: any) => typeof t === 'string' ? t : t.name || '').join('、') }}</text>
              </view>
            </view>
            <view class="proposal-content" v-if="item.content">{{ item.content }}</view>
            <view class="proposal-footer">
              <view class="like-area" @click.stop="likeProposal(item.id!)">
                <image :src="item.like ? Liked : Like" class="like-icon" />
                <text class="like-count">{{ item.likeCnt || 0 }}人同意</text>
              </view>
              <view class="delete-area" @click.stop="handleDelete(index)">
                <text class="delete-text">删除</text>
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
    </scroll>
  </view>
</template>

<script setup lang="ts">
import { ref, shallowRef } from "vue";
import { onShow, onPageScroll } from "@dcloudio/uni-app";
import { http } from "@/config";
import type { DtoCommentVO, DtoProposalVO } from "@/api/data-contracts";
import MyCommentBox from "@/pages/my-comments/MyCommentBox.vue";
import Liked from "@/images/like_active.png";
import Like from "@/images/like-icon.png";

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

uni.$on('proposalLikeUpdated', (data: any) => {
  if (!data?.id) return;
  const idx = proposalList.value.findIndex(p => p.id === data.id);
  if (idx > -1) {
    proposalList.value[idx].like = data.like ?? proposalList.value[idx].like;
    proposalList.value[idx].likeCnt = data.likeCnt ?? proposalList.value[idx].likeCnt;
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

function likeProposal(target: string) {
  const proposal = proposalList.value.find(p => p.id === target);
  if (!proposal) return;

  http.LikeController.likeCreate(target, {
    targetId: target,
    targetType: 'proposal'
  }).then((res) => {
    console.log('[DEBUG] likeProposal response:', JSON.stringify(res.data));
    if (res.data?.code === 0) {
      const isLiked = res.data?.like ?? res.data?.data?.like ?? !proposal.like;
      const newCnt = res.data?.likeCnt ?? res.data?.data?.likeCnt ?? (isLiked ? (proposal.likeCnt || 0) + 1 : (proposal.likeCnt || 1) - 1);
      console.log('[DEBUG] likeProposal result: isLiked=', isLiked, 'newCnt=', newCnt, 'oldCnt=', proposal.likeCnt);
      proposal.like = isLiked;
      proposal.likeCnt = newCnt;
      uni.$emit('proposalLikeUpdated', {
        id: target,
        like: isLiked,
        likeCnt: newCnt
      });
    }
  }).catch((err) => {
    console.error('[API] 点赞提案失败:', err);
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
        http.ProposalController.proposalDeleteCreate(proposal.id!).then((res) => {
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

function getStatusText(status?: string): string {
  const statusMap: Record<string, string> = {
    'pending': '待审核',
    'approved': '已通过',
    'rejected': '已下架'
  };
  return statusMap[status || ''] || status || '';
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
  height: 200vw;
  width: 100vw;
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

    .info-row {
      display: flex;
      flex-direction: row;
      align-items: center;
      margin-top: 2vw;

      .info-dot {
        width: 2vw;
        height: 2vw;
        border-radius: 50%;
        background-color: #b70030;
        margin-left: 1vw;
        flex-shrink: 0;
      }

      .info-label {
        margin-left: 1.5vw;
        font-size: 3.2vw;
        color: #999;
        flex-shrink: 0;
      }

      .info-text {
        margin-left: 1vw;
        font-size: 3.5vw;
        color: #555;
      }
    }
  }

  .proposal-content {
    margin-top: 3vw;
    font-size: 3.8vw;
    color: #444;
    line-height: 1.5;
    letter-spacing: 0.3vw;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .proposal-footer {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-top: 3vw;
    padding-top: 3vw;
    border-top: 1px solid #f0f0f0;

    .like-area {
      display: flex;
      flex-direction: row;
      align-items: center;

      .like-icon {
        width: 5vw;
        height: 5vw;
      }

      .like-count {
        margin-left: 1.5vw;
        font-size: 3.5vw;
        color: #666;
      }
    }

    .delete-area {
      padding: 1.5vw 3vw;
      border-radius: 2vw;
      background-color: #fff1f0;

      .delete-text {
        font-size: 3.2vw;
        color: #ff4d4f;
      }
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
</style>
