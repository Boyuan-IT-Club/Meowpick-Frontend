<template>
  <view class="modal-mask" v-if="visible" @click="handleClose">
    <view class="modal-content" @click.stop>
      <view class="modal-header">
        <view class="modal-title">{{ initialTeacher ? '编辑教师' : '添加教师' }}</view>
        <view class="close-btn" @click="handleClose">×</view>
      </view>

      <template v-if="mode === 'existing'">
        <view class="search-container">
          <input class="search-input" v-model="teacherNameKeyword" placeholder="搜索已有教师" @input="handleTeacherNameSearch" />
          <view class="add-btn" @click="openNewTeacherForm">
            <text class="add-icon">+</text>
            <text class="add-text">新增</text>
          </view>
        </view>

        <scroll-view class="options-list" scroll-y>
          <view v-if="teacherNameLoading" class="loading-hint">搜索中...</view>
          <template v-else>
            <view
              class="option-item"
              v-for="(teacher, index) in filteredTeacherNames"
              :key="teacher.id || index"
              :class="{ active: selectedTeacherId === teacher.id }"
              @click="selectTeacherName(teacher)"
            >
              <view class="teacher-name">{{ teacher.name }}{{ teacher.title || '' }}</view>
              <view v-if="teacher.courses.length" class="teacher-courses">已开课程：{{ teacher.courses.join('、') }}</view>
            </view>
            <view v-if="teacherNameKeyword && filteredTeacherNames.length === 0" class="no-result">
              未找到匹配教师，可点击右侧“新增”按钮
            </view>
          </template>
        </scroll-view>

        <view v-if="selectedTeacherId" class="selected-hint">
          已选择：{{ teacherData.name }}{{ teacherData.title || '' }}
        </view>
      </template>

      <template v-else>
        <scroll-view class="new-teacher-form" scroll-y>
          <view class="form-group">
            <view class="form-label">教师姓名</view>
            <input class="form-input" v-model="teacherData.name" placeholder="请输入教师姓名" />
          </view>

          <view class="form-group">
            <view class="form-label">教师职称<text class="optional-text">（选填）</text></view>
            <view class="title-options">
              <view
                v-for="title in teacherTitles"
                :key="title"
                class="title-option"
                :class="{ active: teacherData.title === title }"
                @click="toggleTitle(title)"
              >
                {{ title }}
              </view>
            </view>
          </view>

          <view class="back-existing" @click="backToExistingSearch">返回选择已有教师</view>
        </scroll-view>
      </template>

      <button class="confirm-btn" @click="handleConfirm">完成</button>
    </view>
  </view>
</template>

<script lang="ts">
import { defineComponent, reactive, watch, ref } from 'vue';
import { http } from '@/config';
import { teacherTitles } from '@/data/mappingData';

interface Teacher {
  name: string;
  department?: string;
  title?: string;
  teacherId?: string;
}

interface TeacherSuggestion {
  id: string;
  name: string;
  title: string;
  department: string;
  courses: string[];
}

export default defineComponent({
  name: 'AddTeacherModal',
  props: {
    visible: { type: Boolean, required: true },
    initialTeacher: { type: Object as () => Teacher | null, default: null }
  },
  emits: ['update:visible', 'confirm', 'close'],
  setup(props, { emit }) {
    const mode = ref<'existing' | 'new'>('existing');
    const teacherData = reactive<Teacher>({ name: '', department: '', title: '', teacherId: undefined });
    const teacherNameKeyword = ref('');
    const selectedTeacherId = ref('');
    const filteredTeacherNames = ref<TeacherSuggestion[]>([]);
    const teacherNameLoading = ref(false);
    let teacherNameTimer: ReturnType<typeof setTimeout> | null = null;

    const fetchTeacherNameSuggestions = async (keyword: string) => {
      if (!keyword) {
        filteredTeacherNames.value = [];
        return;
      }
      teacherNameLoading.value = true;
      try {
        const res = await http.ProposalController.proposalFieldSuggestionsList({
          field: 'teacherName', keyword, page: 0, pageSize: 50
        });
        if (res.data?.code === 0) {
          const responseData: any = res.data.data || res.data;
          filteredTeacherNames.value = (responseData?.suggestions || [])
            .map((suggestion: any) => {
              const name = suggestion.value || suggestion.label || '';
              const label = String(suggestion.label || '');
              const labelTitle = label.startsWith(`${name} - `) ? label.slice(`${name} - `.length) : '';
              return {
                id: suggestion.id || '',
                name,
                title: suggestion.title || labelTitle,
                department: suggestion.department || '',
                courses: Array.isArray(suggestion.courses)
                  ? suggestion.courses.map((course: any) => course.name || '').filter(Boolean)
                  : []
              };
            })
            .filter((teacher: TeacherSuggestion) => teacher.id && teacher.name);
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

    const resetFromInitialTeacher = () => {
      const initial = props.initialTeacher;
      teacherData.name = initial?.name || '';
      teacherData.department = initial?.department || '';
      teacherData.title = initial?.title || '';
      teacherData.teacherId = initial?.teacherId;
      teacherNameKeyword.value = initial?.name || '';
      selectedTeacherId.value = initial?.teacherId || '';
      filteredTeacherNames.value = [];
      mode.value = initial && !initial.teacherId ? 'new' : 'existing';
      if (mode.value === 'existing' && teacherNameKeyword.value) {
        fetchTeacherNameSuggestions(teacherNameKeyword.value);
      }
    };

    watch(() => props.visible, (newVal) => {
      if (newVal) resetFromInitialTeacher();
    });

    const handleTeacherNameSearch = () => {
      const keyword = teacherNameKeyword.value.trim();
      if (keyword !== teacherData.name) {
        teacherData.name = '';
        teacherData.title = '';
        teacherData.department = '';
        teacherData.teacherId = undefined;
        selectedTeacherId.value = '';
      }
      if (!keyword) {
        filteredTeacherNames.value = [];
        return;
      }
      if (teacherNameTimer) clearTimeout(teacherNameTimer);
      teacherNameTimer = setTimeout(() => fetchTeacherNameSuggestions(keyword), 300);
    };

    const selectTeacherName = (teacher: TeacherSuggestion) => {
      teacherData.name = teacher.name;
      teacherData.title = teacher.title;
      teacherData.department = teacher.department;
      teacherData.teacherId = teacher.id;
      selectedTeacherId.value = teacher.id;
      teacherNameKeyword.value = teacher.name;
      filteredTeacherNames.value = [];
    };

    const openNewTeacherForm = () => {
      mode.value = 'new';
      teacherData.name = teacherNameKeyword.value.trim();
      teacherData.title = '';
      teacherData.department = '';
      teacherData.teacherId = undefined;
      selectedTeacherId.value = '';
      filteredTeacherNames.value = [];
    };

    const backToExistingSearch = () => {
      teacherNameKeyword.value = teacherData.name.trim();
      teacherData.teacherId = undefined;
      selectedTeacherId.value = '';
      mode.value = 'existing';
      if (teacherNameKeyword.value) fetchTeacherNameSuggestions(teacherNameKeyword.value);
    };

    const toggleTitle = (title: string) => {
      teacherData.title = teacherData.title === title ? '' : title;
    };

    const handleConfirm = () => {
      if (mode.value === 'existing') {
        if (!selectedTeacherId.value || !teacherData.teacherId) {
          uni.showToast({ title: '请选择一位老师', icon: 'none' });
          return;
        }
      } else if (!teacherData.name.trim()) {
        uni.showToast({ title: '请输入教师姓名', icon: 'none' });
        return;
      }

      emit('confirm', {
        name: teacherData.name.trim(),
        department: teacherData.department || '',
        title: teacherData.title || '',
        teacherId: mode.value === 'existing' ? teacherData.teacherId : undefined
      });
      handleClose();
    };

    const handleClose = () => {
      emit('close');
      emit('update:visible', false);
    };

    return {
      mode, teacherData, teacherNameKeyword, selectedTeacherId, filteredTeacherNames,
      teacherNameLoading, teacherTitles, handleTeacherNameSearch, selectTeacherName,
      openNewTeacherForm, backToExistingSearch, toggleTitle, handleConfirm, handleClose
    };
  }
});
</script>

<style lang="scss" scoped>
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1100;
  display: flex;
  align-items: flex-end;
}
.modal-content {
  width: 100%;
  height: 85vh;
  box-sizing: border-box;
  background: #fff;
  border-radius: 40rpx 40rpx 0 0;
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  transform: translateY(100%);
  animation: modalSlideUp 0.3s ease-out forwards;
}
@keyframes modalSlideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
.modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 30rpx; flex-shrink: 0; }
.modal-title { font-size: 36rpx; font-weight: 600; color: #333; }
.close-btn { font-size: 60rpx; color: #999; line-height: 1; padding: 0 20rpx; }
.search-container { display: flex; align-items: center; gap: 20rpx; margin-bottom: 30rpx; flex-shrink: 0; }
.search-input, .form-input {
  height: 80rpx;
  box-sizing: border-box;
  padding: 0 30rpx;
  background: #f5f5f5;
  border-radius: 40rpx;
  font-size: 28rpx;
  color: #333;
}
.search-input { flex: 1; }
.form-input { width: 100%; }
.add-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
  padding: 10rpx 20rpx;
  background: #fff0f6;
  border-radius: 12rpx;
  min-width: 80rpx;
}
.add-icon { font-size: 40rpx; color: #b70030; line-height: 1; }
.add-text { font-size: 20rpx; color: #b70030; }
.options-list, .new-teacher-form { flex: 1; min-height: 0; }
.option-item {
  padding: 24rpx 30rpx;
  border-bottom: 1rpx solid #e8e8e8;
  color: #333;
  &.active { background: #fff0f6; color: #b70030; }
}
.teacher-name { font-size: 28rpx; }
.teacher-courses { margin-top: 8rpx; font-size: 22rpx; color: #999; }
.loading-hint, .no-result { padding: 40rpx; text-align: center; font-size: 26rpx; color: #999; }
.selected-hint {
  margin: 20rpx 0;
  padding: 20rpx 24rpx;
  border-radius: 16rpx;
  background: #fff0f6;
  color: #b70030;
  font-size: 26rpx;
}
.form-group { margin-bottom: 50rpx; }
.form-label { margin-bottom: 20rpx; font-size: 28rpx; color: #333; font-weight: 500; }
.optional-text { color: #999; font-size: 22rpx; font-weight: normal; margin-left: 8rpx; }
.title-options { display: flex; flex-wrap: wrap; gap: 20rpx; }
.title-option {
  padding: 14rpx 26rpx;
  border-radius: 30rpx;
  background: #f5f5f5;
  color: #666;
  font-size: 26rpx;
  &.active { background: #b70030; color: #fff; }
}
.back-existing { margin-top: 20rpx; text-align: center; color: #b70030; font-size: 26rpx; }
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
}
</style>
