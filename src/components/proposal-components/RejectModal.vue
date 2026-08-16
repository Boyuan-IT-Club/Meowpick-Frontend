<template>
  <div v-if="visible" class="modal-mask" @click="handleCancel">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <div class="modal-title">拒绝提案</div>
        <div class="close-btn" @click="handleCancel">×</div>
      </div>
      <div class="modal-body">
        <div class="field-label">拒绝原因 <span class="required-mark">*</span></div>
        <textarea
          class="reason-input"
          v-model="reason"
          placeholder="请填写拒绝原因，将展示给提案提交者"
          maxlength="200"
          :auto-height="true"
        />
        <view class="word-count">{{ reason.length }}/200</view>
      </div>
      <div class="modal-footer">
        <button class="cancel-btn" @click="handleCancel">取消</button>
        <button class="confirm-btn" :disabled="!reason.trim()" @click="handleConfirm">确认拒绝</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void;
  (e: 'confirm', reason: string): void;
  (e: 'cancel'): void;
}>();

const reason = ref('');

watch(() => props.visible, (val) => {
  if (val) {
    reason.value = '';
  }
});

const handleCancel = () => {
  emit('update:visible', false);
  emit('cancel');
};

const handleConfirm = () => {
  const trimmed = reason.value.trim();
  if (!trimmed) return;
  emit('update:visible', false);
  emit('confirm', trimmed);
};
</script>

<style scoped lang="scss">
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 200;
  display: flex;
  align-items: flex-end;
}

.modal-content {
  width: 100%;
  background-color: #fff;
  border-radius: 24rpx 24rpx 0 0;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
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

  .close-btn {
    font-size: 40rpx;
    color: #999;
    padding: 0 10rpx;
  }
}

.modal-body {
  padding: 24rpx 32rpx;

  .field-label {
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
    margin-bottom: 16rpx;

    .required-mark {
      color: #ff4d4f;
      font-size: 24rpx;
    }
  }

  .reason-input {
    width: 100%;
    min-height: 200rpx;
    padding: 20rpx;
    font-size: 28rpx;
    color: #333;
    background: #f9f9f9;
    border-radius: 16rpx;
    border: 1rpx solid #e8e8e8;
    box-sizing: border-box;
    line-height: 1.6;
  }

  .word-count {
    text-align: right;
    font-size: 24rpx;
    color: #999;
    margin-top: 8rpx;
  }
}

.modal-footer {
  display: flex;
  gap: 20rpx;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #f0f0f0;

  .cancel-btn {
    flex: 1;
    height: 80rpx;
    line-height: 80rpx;
    border-radius: 40rpx;
    background: #f5f5f5;
    color: #666;
    font-size: 28rpx;
    border: none;
  }

  .confirm-btn {
    flex: 1;
    height: 80rpx;
    line-height: 80rpx;
    border-radius: 40rpx;
    background: linear-gradient(90deg, #ff4d4f, #ff7875);
    color: #fff;
    font-size: 28rpx;
    border: none;
    box-shadow: 0 4px 12px rgba(255, 77, 79, 0.2);

    &:disabled {
      opacity: 0.5;
    }
  }
}
</style>
