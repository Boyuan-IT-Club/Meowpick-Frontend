<!-- d:\MeowPick\Meowpick-Frontend\src\pages\proposal\log.vue -->
<template>
  <view class="log-page">
    <!-- 头部 -->
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-bar">
        <view class="back-btn" @click="goBack">←</view>
        <text class="title">操作日志</text>
      </view>
    </view>

    <!-- 日志列表 -->
    <scroll-view scroll-y class="log-list" :style="{ paddingTop: (statusBarHeight + 50) + 'px' }">
      <view v-if="logs.length > 0">
        <view 
          v-for="(log, index) in logs" 
          :key="log.id"
          class="log-item"
          :class="{ 'is-new': log.action === 'new' }"
        >
          <view class="log-header">
            <text class="action-badge" :class="log.action">{{ getActionText(log.action) }}</text>
            <text class="log-time">{{ log.actionTime }}</text>
          </view>
          <view class="log-content">
            <text class="course-name">{{ log.courseName }}</text>
            <text class="operator">操作人：{{ log.operator }}</text>
          </view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view v-else class="empty-state">
        <image src="@/images/cat.png" mode="aspectFit" class="empty-icon" />
        <text>暂无日志记录</text>
      </view>
      
      <view class="bottom-spacer"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

// 系统信息
const sysInfo = uni.getSystemInfoSync();
const statusBarHeight = sysInfo.statusBarHeight || 44;

// 日志数据
const logs = ref<any[]>([]);

onLoad((options: any) => {
  if (options.logs) {
    try {
      logs.value = JSON.parse(decodeURIComponent(options.logs));
    } catch (e) {
      console.error('解析日志数据失败', e);
    }
  }
});

const goBack = () => {
  uni.navigateBack();
};

const getActionText = (action: string) => {
  const actionMap: Record<string, string> = {
    'new': '新增',
    'approve': '通过',
    'reject': '下架'
  };
  return actionMap[action] || action;
};
</script>

<style scoped lang="scss">
.log-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #b70030, #ff4d6a);
  z-index: 100;
}

.nav-bar {
  height: 50px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  position: relative;
  
  .back-btn {
    font-size: 24px;
    color: white;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .title {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    font-size: 18px;
    font-weight: 600;
    color: white;
  }
}

.log-list {
  padding: 0 16px;
}

.log-item {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  &.is-new {
    border: 2px solid #1890ff;
    background: linear-gradient(135deg, #e6f7ff, #ffffff);
  }
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.action-badge {
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 500;
  
  &.new {
    background-color: #e6f7ff;
    color: #1890ff;
  }
  
  &.approve {
    background-color: #f6ffed;
    color: #52c41a;
  }
  
  &.reject {
    background-color: #fff1f0;
    color: #ff4d4f;
  }
}

.log-time {
  font-size: 12px;
  color: #999;
}

.log-content {
  .course-name {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    display: block;
    margin-bottom: 8px;
  }
  
  .operator {
    font-size: 13px;
    color: #666;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100px 0;
  
  .empty-icon {
    width: 120px;
    height: 120px;
    margin-bottom: 20px;
    opacity: 0.6;
  }
  
  text {
    font-size: 14px;
    color: #999;
  }
}

.bottom-spacer {
  height: 40px;
}
</style>