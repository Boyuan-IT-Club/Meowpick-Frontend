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
          <view class="search-box">
            <input 
              class="search-input" 
              v-model="teacherNameKeyword" 
              placeholder="请输入教师姓名"
              @input="handleTeacherNameSearch"
            />
          </view>
          <scroll-view class="options-list" scroll-y v-if="filteredTeacherNames.length > 0 || teacherNameLoading">
            <view v-if="teacherNameLoading" class="loading-hint">搜索中...</view>
            <template v-else>
              <view
                class="option-item"
                v-for="(teacher, index) in filteredTeacherNames"
                :key="teacher.id || index"
                :class="{ active: teacherData.name === teacher.name }"
                @click="selectTeacherName(teacher)"
              >
                <view>{{ teacher.name }}</view>
                <view v-if="teacher.courses.length" class="teacher-courses">
                  已开课程：{{ teacher.courses.join('、') }}
                </view>
              </view>
            </template>
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
          <scroll-view class="options-list" scroll-y v-if="filteredDepartments.length > 0 || departmentLoading">
            <view v-if="departmentLoading" class="loading-hint">搜索中...</view>
            <template v-else>
              <view 
                class="option-item" 
                v-for="(dept, index) in filteredDepartments" 
                :key="index"
                :class="{ active: teacherData.department === dept }"
                @click="selectDepartment(dept)"
              >
                {{ dept }}
              </view>
            </template>
          </scroll-view>
        </view>
      </scroll-view>
      
      <button class="confirm-btn" @click="handleConfirm">确认添加</button>
    </view>
  </view>
</template>

<script lang="ts">
import { defineComponent, reactive, watch, ref } from 'vue';
import { http } from '@/config';

interface Teacher {
  name: string;
  department: string;
  teacherId?: string;
}

interface TeacherSuggestion {
  id: string;
  name: string;
  courses: string[];
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
      department: ''
    });

    // 教师姓名搜索
    const teacherNameKeyword = ref('');
    const filteredTeacherNames = ref<TeacherSuggestion[]>([]);
    const teacherNameLoading = ref(false);
    let teacherNameTimer: ReturnType<typeof setTimeout> | null = null;

    // 院系搜索
    const departmentSearchKeyword = ref('');
    const filteredDepartments = ref<string[]>([]);
    const departmentLoading = ref(false);
    let departmentTimer: ReturnType<typeof setTimeout> | null = null;

    watch(() => props.visible, (newVal) => {
      if (newVal) {
        teacherData.name = '';
        teacherData.department = '';
        teacherData.teacherId = undefined;
        teacherNameKeyword.value = '';
        filteredTeacherNames.value = [];
        departmentSearchKeyword.value = '';
        filteredDepartments.value = [];
      }
    });

    const fetchTeacherNameSuggestions = async (keyword: string) => {
      if (!keyword) {
        filteredTeacherNames.value = [];
        return;
      }

      teacherNameLoading.value = true;
      try {
        const res = await http.ProposalController.proposalFieldSuggestionsList({
          field: 'teacherName',
          keyword,
          page: 0,
          pageSize: 50
        });

        if (res.data?.code === 0) {
          const responseData = res.data.data || res.data;
          const suggestions = responseData?.suggestions || [];
          filteredTeacherNames.value = suggestions
            .map((s: any) => ({
              id: s.id || '',
              name: s.value || s.label || '',
              courses: Array.isArray(s.courses)
                ? s.courses.map((course: any) => course.name || '').filter(Boolean)
                : []
            }))
            .filter((teacher: TeacherSuggestion) => teacher.name);
        } else {
          filteredTeacherNames.value = [];
        }
      } catch (err) {
        console.error('[API] 获取教师姓名建议失败:', err);
        filteredTeacherNames.value = [];
      } finally {
        teacherNameLoading.value = false;
      }
    };

    const handleTeacherNameSearch = () => {
      const keyword = teacherNameKeyword.value.trim();
      if (keyword !== teacherData.name) {
        teacherData.teacherId = undefined;
      }
      if (!keyword) {
        filteredTeacherNames.value = [];
        return;
      }

      if (teacherNameTimer) clearTimeout(teacherNameTimer);
      teacherNameTimer = setTimeout(() => {
        fetchTeacherNameSuggestions(keyword);
      }, 300);
    };

    const selectTeacherName = (teacher: TeacherSuggestion) => {
      teacherData.name = teacher.name;
      teacherData.teacherId = teacher.id || undefined;
      teacherNameKeyword.value = teacher.name;
      filteredTeacherNames.value = [];
    };

    const fetchDepartmentSuggestions = async (keyword: string) => {
      if (!keyword) {
        filteredDepartments.value = [];
        return;
      }

      departmentLoading.value = true;
      try {
        const res = await http.ProposalController.proposalFieldSuggestionsList({
          field: 'department',
          keyword,
          page: 0,
          pageSize: 50
        });

        if (res.data?.code === 0) {
          const responseData = res.data.data || res.data;
          const suggestions = responseData?.suggestions || [];
          filteredDepartments.value = suggestions.map((s: any) => s.value || s.label || '');
        } else {
          filteredDepartments.value = [];
        }
      } catch (err) {
        console.error('[API] 获取院系建议失败:', err);
        filteredDepartments.value = [];
      } finally {
        departmentLoading.value = false;
      }
    };

    const handleDepartmentSearch = () => {
      const keyword = departmentSearchKeyword.value.trim();
      if (!keyword) {
        filteredDepartments.value = [];
        return;
      }

      if (departmentTimer) clearTimeout(departmentTimer);
      departmentTimer = setTimeout(() => {
        fetchDepartmentSuggestions(keyword);
      }, 300);
    };

    const selectDepartment = (dept: string) => {
      teacherData.department = dept;
      departmentSearchKeyword.value = dept;
      filteredDepartments.value = [];
    };

    const handleConfirm = () => {
      const name = teacherData.name || teacherNameKeyword.value.trim();
      if (!name) {
        uni.showToast({ title: '请输入教师姓名', icon: 'none' });
        return;
      }
      if (!teacherData.department) {
        uni.showToast({ title: '请选择所属院系', icon: 'none' });
        return;
      }
      emit('confirm', {
        name,
        department: teacherData.department,
        teacherId: teacherData.teacherId
      });
      handleClose();
    };

    const handleClose = () => {
      emit('close');
      emit('update:visible', false);
    };

    return {
      teacherData,
      teacherNameKeyword,
      filteredTeacherNames,
      teacherNameLoading,
      handleTeacherNameSearch,
      selectTeacherName,
      departmentSearchKeyword,
      filteredDepartments,
      departmentLoading,
      handleDepartmentSearch,
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
  transform: translateY(100%);
  animation: modalSlideUp 0.3s ease-out forwards;
}

@keyframes modalSlideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
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
  margin-bottom: 50rpx;
}

.form-label {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 20rpx;
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

.teacher-courses {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #999;
}

.loading-hint {
  padding: 40rpx;
  text-align: center;
  font-size: 26rpx;
  color: #999;
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
