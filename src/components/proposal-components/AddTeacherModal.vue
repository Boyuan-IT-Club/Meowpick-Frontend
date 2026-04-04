<template>
  <view class="modal-mask" v-if="visible" @click="handleClose">
    <view class="modal-content" @click.stop>
      <view class="modal-header">
        <view class="modal-title">添加教师</view>
        <view class="close-btn" @click="handleClose">×</view>
      </view>
      
      <scroll-view class="form-scroll" scroll-y>
        <view class="form-group">
          <view class="form-label">教师姓名</view>
          <input class="form-input" v-model="teacherData.name" placeholder="请输入教师姓名" />
        </view>
        
        <view class="form-group">
          <view class="form-label">职称</view>
          <view class="search-box">
            <input 
              class="search-input" 
              v-model="titleSearchKeyword" 
              placeholder="搜索职称"
              @input="handleTitleSearch"
            />
          </view>
          <scroll-view class="options-list" scroll-y>
            <view 
              class="option-item" 
              v-for="(title, index) in filteredTitles" 
              :key="index"
              :class="{ active: teacherData.title === title }"
              @click="selectTitle(title)"
            >
              {{ title }}
            </view>
            <view class="no-result" v-if="filteredTitles.length === 0">
              未找到匹配的职称
            </view>
          </scroll-view>
        </view>
        
        <view class="form-group">
          <view class="form-label">所属院系</view>
          <view class="search-box">
            <input 
              class="search-input" 
              v-model="departmentSearchKeyword" 
              placeholder="搜索院系"
              @input="handleDepartmentSearch"
            />
          </view>
          <scroll-view class="options-list" scroll-y>
            <view 
              class="option-item" 
              v-for="(dept, index) in filteredDepartments" 
              :key="index"
              :class="{ active: teacherData.department === dept }"
              @click="selectDepartment(dept)"
            >
              {{ dept }}
            </view>
            <view class="no-result" v-if="filteredDepartments.length === 0">
              未找到匹配的院系
            </view>
          </scroll-view>
        </view>
      </scroll-view>
      
      <button class="confirm-btn" @click="handleConfirm">确认添加</button>
    </view>
  </view>
</template>

<script lang="ts">
import { defineComponent, reactive, watch, ref, computed } from 'vue';
import { teacherTitles, departmentsData } from '@/data/mappingData';

interface Teacher {
  name: string;
  title: string;
  department: string;
}

export default defineComponent({
  name: 'AddTeacherModal',
  props: {
    visible: {
      type: Boolean,
      required: true
    }
  },
  emits: ['update:visible', 'confirm', 'close'],
  setup(props, { emit }) {
    const teacherData = reactive<Teacher>({
      name: '',
      title: '',
      department: ''
    });

    const titleSearchKeyword = ref('');
    const departmentSearchKeyword = ref('');

    const filteredTitles = computed(() => {
      const keyword = titleSearchKeyword.value.trim().toLowerCase();
      if (!keyword) {
        return teacherTitles;
      }
      return teacherTitles.filter(title => 
        title.toLowerCase().includes(keyword)
      );
    });

    const filteredDepartments = computed(() => {
      const keyword = departmentSearchKeyword.value.trim().toLowerCase();
      if (!keyword) {
        return departmentsData;
      }
      return departmentsData.filter(dept => 
        dept.toLowerCase().includes(keyword)
      );
    });

    watch(() => props.visible, (newVal) => {
      if (newVal) {
        teacherData.name = '';
        teacherData.title = '';
        teacherData.department = '';
        titleSearchKeyword.value = '';
        departmentSearchKeyword.value = '';
      }
    });

    const handleTitleSearch = () => {
    };

    const handleDepartmentSearch = () => {
    };

    const selectTitle = (title: string) => {
      teacherData.title = title;
    };

    const selectDepartment = (dept: string) => {
      teacherData.department = dept;
    };

    const handleConfirm = () => {
      if (!teacherData.name.trim()) {
        uni.showToast({ title: '请输入教师姓名', icon: 'none' });
        return;
      }
      if (!teacherData.title) {
        uni.showToast({ title: '请选择职称', icon: 'none' });
        return;
      }
      if (!teacherData.department) {
        uni.showToast({ title: '请选择所属院系', icon: 'none' });
        return;
      }
      emit('confirm', {
        name: teacherData.name,
        title: teacherData.title,
        department: teacherData.department
      });
      handleClose();
    };

    const handleClose = () => {
      emit('close');
      emit('update:visible', false);
    };

    return {
      teacherData,
      titleSearchKeyword,
      departmentSearchKeyword,
      filteredTitles,
      filteredDepartments,
      handleTitleSearch,
      handleDepartmentSearch,
      selectTitle,
      selectDepartment,
      handleConfirm,
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

.form-scroll {
  flex: 1;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 30rpx;
}

.form-label {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 20rpx;
}

.form-input {
  width: 100%;
  height: 80rpx;
  padding: 0 30rpx;
  background: #F5F5F5;
  border-radius: 20rpx;
  font-size: 28rpx;
  color: #333;
}

.search-box {
  margin-bottom: 20rpx;
}

.search-input {
  width: 100%;
  height: 70rpx;
  padding: 0 30rpx;
  background: #F5F5F5;
  border-radius: 35rpx;
  font-size: 26rpx;
  color: #333;
}

.options-list {
  max-height: 300rpx;
  background: #F5F5F5;
  border-radius: 20rpx;
  overflow: hidden;
}

.option-item {
  padding: 24rpx 30rpx;
  font-size: 26rpx;
  color: #333;
  border-bottom: 1rpx solid #E8E8E8;
  
  &:last-child {
    border-bottom: none;
  }
  
  &.active {
    background: #FFF0F6;
    color: #b70030;
    font-weight: 500;
  }
  
  &:active {
    background: #F0F0F0;
  }
}

.no-result {
  padding: 40rpx;
  text-align: center;
  font-size: 26rpx;
  color: #999;
}

.confirm-btn {
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  border-radius: 45rpx;
  background: linear-gradient(90deg, #b70030, #ff4d6a);
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  margin-top: 20rpx;
  box-shadow: 0 8rpx 24rpx rgba(183, 0, 48, 0.25);
  flex-shrink: 0;
  
  &:active {
    transform: scale(0.98);
    box-shadow: 0 4rpx 12rpx rgba(183, 0, 48, 0.2);
  }
}
</style>
