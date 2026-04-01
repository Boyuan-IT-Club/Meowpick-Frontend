<!-- d:\MeowPick\Meowpick-Frontend\src\pages\proposal\log.vue -->
<template>
  <view class="log-page">
    <!-- 自定义导航栏 -->
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + navBarHeight) + 'px' }">
      <view class="nav-bar" :style="{ height: navBarHeight + 'px' }">
        <view class="back-btn" @click="goBack">
          <image src="@/images/go-back.png" mode="aspectFit" class="back-icon" />
        </view>
        <text class="title">操作记录</text>
      </view>
    </view>

    <!-- 主体内容区 -->
    <scroll-view
      scroll-y
      class="scroll-container"
      :style="{ paddingTop: (statusBarHeight + navBarHeight + 20) + 'px' }"
    >
      <view class="safe-padding">
        <!-- 时间轴布局 -->
        <view v-if="logs.length > 0" class="timeline">
          <view v-for="(log, index) in logs" :key="log.id" class="timeline-item">
            <!-- 轴线区 -->
            <view class="timeline-axis">
              <view class="timeline-dot" :class="log.action"></view>
              <view v-if="index !== logs.length - 1" class="timeline-line"></view>
            </view>
            
            <!-- 卡片区 -->
            <view class="timeline-content log-card" @click="toggleCard(log.id)">
              <view class="log-header">
                <text class="course-name">{{ log.courseName }}</text>
                <view style="display: flex; align-items: center;">
                  <text class="action-badge" :class="log.action">
                    {{ getActionText(log.action) }}
                  </text>
                  <image 
                    src="@/images/arrow-down.png" 
                    mode="aspectFit" 
                    class="chevron-icon"
                    :class="{ 'expanded': expandedId === log.id }" 
                  />
                </view>
              </view>

              <view class="log-info">
                <view class="info-row">
                  <text class="label">操作人：</text>
                  <text class="val">{{ log.operator || '系统' }}</text>
                </view>
                <view class="info-row time-row">
                  <text class="label">处理时间：</text>
                  <text class="val">{{ log.actionTime }}</text>
                </view>
              </view>

              <!-- 展开的详细信息区域 -->
              <view class="expand-area" :class="{ 'is-expanded': expandedId === log.id }">
                <view class="detail-content">
                  <!-- 标签组 -->
                  <view class="tags-group">
                    <view class="tag-item" v-if="log.courseCategory">{{ log.courseCategory }}</view>
                    <view class="tag-item" v-if="log.department">{{ log.department }}</view>
                    <view class="tag-item" v-for="(camp, cIdx) in log.campus" :key="cIdx">{{ camp }}</view>
                  </view>
                  
                  <!-- 教师信息 -->
                  <view class="detail-row" v-if="log.teachers">
                    <text class="d-label">开课教师：</text>
                    <text class="d-val">{{ log.teachers }}</text>
                  </view>

                  <!-- 提议内容/说明 -->
                  <view class="detail-row reason-box" v-if="log.reason">
                    <text class="d-label">提议说明：</text>
                    <text class="d-val reason-text">{{ log.reason }}</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 缺省态 -->
        <view v-else class="empty-state">
          <image src="@/images/cat.png" mode="aspectFit" class="empty-icon" />
          <text class="empty-text">暂无相关的操作记录喵~</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

interface LogEntry {
  id: string;
  proposalId: string;
  courseName: string;
  action: 'new' | 'approve' | 'reject';
  actionTime: string;
  operator: string;
  campus?: string[];
  department?: string;
  teachers?: string;
  courseCategory?: string;
  reason?: string;
}

// 沉浸式导航栏适配
const sysInfo = uni.getSystemInfoSync();
const statusBarHeight = sysInfo.statusBarHeight || 44;
const navBarHeight = 44; // 导航栏内容高度

const logs = ref<LogEntry[]>([]);
const expandedId = ref<string | null>(null); // 控制展开的卡片ID

const toggleCard = (id: string) => {
  if (expandedId.value === id) {
    expandedId.value = null; // 再次点击收起
  } else {
    expandedId.value = id; // 展开
  }
};

onLoad((options: any) => {
  if (options.logs && options.logs !== 'undefined') {
    try {
      logs.value = JSON.parse(decodeURIComponent(options.logs));
    } catch (e) {
      console.error('解析日志列表失败', e);
    }
  } else {
    // 开发环境占位，便于直接看 UI 效果
    if (process.env.NODE_ENV === 'development') {
      logs.value = [
        { id: '12', proposalId: '8', courseName: '计算机组成原理', campus: ['闵行校区'], department: '计算机科学与技术学院', teachers: '王建国', courseCategory: '专业课', reason: '课程内容有部分陈旧，建议更新最新的指令集架构内容，并且日常分占比太低。', action: 'approve', actionTime: '2024-04-01 10:15:00', operator: '管理员' },
      ];
    }
  }
});

const goBack = () => {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
  } else {
    uni.switchTab({ url: '/pages/index/index' });
  }
};

const getActionText = (action: string) => {
  const actionMap: Record<string, string> = {
    'new': '新增提案',
    'approve': '已通过',
    'reject': '已驳回'
  };
  return actionMap[action] || action;
};
</script>

<style scoped lang="scss">
.log-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  display: flex;
  flex-direction: column;
}

/* 导航栏样式 */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: #b70030; /* 统一采用喵选基础纯色 */
  z-index: 100;
  /* 取消了过大的阴影，让顶部更清爽 */
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
    left: 12px; /* 略微收紧左边距 */
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
    font-size: 16px; /* 略微调小一点，显得更精致 */
    font-weight: 600;
    color: #ffffff;
    letter-spacing: 0.5px;
  }
}

/* 滚动内容区 */
.scroll-container {
  flex: 1;
  height: 100vh;
  box-sizing: border-box;
}

.safe-padding {
  padding: 0 16px 24px; /* 缩小左右和底部内边距，提高横向信息密度 */
}

/* 时间轴部分 */
.timeline {
  display: flex;
  flex-direction: column;
}

.timeline-item {
  display: flex;
  flex-direction: row;
  position: relative;
  /* 移除 min-height，让内容自然撑开，减小无用空白 */
}

.timeline-axis {
  position: relative;
  width: 20px; /* 缩小轴线区宽度 */
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 14px; /* 让圆点和卡片的标题大致对齐 */
}

.timeline-dot {
  width: 10px; /* 稍微缩小圆点 */
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
}

.timeline-line {
  position: absolute;
  top: 16px;
  bottom: -14px; /* 连接到下一个点 */
  width: 1px; /* 细化连接线 */
  background-color: #e6e6e6;
  z-index: 1;
}

/* 日志卡片 */
.timeline-content {
  flex: 1;
  margin-left: 8px; /* 缩小卡片与轴线的距离 */
  margin-bottom: 14px; /* 缩小卡片之间的上下间距 */
}

.log-card {
  background: #ffffff;
  border-radius: 8px; /* 稍微减小圆角 */
  padding: 12px; /* 缩小卡片内边距 */
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
  border: 1px solid #f2f2f2;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center; /* 垂直居中对齐 */
  margin-bottom: 8px; /* 缩小标题与信息的间距 */

  .course-name {
    font-size: 14px; /* 减小标题字号 */
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
  font-size: 10px; /* 减小徽章字号 */
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
}

.log-info {
  background: #fafafa;
  border-radius: 6px;
  padding: 8px; /* 缩小信息栏内边距 */

  .info-row {
    display: flex;
    font-size: 11px; /* 减小辅助信息字号 */
    line-height: 1.5; /* 紧凑行高 */
    
    .label {
      color: #888;
      width: 60px; /* 紧凑标签宽度 */
    }
    
    .val {
      color: #444;
      flex: 1;
    }
  }

  .time-row {
    margin-top: 4px; /* 紧凑两行信息间距 */
  }
}

/* 隐藏展开区域 */
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

/* 详情内部排版 */
.detail-content {
  display: flex;
  flex-direction: column;
  gap: 8px; /* 元素间距 */
}

/* 标签样式组，参照 propose.vue 风格 */
.tags-group {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 2px;
}

.tag-item {
  font-size: 11px;
  padding: 4px 8px;
  background: rgba(183, 0, 48, 0.05); /* 统一非常柔和的喵选红底色 */
  color: #b70030;
  border-radius: 4px;
}

/* 文字行信息 */
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

/* 缺省态 */
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
</style>