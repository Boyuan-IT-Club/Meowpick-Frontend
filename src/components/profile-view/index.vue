<template>
  <view class="profile-container" :class="themeStore.themeClass" :style="{ paddingTop: (menuButtonInfo.top + 15) + 'px' }">

    <!-- 胶囊遮罩：挡住胶囊上方的内容 -->
    <view class="capsule-mask" :class="themeStore.themeClass" :style="{ height: (menuButtonInfo.top + menuButtonInfo.height + 15) + 'px' }" />

    <!-- 底层：头像 + 昵称 + 贡献值（被上方"我的发布"组件覆盖） -->
    <view class="user-info-layer">
      <view class="avatar-circle">
        <text class="avatar-emoji">👤</text>
      </view>
      <view class="user-meta">
        <text class="user-nickname">{{ userName || '同学' }}</text>
        <text class="user-contribution">贡献值：{{ contribution || 0 }}</text>
      </view>
      <view class="user-more-btn" @click="toggleMoreMenu">
        <view class="line"></view>
        <view class="line"></view>
        <view class="line"></view>
      </view>
    </view>

    <!-- 顶层："我的发布"组件（圆角矩形，覆盖底层） -->
    <view class="my-publish-card">
      <!-- 标题 -->
      <view class="my-publish-header">
        <text class="page-title">我的发布</text>
        <text class="sub-title">{{ loading ? '加载中...' : (filteredList.length + ' 条记录') }}</text>
      </view>

      <!-- 筛选胶囊 -->
      <view class="sticky-bar">
        <view class="filter-row-wrapper">
          <view class="filter-row">
            <view
              class="filter-pill"
              :class="{ active: currentFilter === 'all' }"
              @click="setFilter('all')"
            >
              <text>全部</text>
            </view>
            <view
              class="filter-pill"
              :class="{ active: currentFilter === 'comment' }"
              @click="setFilter('comment')"
            >
              <text>吐槽</text>
            </view>
            <view
              class="filter-pill"
              :class="{ active: currentFilter === 'proposal' }"
              @click="setFilter('proposal')"
            >
              <text>提议</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 列表 -->
      <view class="list-container">
        <!-- 加载状态 -->
        <view class="loading-state" v-if="loading">
          <view class="loading-spinner"></view>
          <text class="loading-text">加载中...</text>
        </view>

        <!-- 错误状态 -->
        <view class="error-state" v-else-if="error">
          <text class="error-text">加载失败</text>
          <button class="retry-btn" @click="loadData">重试</button>
        </view>

        <!-- 空状态 -->
        <view class="empty-tip" v-else-if="filteredList.length === 0">
          <text>这里空空如也~</text>
        </view>

        <view
          v-else
          v-for="(item, index) in filteredList"
          :key="item.id"
          class="list-item"
          @click="onItemClick(item)"
          @longpress="onLongPress(item)"
        >
          <!-- Comment Item -->
          <view v-if="item.type === 'comment'" class="card comment-card">
            <view class="card-main">
              <view class="course-row-top">
                <text class="course-name">{{ item.courseName }}</text>
                <text class="time-text">{{ item.time }}</text>
              </view>
              <view class="course-row-middle">
                <view class="course-info-item">
                  <image src="@/images/depart-icon.png" class="info-icon" />
                  <text>未知院系</text>
                </view>
              </view>
              <text class="content-text">{{ item.content }}</text>
              <view class="footer-row">
                <view class="likes-box">
                  <image src="@/images/like-icon.png" class="like-icon" />
                  <text class="likes-text">{{ item.likes || 0 }}</text>
                </view>
              </view>
            </view>
          </view>

          <!-- Proposal Item -->
          <view v-if="item.type === 'proposal'" class="card proposal-card">
            <view class="card-main">
              <view class="course-row-top">
                <text class="course-name">{{ item.courseName }}</text>
                <text class="time-text">{{ item.time }}</text>
              </view>
              <view class="course-row-middle">
                <view class="course-info-item">
                  <image src="@/images/depart-icon.png" class="info-icon" />
                  <text>未知院系</text>
                </view>
              </view>
              <text class="content-text">{{ item.reason }}</text>
              <view class="footer-row">
                <view class="vote-count-box">
                  <image src="@/images/like_active.png" class="vote-icon" />
                  <text class="vote-num">{{ item.voteCount || 0 }}</text>
                  <text class="vote-label">支持</text>
                </view>
                <text
                  class="status-badge"
                  :class="{
                    'status-approved': item.status === 'approved',
                    'status-rejected': item.status === 'rejected',
                    'status-pending': item.status === 'pending'
                  }"
                >
                  {{ item.status === 'approved' ? '已采纳' : item.status === 'rejected' ? '已拒绝' : '投票中' }}
                </text>
              </view>
            </view>
          </view>
        </view>

        <!-- Bottom Spacer for FAB -->
        <view style="height: 160rpx;"></view>
      </view>
    </view>

    <!-- 首次使用引导弹窗 -->
    <view v-if="showGuide" class="guide-overlay" :class="themeStore.themeClass" @click="hideGuide">
      <view class="guide-content" @click.stop>
        <view class="guide-header">
          <text class="guide-title">欢迎来到"我的发布" 🎉</text>
          <text class="guide-subtitle">管理你的吐槽和提议</text>
        </view>
        <view class="guide-sections">
          <view class="guide-section">
            <view class="section-icon">📝</view>
            <view class="section-text">
              <text class="section-title">吐槽 & 提议</text>
              <text class="section-desc">这里汇总了你发布的所有吐槽和提议，可按类型筛选查看</text>
            </view>
          </view>
          <view class="guide-section">
            <view class="section-icon">➕</view>
            <view class="section-text">
              <text class="section-title">新增内容</text>
              <text class="section-desc">点击右下角 "+" 按钮，可以新增吐槽或发起新课程提议</text>
            </view>
          </view>
          <view class="guide-section">
            <view class="section-icon">✋</view>
            <view class="section-text">
              <text class="section-title">长按操作</text>
              <text class="section-desc">长按任意记录可查看详情、修改或删除（提议有投票时修改会清空票数）</text>
            </view>
          </view>
        </view>
        <view class="guide-footer">
          <button class="start-btn" @click="hideGuide">我知道了</button>
        </view>
      </view>
    </view>

<!-- Floating Action Button -->
    <view class="fab-btn" @click="onAddClick">
      <view class="plus-icon">+</view>
    </view>

    <!-- More Menu Popover (页面层级，覆盖在所有内容之上) -->
    <view v-if="showMoreMenu" class="more-menu-popover" :class="themeStore.themeClass" @click.stop>
      <view class="menu-item" @click="handleMenuClick('theme')">切换深色模式</view>
      <view class="menu-item" @click="handleMenuClick('feed')">提议广场</view>
      <view class="menu-item" @click="handleMenuClick('nickname')">修改昵称</view>
      <view class="menu-item" @click="handleMenuClick('feedback')">反馈</view>
    </view>

<!-- External click mask -->
    <view v-if="showMoreMenu" class="more-menu-mask" @click="showMoreMenu = false"></view>
  </view>

<!-- Floating Action Button -->
  <view class="fab-btn" @click="onAddClick">
    <view class="plus-icon">+</view>
  </view>

  <!-- Nickname Edit Modal (页面层级) -->
  <view v-if="showNicknameModal" class="modal-overlay" @click="closeNicknameModal">
    <view class="modal-card" :class="themeStore.themeClass" @click.stop>
      <view class="modal-header">
        <text class="modal-title">修改昵称</text>
        <view class="modal-close" @click="closeNicknameModal">×</view>
      </view>

      <view class="modal-body">
        <text class="field-label">昵称</text>
        <input
          class="nickname-input"
          v-model="newNickname"
          :maxlength="20"
          placeholder="请输入新昵称"
        />
        <text class="word-count">{{ newNickname.length }}/20</text>
      </view>

      <view class="modal-footer">
        <view class="btn-cancel" @click="closeNicknameModal">取消</view>
        <view class="btn-confirm" :class="{ disabled: submittingNickname }" @click="confirmNicknameChange">
          {{ submittingNickname ? '提交中...' : '确认' }}
        </view>
      </view>
    </view>
  </view>

<!-- Feedback Modal (共用组件) -->
<feedback-modal v-model:visible="showFeedbackModal" />
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
.profile-container {
    position: relative;
    padding-right: 0;
    min-height: 100vh;
    box-sizing: border-box;
    background-color: #f7f8fa;
}

.capsule-mask {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    background-color: #f7f8fa;
    z-index: 99;
    pointer-events: none;
}

/* 底层：用户信息层（被"我的发布"组件覆盖） */
.user-info-layer {
    position: relative;
    z-index: 1;
    padding: 40rpx 40rpx 48rpx;
    display: flex;
    align-items: center;
    gap: 28rpx;
    background-color: #f7f8fa;
    min-height: 220rpx;
}

.avatar-circle {
    width: 136rpx;
    height: 136rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #ffe2e8 0%, #ffd4d4 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 6rpx 20rpx rgba(178, 0, 53, 0.18);
}

.avatar-emoji {
    font-size: 76rpx;
    line-height: 1;
}

.user-meta {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10rpx;
    min-width: 0;
}

.user-nickname {
    font-size: 56rpx;
    font-weight: 800;
    color: #1f1f1f;
    letter-spacing: -2rpx;
    line-height: 1.2;
}

.user-contribution {
    font-size: 32rpx;
    color: #999;
    font-weight: 400;
}

.user-more-btn {
    width: 64rpx;
    height: 64rpx;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 7rpx;
    background-color: #ffffff;
    border-radius: 100rpx;
    box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.06);
    flex-shrink: 0;
    transition: transform 0.12s;

    &:active {
        transform: scale(0.94);
    }

    .line {
        width: 30rpx;
        height: 3rpx;
        background-color: #666;
        border-radius: 2rpx;
        display: block;
    }
}

/* 顶层："我的发布"组件（圆角矩形覆盖底层） */
.my-publish-card {
    position: relative;
    z-index: 10;
    background-color: #ffffff;
    border-radius: 36rpx 36rpx 0 0;
    box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.06);
    margin-top: -24rpx; /* 让圆角与底层视觉重叠 */
    padding-top: 32rpx;
    min-height: calc(100vh - 220rpx);
    transition: transform 0.05s linear;
}

/* 标题栏 */
.my-publish-header {
    padding: 0 40rpx 16rpx;

    .page-title {
        font-size: 44rpx;
        font-weight: 800;
        color: #1f1f1f;
        letter-spacing: -1rpx;
        display: block;
    }

    .sub-title {
        font-size: 24rpx;
        color: #999;
        margin-top: 4rpx;
        display: block;
    }
}

/* 1. Header (已迁移至 my-publish-header) */

/* 2. Filter Bar: 在 my-publish-card 内部，普通 block 布局 */
.sticky-bar {
    padding: 16rpx 40rpx 8rpx;
    background-color: transparent;

    .filter-row-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
    }

    .filter-row {
        display: inline-flex;
        align-items: center;
        background: #fff;
        border-radius: 100rpx;
        padding: 0 6rpx;
        box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.06);
    }

    .filter-pill {
        padding: 0 24rpx;
        border-radius: 60rpx;
        font-size: 28rpx;
        font-weight: 500;
        color: #666;
        transition: all 0.12s cubic-bezier(0.25, 0.8, 0.25, 1);
        box-sizing: border-box;
        height: 64rpx;
        line-height: 64rpx;

        &.active {
            background: linear-gradient(135deg, #b20035, #ff4d6a);
            color: #fff;
            font-weight: 600;
            box-shadow: 0 6rpx 16rpx rgba(183, 0, 48, 0.3);
        }
    }

    /* ⋯ 按钮 - 与筛选胶囊同一行，胶囊风格完全一致 */
    .more-btn-pill {
        position: relative; /* 让 popover 相对此按钮定位 */
        width: 64rpx;
        height: 64rpx;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 7rpx;
        background: #fff;
        border-radius: 100rpx;
        box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
        transition: transform 0.12s, box-shadow 0.12s;
        flex-shrink: 0;

        &:active {
            transform: scale(0.96);
        }

        .line {
            width: 28rpx;
            height: 3rpx;
            background-color: #666;
            border-radius: 2rpx;
            display: block;
        }
    }

    /* Popover - 固定在 ⋯ 按钮位置（页面层级） */
    .more-menu-popover {
        position: fixed;
        top: 180rpx;
        right: 24rpx;
        background-color: #ffffff;
        border-radius: 24rpx;
        box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.15);
        padding: 12rpx 0;
        z-index: 1500;
        min-width: 240rpx;
        overflow: hidden;

        .menu-item {
            padding: 24rpx 32rpx;
            font-size: 28rpx;
            color: #333;
            transition: background-color 0.1s;

            &:active {
                background-color: #f5f5f5;
            }
        }
    }

    /* Mask to close popover on outside tap */
    .more-menu-mask {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 999;
    }
}

.list-container {
    padding: 24rpx 32rpx 40rpx;
}

.card {
    background: #ffffff;
    border-radius: 24rpx;
    box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.05); 
    display: flex;
    overflow: hidden;
    position: relative;
    margin-bottom: 24rpx; 
    border: 1px solid #f0f0f0;
    transition: all 0.12s ease;

    &:active {
        transform: scale(0.96);
        box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.03);
    }

    &.proposal-card {
        background: linear-gradient(135deg, #fff5f6 0%, #ffffff 100%);
        box-shadow: 0 8rpx 24rpx rgba(178, 0, 53, 0.06); 
        border: 1px solid rgba(178, 0, 53, 0.15);

        .course-row-middle {
            background: rgba(255, 255, 255, 0.8);
            border: 1px solid rgba(178, 0, 53, 0.08);
            box-shadow: inset 0 2rpx 8rpx rgba(0,0,0,0.01);
        }
    }

    .card-main {
        flex: 1;
        padding: 32rpx; 
        display: flex;
        flex-direction: column;
    }

    .course-row-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 24rpx;

        .course-name {
            font-size: 36rpx; 
            font-weight: 700;
            color: #1a1a1a; 
            line-height: 1.4;
            flex: 1;
            margin-right: 20rpx;
            letter-spacing: 1rpx;
        }
        .time-text {
            font-size: 24rpx;
            color: #999; 
            font-weight: 400;
            white-space: nowrap;
        }
    }

    .course-row-middle {
        display: flex;
        flex-direction: row; 
        flex-wrap: wrap; 
        align-items: center;
        margin-bottom: 32rpx;
        background: #f8f9fa;
        padding: 20rpx 24rpx;
        border-radius: 16rpx;
        
        .course-info-item {
             display: flex;
             align-items: center;
             font-size: 26rpx;
             color: #555;
             margin-right: 40rpx; 
             font-weight: 500;

             .info-icon {
                  width: 30rpx;
                  height: 30rpx;
                  margin-right: 12rpx;
                  opacity: 0.8; 
             }
        }
    }

    .content-text {
        font-size: 28rpx;
        color: #333; 
        line-height: 1.6; 
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3; 
        overflow: hidden;
        margin-bottom: 24rpx;
        text-align: justify;
    }

    .footer-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px dashed rgba(0,0,0,0.05);
        padding-top: 24rpx;
        
        .likes-box {
            display: flex;
            align-items: center;
            
            .like-icon {
                width: 36rpx;
                height: 36rpx;
                margin-right: 8rpx;
                opacity: 0.6;
            }
            .likes-text {
                font-size: 26rpx;
                color: #666;
            }
        }

        .vote-count-box {
             display: flex;
             align-items: center;
             background: linear-gradient(90deg, #fff0f2, #fff5f6);
             padding: 10rpx 24rpx;
             border-radius: 30rpx;
             border: 1px solid rgba(178, 0, 53, 0.05);
             
             .vote-icon {
                  width: 30rpx;
                  height: 30rpx;
                  margin-right: 12rpx;
             }
             .vote-num {
                  font-size: 32rpx;
                  font-weight: 800;
                  color: #b20035;
                  margin-right: 6rpx;
             }
             .vote-label {
                  font-size: 24rpx;
                  color: #b20035;
                  opacity: 0.9;
                  font-weight: 500;
             }
        }

        .status-badge {
            padding: 10rpx 20rpx;
            border-radius: 30rpx;
            font-size: 24rpx;
            font-weight: 600;
            
            &.status-pending {
                background: linear-gradient(90deg, rgba(0, 102, 204, 0.08), rgba(0, 102, 204, 0.04));
                color: #0066cc;
                border: 1px solid rgba(0, 102, 204, 0.05);
            }
            &.status-approved {
                background: linear-gradient(90deg, rgba(56, 142, 60, 0.08), rgba(56, 142, 60, 0.04));
                color: #388E3C;
                border: 1px solid rgba(56, 142, 60, 0.05);
            }
            &.status-rejected {
                background: linear-gradient(90deg, rgba(178, 0, 53, 0.08), rgba(178, 0, 53, 0.04));
                color: #b20035;
                border: 1px solid rgba(178, 0, 53, 0.05);
            }
        }
    }
}

.fab-btn {
    position: fixed;
    right: 40rpx;
    bottom: 200rpx; /* Above bottom tab bar */
    width: 110rpx;
    height: 110rpx;
    background: linear-gradient(135deg, #b20035, #ff4d6a);
    border-radius: 50%;
    box-shadow: 0 8rpx 30rpx rgba(178, 0, 53, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    transition: transform 0.05s;

    &:active {
        transform: scale(0.94);
    }

    .plus-icon {
        color: #fff;
        font-size: 60rpx;
        font-weight: 300;
        margin-top: -8rpx;
    }
}

// 加载状态
.empty-tip {
    padding: 200rpx 0;
    text-align: center;

    text {
        font-size: 28rpx;
        color: #999999;
    }
}

.loading-state {
    width: 100%;
    padding: 200rpx 0;
    text-align: center;

    .loading-spinner {
        width: 80rpx;
        height: 80rpx;
        margin: 0 auto 24rpx;
        border: 4rpx solid #ddd;
        border-top-color: #b20035;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    .loading-text {
        font-size: 28rpx;
        color: #666;
    }
}

// 错误状态
.error-state {
    width: 100%;
    padding: 200rpx 0;
    text-align: center;

    .error-text {
        font-size: 28rpx;
        color: #f43f30;
        display: block;
        margin-bottom: 32rpx;
    }

    .retry-btn {
        background: linear-gradient(135deg, #b20035, #ff4d6a);
        color: white;
        border-radius: 24rpx;
        font-size: 28rpx;
        padding: 16rpx 48rpx;
        border: none;
    }
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* Modal: Nickname & Feedback (shared base styles) */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40rpx;
}

.modal-card {
    width: 100%;
    max-width: 600rpx;
    background-color: #ffffff;
    border-radius: 24rpx;
    overflow: hidden;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 32rpx;
    border-bottom: 1rpx solid #f0f0f0;

    .modal-title {
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
    }

    .modal-close {
        font-size: 40rpx;
        color: #999;
        width: 48rpx;
        height: 48rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
    }
}

.modal-body {
    padding: 32rpx;
}

.field-label {
    font-size: 28rpx;
    color: #666;
    margin-bottom: 16rpx;
    display: block;
}

.nickname-input {
    width: 100%;
    height: 80rpx;
    background-color: #f5f5f5;
    border-radius: 12rpx;
    padding: 0 24rpx;
    font-size: 28rpx;
    color: #333;
    box-sizing: border-box;
}

.word-count {
    font-size: 22rpx;
    color: #999;
    text-align: right;
    margin-top: 8rpx;
    display: block;
}

.modal-footer {
    display: flex;
    border-top: 1rpx solid #f0f0f0;

    .btn-cancel,
    .btn-confirm {
        flex: 1;
        height: 96rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 30rpx;
        transition: opacity 0.15s;
    }

    .btn-cancel {
        color: #666;
    }

    .btn-confirm {
        color: #b20035;
        font-weight: 600;
        border-left: 1rpx solid #f0f0f0;

        &:active {
            background-color: rgba(178, 0, 53, 0.05);
        }

        &.disabled {
            opacity: 0.5;
            pointer-events: none;
        }
    }
}

/* Feedback Modal Styles 已迁移至 components/feedback/feedback-modal.vue */
</style>

<style lang="scss">
.profile-container.dark-theme { background-color: #121212 !important; }
.profile-container.dark-theme .capsule-mask { background-color: #121212; }

/* User info layer dark mode */
.profile-container.dark-theme .user-info-layer { background-color: #121212; }
.profile-container.dark-theme .avatar-circle { background: linear-gradient(135deg, #4a2828 0%, #6a3838 100%); box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.4); }
.profile-container.dark-theme .user-nickname { color: #e0e0e0; }
.profile-container.dark-theme .user-contribution { color: #888; }
.profile-container.dark-theme .user-more-btn { background-color: #2a2a2a; box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.3); .line { background-color: #e0e0e0; } &:active { background-color: #3a3a3a; } }

/* My publish card dark mode */
.profile-container.dark-theme .my-publish-card { background-color: #1e1e1e; box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.3); }

/* Sticky bar dark mode (now transparent background) */
.profile-container.dark-theme .sticky-bar .filter-row { background: #2a2a2a; }
.profile-container.dark-theme .sticky-bar .filter-pill { color: #888; }
.profile-container.dark-theme .list-container { padding: 24rpx 32rpx 40rpx; }
.profile-container.dark-theme .list-item { background: transparent; }
.profile-container.dark-theme .card { background: #1e1e1e !important; border-color: #333; box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.3); }
.profile-container.dark-theme .card .card-main { background: transparent; }
.profile-container.dark-theme .card .course-row-top .course-name { color: #e0e0e0; }
.profile-container.dark-theme .card .course-row-top .time-text { color: #666; }
.profile-container.dark-theme .card .course-row-middle { background: #2a2a2a !important; }
.profile-container.dark-theme .card .course-row-middle .course-info-item { color: #999; }
.profile-container.dark-theme .card .content-text { color: #ccc; }
.profile-container.dark-theme .card .footer-row { border-color: rgba(255,255,255,0.05); }
.profile-container.dark-theme .card .footer-row .likes-text { color: #888; }
.profile-container.dark-theme .card .footer-row .likes-box { background: transparent; }
.profile-container.dark-theme .card.proposal-card { background: linear-gradient(135deg, #1a0a0e 0%, #1e1e1e 100%) !important; border-color: rgba(178,0,53,0.2); }
.profile-container.dark-theme .card.proposal-card .course-row-middle { background: rgba(30,30,30,0.5) !important; border-color: rgba(178,0,53,0.1); }
.profile-container.dark-theme .card.proposal-card .vote-count-box { background: linear-gradient(90deg, #2a1a1e, #1e1e1e); }
.profile-container.dark-theme .empty-tip text { color: #555; }
.profile-container.dark-theme .loading-state .loading-text { color: #888; }
.profile-container.dark-theme .error-state .error-text { color: #ff6b6b; }
.profile-container.dark-theme .status-badge.status-pending { background: rgba(0, 102, 204, 0.2); color: #4da6ff; border-color: rgba(0, 102, 204, 0.2); }
.profile-container.dark-theme .status-badge.status-approved { background: rgba(56, 142, 60, 0.2); color: #66bb6a; border-color: rgba(56, 142, 60, 0.2); }
.profile-container.dark-theme .status-badge.status-rejected { background: rgba(178, 0, 53, 0.2); color: #ff6b8a; border-color: rgba(178, 0, 53, 0.2); }

.dark-theme .guide-overlay { background-color: rgba(0,0,0,0.45); }
.guide-overlay.dark-theme { background-color: rgba(0,0,0,0.45); }
.guide-overlay.dark-theme .guide-content { background-color: #2a2a2a; }
.guide-overlay.dark-theme .guide-header .guide-title { color: #e0e0e0; }
.guide-overlay.dark-theme .guide-header .guide-subtitle { color: #888; }
.guide-overlay.dark-theme .guide-section .section-icon { background-color: #2a2a2a; }
.guide-overlay.dark-theme .guide-section .section-title { color: #e0e0e0; }
.guide-overlay.dark-theme .guide-section .section-desc { color: #888; }
.dark-theme .guide-overlay.dark-theme .guide-footer .start-btn { opacity: 0.85; }

.profile-container.dark-theme .sticky-bar .filter-pill.active { color: #fff; }
.profile-container.dark-theme .loading-state .loading-spinner { border-color: #333; border-top-color: #b20035; }
.profile-container.dark-theme .fab-btn { box-shadow: 0 8rpx 30rpx rgba(178, 0, 53, 0.5); }

/* More Menu Dark Mode - ⋯ 按钮现已在 user-info-layer 内 */
.profile-container.dark-theme .user-more-btn { background-color: #2a2a2a; box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.3); .line { background-color: #e0e0e0; } &:active { background-color: #3a3a3a; } }
.profile-container.dark-theme .more-menu-popover { background-color: #2a2a2a; box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.5); }
.profile-container.dark-theme .more-menu-popover .menu-item { color: #e0e0e0; }
.profile-container.dark-theme .more-menu-popover .menu-item:active { background-color: #3a3a3a; }

/* Nickname Modal Dark Mode */
.modal-card.dark-theme { background-color: #1e1e1e; }
.modal-card.dark-theme .modal-header { border-color: #333; .modal-title { color: #e0e0e0; } .modal-close { color: #888; } }
.modal-card.dark-theme .modal-body { .field-label { color: #aaa; } .nickname-input { background-color: #2a2a2a; color: #e0e0e0; } }
.modal-card.dark-theme .modal-footer { border-color: #333; .btn-confirm { border-color: #333; } }

/* Feedback Modal Dark Mode 已迁移至 components/feedback/feedback-modal.vue */

.guide-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  box-sizing: border-box;
}

.guide-content {
  width: 100%;
  max-width: 600rpx;
  background-color: #ffffff;
  border-radius: 32rpx;
  padding: 48rpx 40rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.3);
}

.guide-header {
  text-align: center;
  margin-bottom: 48rpx;

  .guide-title {
    display: block;
    font-size: 44rpx;
    font-weight: 800;
    color: #1a1a1a;
    margin-bottom: 16rpx;
  }

  .guide-subtitle {
    display: block;
    font-size: 26rpx;
    color: #999;
  }
}

.guide-sections {
  margin-bottom: 48rpx;
}

.guide-section {
  display: flex;
  align-items: flex-start;
  margin-bottom: 36rpx;

  &:last-child {
    margin-bottom: 0;
  }

  .section-icon {
    width: 80rpx;
    height: 80rpx;
    background-color: #fff5f7;
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40rpx;
    margin-right: 24rpx;
    flex-shrink: 0;
  }

  .section-text {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .section-title {
    font-size: 30rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 8rpx;
  }

  .section-desc {
    font-size: 24rpx;
    color: #888;
    line-height: 1.5;
  }
}

.guide-footer {
  .start-btn {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    background: linear-gradient(135deg, #b20035, #ff4d6a);
    color: #fff;
    font-size: 32rpx;
    font-weight: 600;
    border-radius: 44rpx;
    border: none;
    box-shadow: 0 8rpx 24rpx rgba(178, 0, 53, 0.3);

    &:active {
      transform: scale(0.98);
      opacity: 0.9;
    }
  }
}
</style>
