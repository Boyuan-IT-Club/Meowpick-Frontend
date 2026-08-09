<template>
  <view v-if="visible" class="modal-overlay" @click="close">
    <view class="modal-card feedback-card" :class="themeStore.themeClass" @click.stop>
      <view class="modal-header">
        <text class="modal-title">反馈</text>
        <view class="modal-close" @click="close">×</view>
      </view>

      <view class="modal-body feedback-body">
        <text class="feedback-desc">遇到问题或有建议？点击下方框即可复制对应联系方式：</text>

        <!-- QQ群反馈 - 点击复制群号 -->
        <view class="feedback-section" @click="copyQQNumber">
          <view class="feedback-label-row">
            <text class="feedback-label">QQ 群</text>
            <text class="feedback-hint">点击复制</text>
          </view>
          <view class="feedback-value">群号 {{ CONTACT_INFO.qqGroup.number }}</view>
        </view>

        <!-- 邮件反馈 - 点击复制邮箱 -->
        <view class="feedback-section" @click="copyEmail">
          <view class="feedback-label-row">
            <text class="feedback-label">邮箱</text>
            <text class="feedback-hint">点击复制</text>
          </view>
          <view class="feedback-value">{{ CONTACT_INFO.email.address }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { useThemeStore } from '@/config';
import { CONTACT_INFO, copyToClipboard } from '@/utils/contact-info';

const props = defineProps<{ visible: boolean }>();
const emit = defineEmits<{ (e: 'update:visible', value: boolean): void }>();

const themeStore = useThemeStore();

watch(
  () => props.visible,
  (val) => {
    // 控制弹窗显隐
  }
);

const close = () => {
  emit('update:visible', false);
};

const copyQQNumber = () => copyToClipboard(CONTACT_INFO.qqGroup.number, '已复制群号');
const copyEmail = () => copyToClipboard(CONTACT_INFO.email.address, '已复制邮箱');
</script>

<style scoped lang="scss">
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

.feedback-body {
  padding: 32rpx 40rpx;
}

.feedback-desc {
  font-size: 30rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 32rpx;
  display: block;
}

.feedback-section {
  margin-bottom: 32rpx;
  transition: opacity 0.15s;

  &:active {
    opacity: 0.6;
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.feedback-label-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 14rpx;
}

.feedback-label {
  font-size: 30rpx;
  color: #333;
  font-weight: 600;
  display: block;
}

.feedback-hint {
  font-size: 22rpx;
  color: #999;
  font-weight: 400;
}

.feedback-value {
  font-size: 32rpx;
  color: #1a1a1a;
  background-color: #f5f5f5;
  padding: 28rpx;
  border-radius: 14rpx;
  font-family: monospace;
  font-weight: 500;
  letter-spacing: 1rpx;
  text-align: center;
  border: 2rpx solid transparent;
  transition: border-color 0.15s, background-color 0.15s;
}
</style>

<style lang="scss">
.modal-card.dark-theme { background-color: #1e1e1e; }
.modal-card.dark-theme .modal-header { border-color: #333; .modal-title { color: #e0e0e0; } .modal-close { color: #888; } }

.modal-card.dark-theme.feedback-card {
  .feedback-desc { color: #aaa; }
  .feedback-label { color: #e0e0e0; }
  .feedback-hint { color: #888; }
  .feedback-value { background-color: #2a2a2a; color: #e0e0e0; border-color: #3a3a3a; }
}
</style>