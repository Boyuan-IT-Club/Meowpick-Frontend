<template>
  <view class="log-page">
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + navBarHeight) + 'px' }">
      <view class="nav-bar" :style="{ height: navBarHeight + 'px' }">
        <view class="back-btn" @click="goBack">
          <image src="@/images/go-back.png" mode="aspectFit" class="back-icon" />
        </view>
        <text class="title">操作记录</text>
      </view>
    </view>

    <scroll-view
      scroll-y
      class="scroll-container"
      :style="{ paddingTop: (statusBarHeight + navBarHeight + 20) + 'px' }"
      @scrolltolower="loadMore"
    >
      <view class="safe-padding">
        <view v-if="logs.length > 0" class="timeline">
          <view v-for="(log, index) in logs" :key="log.logId" class="timeline-item">
            <view class="timeline-axis">
              <view class="timeline-dot" :class="getActionClass(log.actionType)"></view>
              <view v-if="index !== logs.length - 1" class="timeline-line"></view>
            </view>
            
            <view class="timeline-content log-card" @click="toggleCard(log.logId)">
              <view class="log-header">
                <text class="course-name">{{ log.proposalSnapshot?.courseName || log.proposalSnapshot?.title || '未知课程' }}</text>
                <view style="display: flex; align-items: center;">
                  <text class="action-badge" :class="getActionClass(log.actionType)">
                    {{ getActionText(log.actionType) }}
                  </text>
                  <image 
                    src="@/images/arrow-down.png" 
                    mode="aspectFit" 
                    class="chevron-icon"
                    :class="{ 'expanded': expandedId === log.logId }" 
                  />
                </view>
              </view>

              <view class="log-info">
                <view class="info-row">
                  <text class="label">操作人：</text>
                  <text class="val">{{ log.operatorId || log.operatorName || '未知' }}</text>
                </view>
                <view class="info-row time-row">
                  <text class="label">处理时间：</text>
                  <text class="val">{{ formatTime(log.actionTime) }}</text>
                </view>
              </view>

              <view class="expand-area" :class="{ 'is-expanded': expandedId === log.logId }">
                <view class="detail-content">
                  <view class="tags-group">
                    <view class="tag-item" v-if="log.proposalSnapshot?.category">{{ log.proposalSnapshot.category }}</view>
                    <view class="tag-item" v-if="log.proposalSnapshot?.department">{{ log.proposalSnapshot.department }}</view>
                  </view>

                  <view class="detail-row" v-if="log.details?.teachers">
                    <text class="d-label">开课教师：</text>
                    <text class="d-val">{{ Array.isArray(log.details.teachers) ? log.details.teachers.join('、') : log.details.teachers }}</text>
                  </view>

                  <view class="detail-row" v-if="log.details?.campuses">
                    <text class="d-label">开课校区：</text>
                    <text class="d-val">{{ Array.isArray(log.details.campuses) ? log.details.campuses.join('、') : log.details.campuses }}</text>
                  </view>

                  <view class="detail-row reason-box" v-if="log.details?.content || log.details?.reason">
                    <text class="d-label">提议说明：</text>
                    <text class="d-val reason-text">{{ log.details.content || log.details.reason }}</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view v-else-if="!loading" class="empty-state">
          <image src="@/images/cat.png" mode="aspectFit" class="empty-icon" />
          <text class="empty-text">暂无相关的操作记录喵~</text>
        </view>

        <view v-if="loading" class="loading-state">
          <view class="loading-spinner"></view>
          <text class="loading-text">加载中...</text>
        </view>

        <view v-if="noMore && logs.length > 0" class="no-more">
          <text class="no-more-text">没有更多了</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { http } from '@/config';

interface TimelineLog {
  logId: string;
  proposalId: string;
  actionType: string;
  actionTime: string;
  operatorId: string;
  operatorName: string;
  proposalSnapshot?: {
    courseName?: string;
    title?: string;
    department?: string;
    category?: string;
  };
  details?: Record<string, any>;
}

const sysInfo = uni.getSystemInfoSync();
const statusBarHeight = sysInfo.statusBarHeight || 44;
const navBarHeight = 44;

const logs = ref<TimelineLog[]>([]);
const expandedId = ref<string | null>(null);
const loading = ref(false);
const page = ref(0);
const pageSize = 20;
const noMore = ref(false);

const toggleCard = (id: string) => {
  if (expandedId.value === id) {
    expandedId.value = null;
  } else {
    expandedId.value = id;
  }
};

const formatTime = (timeStr: string | undefined): string => {
  if (!timeStr) return '--';
  try {
    let normalized = timeStr;
    if (!normalized.includes('Z') && !normalized.includes('+') && !normalized.includes('T')) {
      normalized = normalized.replace(' ', 'T') + 'Z';
    } else if (normalized.includes('T') && !normalized.includes('Z') && !normalized.includes('+')) {
      normalized = normalized + 'Z';
    }
    const date = new Date(normalized);
    if (isNaN(date.getTime())) return timeStr;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  } catch {
    return timeStr;
  }
};

const getActionClass = (actionType: string): string => {
  const map: Record<string, string> = {
    'CREATE': 'new',
    'APPROVE': 'approve',
    'REJECT': 'reject',
    'DELETE': 'reject',
    'UPDATE': 'new',
    'GRANT_ADMIN': 'approve',
    'REVOKE_ADMIN': 'reject',
    'REVOKE': 'revoke',
    'REVOKE_APPROVAL': 'revoke',
    'REVOKE_PROPOSAL': 'revoke',
    'UNKNOWN': 'revoke'
  };
  return map[actionType] || 'new';
};

const getActionText = (actionType: string): string => {
  const map: Record<string, string> = {
    'CREATE': '新增提案',
    'APPROVE': '已通过',
    'REJECT': '已驳回',
    'DELETE': '已删除',
    'UPDATE': '已更新',
    'GRANT_ADMIN': '授权管理员',
    'REVOKE_ADMIN': '撤销管理员',
    'REVOKE': '撤销',
    'REVOKE_APPROVAL': '撤销',
    'REVOKE_PROPOSAL': '撤销',
    'UNKNOWN': '撤销'
  };
  return map[actionType] || actionType;
};

const fetchLogs = async (pageNum: number) => {
  if (loading.value || noMore.value) return;
  loading.value = true;

  try {
    const res = await http.ChangeLogController.changelogProposalTimelineList({
      page: pageNum,
      pageSize
    });

    if (res.data?.code === 0) {
      const responseData = res.data.data || res.data;
      const newLogs = responseData?.logs || [];
      if (pageNum === 0) {
        logs.value = newLogs;
      } else {
        logs.value = [...logs.value, ...newLogs];
      }
      const total = responseData?.total;
      const hasValidTotal = typeof total === 'number' && total >= logs.value.length;
      noMore.value = hasValidTotal ? logs.value.length >= total : newLogs.length < pageSize;
    } else {
      if (pageNum === 0) {
        logs.value = [];
      }
      noMore.value = true;
    }
  } catch (err) {
    console.error('[API] 获取日志失败:', err);
    if (pageNum === 1) {
      logs.value = [];
    }
    noMore.value = true;
  } finally {
    loading.value = false;
  }
};

const loadMore = () => {
  if (!noMore.value && !loading.value) {
    page.value++;
    fetchLogs(page.value);
  }
};

onLoad(() => {
  page.value = 0;
  noMore.value = false;
  fetchLogs(0);
});

const goBack = () => {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
  } else {
    uni.switchTab({ url: '/pages/index/index' });
  }
};
</script>

<style scoped lang="scss">
.log-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  display: flex;
  flex-direction: column;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: #b70030;
  z-index: 100;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1); 
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 0 16px;

  .back-btn {
    position: absolute;
    left: 12px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    
    .back-icon {
      width: 18px;
      height: 18px;
      filter: brightness(0) invert(1);
    }
  }

  .title {
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
    letter-spacing: 0.5px;
  }
}

.scroll-container {
  flex: 1;
  height: 100vh;
  box-sizing: border-box;
}

.safe-padding {
  padding: 0 16px 24px;
}

.timeline {
  display: flex;
  flex-direction: column;
}

.timeline-item {
  display: flex;
  flex-direction: row;
  position: relative;
}

.timeline-axis {
  position: relative;
  width: 20px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 14px;
}

.timeline-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #d9d9d9;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px #f0f0f0;
  z-index: 2;

  &.new {
    background-color: #1890ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.15);
  }
  &.approve {
    background-color: #52c41a;
    box-shadow: 0 0 0 2px rgba(82, 196, 26, 0.15);
  }
  &.reject {
    background-color: #ff4d4f;
    box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.15);
  }
  &.revoke {
    background-color: #fa8c16;
    box-shadow: 0 0 0 2px rgba(250, 140, 22, 0.15);
  }
}

.timeline-line {
  position: absolute;
  top: 16px;
  bottom: -14px;
  width: 1px;
  background-color: #e6e6e6;
  z-index: 1;
}

.timeline-content {
  flex: 1;
  margin-left: 8px;
  margin-bottom: 14px;
}

.log-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
  border: 1px solid #f2f2f2;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;

  .course-name {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    line-height: 1.3;
    flex: 1;
    margin-right: 8px;
    word-break: break-all;
  }
}

.chevron-icon {
  width: 14px;
  height: 14px;
  margin-left: 6px;
  opacity: 0.4;
  transition: transform 0.3s ease;

  &.expanded {
    transform: rotate(180deg);
  }
}

.action-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
  white-space: nowrap;

  &.new {
    background-color: rgba(24, 144, 255, 0.08);
    color: #1890ff;
  }
  &.approve {
    background-color: rgba(82, 196, 26, 0.08);
    color: #52c41a;
  }
  &.reject {
    background-color: rgba(255, 77, 79, 0.08);
    color: #ff4d4f;
  }
  &.revoke {
    background-color: rgba(250, 140, 22, 0.08);
    color: #fa8c16;
  }
}

.log-info {
  background: #fafafa;
  border-radius: 6px;
  padding: 8px;

  .info-row {
    display: flex;
    font-size: 11px;
    line-height: 1.5;
    
    .label {
      color: #888;
      width: 60px;
    }
    
    .val {
      color: #444;
      flex: 1;
    }
  }

  .time-row {
    margin-top: 4px;
  }
}

.expand-area {
  overflow: hidden;
  max-height: 0;
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: 0;

  &.is-expanded {
    max-height: 300px;
    opacity: 1;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px dashed #f0f0f0;
  }
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tags-group {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 2px;
}

.tag-item {
  font-size: 11px;
  padding: 4px 8px;
  background: rgba(183, 0, 48, 0.05);
  color: #b70030;
  border-radius: 4px;
}

.detail-row {
  display: flex;
  font-size: 12px;
  line-height: 1.5;

  .d-label {
    color: #888;
    width: 65px;
    flex-shrink: 0;
  }
  
  .d-val {
    color: #333;
    flex: 1;
    word-break: break-all;
  }
}

.reason-box {
  background: #fcfcfc;
  padding: 8px;
  border-radius: 6px;
  margin-top: 4px;
  border: 1px solid #f2f2f2;

  .reason-text {
    color: #555;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;

  .empty-icon {
    width: 120px;
    height: 120px;
    margin-bottom: 12px;
    opacity: 0.8;
  }

  .empty-text {
    font-size: 13px;
    color: #999;
  }
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;

  .loading-spinner {
    width: 24px;
    height: 24px;
    border: 2px solid #ddd;
    border-top-color: #b70030;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 8px;
  }

  .loading-text {
    font-size: 12px;
    color: #999;
  }
}

.no-more {
  display: flex;
  justify-content: center;
  padding: 16px 0;

  .no-more-text {
    font-size: 12px;
    color: #ccc;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
