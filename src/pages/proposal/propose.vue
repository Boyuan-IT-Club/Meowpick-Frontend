<template>
  <view class="container">
    <!-- Header -->
    <view class="nav-bar" :style="navBarStyle">
      <view class="nav-content" :style="navContentStyle">
        <!-- Left aligned Back Button -->
        <view class="nav-left" :style="navLeftStyle">
            <view class="back-btn" @click="goBack">←</view>
        </view>
        <!-- Title following Back Button with specific gap -->
        <view class="nav-title-container">
            <text class="nav-title">新增提议</text>
        </view>
      </view>
    </view>
    
    <!-- Content Spacer -->
    <view :style="contentSpacerStyle"></view>

    <!-- Main Content -->
    <view class="form-body">
      
      <!-- Section 1: Basic Course Info -->
      <view class="card">
         <view class="card-title">基本信息</view>
         
         <view class="form-row" @click="openSearchModal('courseName')">
            <view class="label">课程名称</view>
            <view class="input-display">{{ formData.courseName || '请输入课程名称' }}</view>
            <text class="arrow">›</text>
         </view>
         
         <view class="form-row" @click="openSearchModal('courseCode')">
            <view class="label">课程代码</view>
            <view class="input-display">{{ formData.courseCode || '请输入课程代码 (选填)' }}</view>
            <text class="arrow">›</text>
         </view>

         <view class="form-row" @click="openSearchModal('department')">
            <view class="label">开课院系</view>
            <view class="input-display">{{ formData.department || '请输入开课院系' }}</view>
            <text class="arrow">›</text>
         </view>
         
         <view class="form-row" @click="openSearchModal('category')">
            <view class="label">课程类别</view>
            <view class="input-display">{{ formData.category || '请输入课程类别' }}</view>
            <text class="arrow">›</text>
         </view>
      </view>


      <!-- Section 2: Teaching Info -->
      <view class="card">
         <view class="card-title">教学信息</view>

         <view class="form-row" @click="openTeacherModal">
            <view class="label">授课教师</view>
            <view class="input-display">{{ formData.teachers.length > 0 ? `${formData.teachers.length}位教师` : '请添加授课教师' }}</view>
            <text class="arrow">›</text>
         </view>

         <view class="form-col">
            <view class="label" style="margin-bottom: 20rpx;">开课校区 (多选)</view>
            <view class="tags-group">
                <view 
                    class="tag-item" 
                    v-for="campus in campusOptions" 
                    :key="campus"
                    :class="{ active: formData.campuses.includes(campus) }"
                    @click="toggleCampus(campus)"
                >
                    {{ campus }}
                </view>
            </view>
         </view>
      </view>

      <!-- Section 3: Reason -->
      <view class="card">
         <view class="card-title">提议理由</view>
         <textarea 
            class="reason-area" 
            v-model="formData.reason" 
            placeholder="请详细描述新增该课程的理由，例如：这是一门新开的通识课..." 
            maxlength="300"
         />
         <view class="word-count">{{ formData.reason.length }}/300</view>
      </view>

      <!-- Submit Button -->
      <button class="submit-btn" @click="submit" :disabled="submitting">发布提议</button>
      <view class="safe-area-bottom"></view>

    </view>

    <!-- Search Modal Component -->
    <SearchModal
      v-model:visible="showSearchModal"
      :title="modalTitle"
      :placeholder="searchPlaceholder"
      :dataSource="currentDataSource"
      @select="handleSearchSelect"
    />

    <!-- Teacher List Modal Component -->
    <TeacherListModal
      v-model:visible="showTeacherModal"
      :teachers="formData.teachers"
      @add="handleAddTeacher"
      @remove="handleRemoveTeacher"
    />

    <!-- Add Teacher Form Modal Component -->
    <AddTeacherModal
      v-model:visible="showAddTeacherForm"
      @confirm="handleConfirmAddTeacher"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { http } from '@/config';
import { campusesData, categoriesData, departmentsData } from '@/data/mappingData';
import SearchModal from '@/components/proposal-components/SearchModal.vue';
import TeacherListModal from '@/components/proposal-components/TeacherListModal.vue';
import AddTeacherModal from '@/components/proposal-components/AddTeacherModal.vue';

interface Teacher {
  name: string;
  title: string;
  department: string;
}

const sysInfo = uni.getSystemInfoSync();
let menuButtonInfo = { 
    width: 87, 
    height: 32, 
    left: sysInfo.windowWidth - 87 - 10, 
    top: sysInfo.statusBarHeight ? sysInfo.statusBarHeight + 4 : 48, 
    bottom: (sysInfo.statusBarHeight ? sysInfo.statusBarHeight + 4 : 48) + 32, 
    right: sysInfo.windowWidth - 10 
};
try {
    const res = uni.getMenuButtonBoundingClientRect();
    if (res && res.width) {
        menuButtonInfo = {
            width: res.width,
            height: res.height,
            left: res.left,
            top: res.top,
            bottom: res.bottom,
            right: res.right
        };
    }
} catch (e) {}

const NAV_BAR_HEIGHT = menuButtonInfo.bottom + 12;

const navBarStyle = computed(() => {
    return {
        height: (menuButtonInfo.bottom + 12) + 'px',
        paddingTop: menuButtonInfo.top + 'px',
        paddingLeft: '32rpx',
        paddingRight: '32rpx',
        boxSizing: 'border-box'
    };
});

const navContentStyle = computed(() => {
    return {
        height: menuButtonInfo.height + 'px',
        display: 'flex',
        alignItems: 'center',
        width: '100%'
    };
});

const navLeftStyle = computed(() => {
    return {
        height: menuButtonInfo.height + 'px',
        width: menuButtonInfo.height + 'px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    };
});

const contentSpacerStyle = computed(() => {
    return {
        height: (menuButtonInfo.bottom + 12) + 'px'
    };
});

const submitting = ref(false);

const formData = reactive({
    courseName: '',
    courseCode: '',
    department: '',
    category: '',
    teachers: [] as Teacher[],
    campuses: [] as string[],
    reason: ''
});

const campusOptions = ['普陀校区', '闵行校区', '临港校区'];

const showSearchModal = ref(false);
const showTeacherModal = ref(false);
const showAddTeacherForm = ref(false);
const currentField = ref('');

const modalTitle = computed(() => {
    const titles: Record<string, string> = {
        courseName: '课程名称',
        courseCode: '课程代码',
        department: '开课院系',
        category: '课程类别',
        campuses: '开课校区'
    };
    return titles[currentField.value] || '搜索';
});

const searchPlaceholder = computed(() => {
    const placeholders: Record<string, string> = {
        courseName: '请输入课程名称进行搜索',
        courseCode: '请输入课程代码进行搜索',
        department: '请输入开课院系进行搜索',
        category: '请输入课程类别进行搜索',
        campuses: '请输入开课校区进行搜索'
    };
    return placeholders[currentField.value] || '请输入关键词';
});

const currentDataSource = computed(() => {
    switch (currentField.value) {
        case 'courseName':
        case 'courseCode':
            return [];
        case 'department':
            return departmentsData;
        case 'category':
            return categoriesData;
        case 'campuses':
            return campusesData;
        default:
            return [];
    }
});

const openSearchModal = (field: string) => {
    currentField.value = field;
    showSearchModal.value = true;
};

const handleSearchSelect = (item: string) => {
    switch (currentField.value) {
        case 'courseName':
            formData.courseName = item;
            break;
        case 'courseCode':
            formData.courseCode = item;
            break;
        case 'department':
            formData.department = item;
            break;
        case 'category':
            formData.category = item;
            break;
        case 'campuses':
            if (!formData.campuses.includes(item)) {
                formData.campuses.push(item);
            }
            break;
    }
};

const toggleCampus = (campus: string) => {
    const idx = formData.campuses.indexOf(campus);
    if (idx > -1) {
        formData.campuses.splice(idx, 1);
    } else {
        formData.campuses.push(campus);
    }
};

const openTeacherModal = () => {
    showTeacherModal.value = true;
};

const handleAddTeacher = () => {
    showAddTeacherForm.value = true;
};

const handleRemoveTeacher = (index: number) => {
    formData.teachers.splice(index, 1);
};

const handleConfirmAddTeacher = (teacher: Teacher) => {
    formData.teachers.push(teacher);
};

const goBack = () => {
    uni.navigateBack();
};

const submit = async () => {
    if (!formData.courseName.trim()) return uni.showToast({ title: '请输入课程名称', icon: 'none' });
    if (!formData.department) return uni.showToast({ title: '请选择开课院系', icon: 'none' });
    if (!formData.reason.trim()) return uni.showToast({ title: '请填写提议理由', icon: 'none' });
    if (formData.teachers.length === 0) return uni.showToast({ title: '请添加授课教师', icon: 'none' });
    if (formData.campuses.length === 0) return uni.showToast({ title: '请选择开课校区', icon: 'none' });

    submitting.value = true;
    
    try {
        const requestBody = {
            title: formData.courseName,
            content: formData.reason,
            course: {
                name: formData.courseName,
                code: formData.courseCode,
                department: formData.department,
                category: formData.category,
                teachers: formData.teachers,
                campuses: formData.campuses
            }
        };

        console.log('[API] 准备提交提案:', {
            courseName: formData.courseName,
            department: formData.department,
            category: formData.category,
            campuses: formData.campuses,
            teachers: formData.teachers
        });
        
        console.log('[API] 开始提交提案');
        const res = await http.request({
            path: `/api/proposal/add`,
            method: 'POST',
            body: requestBody,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('[API] 提交提案响应:', res);
        
        if (res && res.code === 0) {
            console.log('[API] 提案提交成功');
            uni.showToast({ title: '提交成功', icon: 'success' });
            setTimeout(() => uni.navigateBack(), 1500);
        } else {
            console.error('[API] 提案提交失败:', res?.msg || '未知错误');
            uni.showToast({ title: res?.msg || '提交失败', icon: 'none' });
        }
    } catch (error) {
        console.error('[API] 提交提案请求失败:', error.message || error);
        if (error.response) {
            console.error('[API] 服务器错误:', error.response.data);
            uni.showToast({ title: `服务器错误: ${error.response.status}`, icon: 'none' });
        } else if (error.request) {
            console.error('[API] 网络错误: 未收到服务器响应');
            uni.showToast({ title: '网络错误，请检查网络连接', icon: 'none' });
        } else {
            console.error('[API] 其他错误:', error.message);
            uni.showToast({ title: `错误: ${error.message}`, icon: 'none' });
        }
    } finally {
        submitting.value = false;
        console.log('[API] 提案提交流程完成');
    }
};

</script>

<style lang="scss" scoped>
.container {
    min-height: 100vh;
    background: #FAFAFA;
}

.nav-bar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 100;
    background: transparent;
    box-shadow: none;
}

.nav-content {
}

.nav-title-container {
    margin-left: 32rpx;
    display: flex;
    align-items: center;

    .nav-title {
        font-size: 36rpx;
        font-weight: 600;
        color: #333;
    }
}

.back-btn {
    font-size: 40rpx;
    color: #333;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
}

.form-body {
    padding: 0rpx 30rpx 60rpx;
}

.card {
    background: #fff;
    border-radius: 20rpx;
    padding: 30rpx;
    margin-bottom: 30rpx;
    box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.02);
}

.card-title {
    font-size: 30rpx;
    font-weight: 700;
    color: #333;
    margin-bottom: 30rpx;
    position: relative;
    padding-left: 20rpx;
    
    &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 6rpx;
        bottom: 6rpx;
        width: 8rpx;
        background: #FF4D6A;
        border-radius: 4rpx;
    }
}

.form-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx 0;
    border-bottom: 1rpx solid #F5F5F5;
    
    &:last-child {
        border-bottom: none;
    }

    .label {
        font-size: 28rpx;
        color: #333;
        width: 180rpx;
        font-weight: 500;
    }

    .input {
        flex: 1;
        text-align: right;
        font-size: 28rpx;
        color: #333;
    }
    
    .input-display {
        flex: 1;
        text-align: right;
        font-size: 28rpx;
        color: #333;
        
        &:empty::before {
            content: attr(data-placeholder);
            color: #ccc;
        }
    }
    
    .arrow {
        margin-left: 10rpx;
        color: #ccc;
        font-size: 40rpx;
    }
    
    .picker-display {
        font-size: 28rpx;
        color: #333;
        
        &.empty {
            color: #ccc;
        }
        
        .arrow {
            margin-left: 10rpx;
            color: #ccc;
        }
    }
}

.form-col {
    padding: 20rpx 0;
    
    .label {
        font-size: 28rpx;
        color: #333;
        font-weight: 500;
    }
}

.tags-group {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
}

.tag-item {
    padding: 12rpx 30rpx;
    background: #F5F5F5;
    border-radius: 30rpx;
    font-size: 26rpx;
    color: #666;
    border: 1px solid transparent;
    transition: all 0.2s;
    
    &.active {
        background: #FFF0F6;
        color: #b70030;
        border-color: #ffadd2;
    }
}

.reason-area {
    width: 100%;
    height: 200rpx;
    font-size: 28rpx;
    line-height: 1.6;
    color: #333;
}

.word-count {
    text-align: right;
    font-size: 24rpx;
    color: #ccc;
    margin-top: 10rpx;
}

.submit-btn {
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
    
    &:active {
        transform: scale(0.98);
        box-shadow: 0 4rpx 12rpx rgba(183, 0, 48, 0.2);
    }

    &[disabled] {
        background: #ccc;
        color: #fff;
        box-shadow: none;
    }
}

.safe-area-bottom {
    height: env(safe-area-inset-bottom);
}
</style>
