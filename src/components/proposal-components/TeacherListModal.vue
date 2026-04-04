<template>
  <view class="modal-mask" v-if="visible" @click="handleClose">
    <view class="modal-content" @click.stop>
      <view class="modal-header">
        <view class="modal-title">授课教师</view>
        <view class="close-btn" @click="handleClose">×</view>
      </view>
      <view class="teacher-list">
        <view class="teacher-item" v-for="(teacher, index) in teachers" :key="index">
          <view class="teacher-info">
            <view class="teacher-name">{{ teacher.name }}</view>
            <view class="teacher-detail">{{ teacher.title }} · {{ teacher.department }}</view>
          </view>
          <view class="delete-teacher" @click="handleRemove(index)">×</view>
        </view>
        <view class="empty-tip" v-if="teachers.length === 0">
          暂无教师信息，请点击下方按钮添加
        </view>
      </view>
      <view class="add-teacher-btn" @click="handleAdd">
        <text class="add-icon">+</text>
        <text class="add-text">添加教师</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

interface Teacher {
  name: string;
  title: string;
  department: string;
}

export default defineComponent({
  name: 'TeacherListModal',
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    teachers: {
      type: Array as () => Teacher[],
      required: true
    }
  },
  emits: ['update:visible', 'add', 'remove', 'close'],
  setup(props, { emit }) {
    const handleAdd = () => {
      emit('add');
    };

    const handleRemove = (index: number) => {
      emit('remove', index);
    };

    const handleClose = () => {
      emit('close');
      emit('update:visible', false);
    };

    return {
      handleAdd,
      handleRemove,
      handleClose
    };
  }
});
</script>

<style lang="scss" scoped>
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.modal-content {
  width: 100%;
  height: 85vh;
  background: #fff;
  border-radius: 40rpx 40rpx 0 0;
  padding: 40rpx;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30rpx;
  flex-shrink: 0;
}

.modal-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.close-btn {
  font-size: 60rpx;
  color: #999;
  line-height: 1;
  padding: 0 20rpx;
}

.teacher-list {
  flex: 1;
  overflow-y: auto;
}

.teacher-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  background: #F5F5F5;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
}

.teacher-info {
  flex: 1;
}

.teacher-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
}

.teacher-detail {
  font-size: 24rpx;
  color: #999;
}

.delete-teacher {
  font-size: 50rpx;
  color: #999;
  padding: 10rpx;
  line-height: 1;
}

.empty-tip {
  text-align: center;
  padding: 60rpx 0;
  font-size: 28rpx;
  color: #999;
}

.add-teacher-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  padding: 30rpx;
  background: linear-gradient(90deg, #b70030, #ff4d6a);
  border-radius: 20rpx;
  margin-top: 20rpx;
  flex-shrink: 0;
  
  .add-icon {
    font-size: 40rpx;
    color: #fff;
  }
  
  .add-text {
    font-size: 28rpx;
    color: #fff;
    font-weight: 600;
  }
}
</style>
