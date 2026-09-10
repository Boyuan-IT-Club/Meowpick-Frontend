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
            <text class="nav-title">{{ isApproveMode ? '通过提案' : '新增提案' }}</text>
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

      <!-- Section 3: 展示昵称 -->
      <view class="card">
         <view class="card-title">展示设置</view>
         <view class="form-row-inline">
            <view class="label">展示昵称</view>
            <view class="tags-group inline-tags">
                <view
                    class="tag-item"
                    :class="{ active: formData.showUsername === true }"
                    @click="formData.showUsername = true"
                >
                    是
                </view>
                <view
                    class="tag-item"
                    :class="{ active: formData.showUsername === false }"
                    @click="formData.showUsername = false"
                >
                    否
                </view>
            </view>
         </view>
         <view class="field-hint">选择"是"将在提案通过后展示你的昵称</view>
      </view>

      <!-- Section 4: 提议理由 -->
      <view class="card">
         <view class="card-title">提议理由 <text class="optional-tag">选填</text></view>
         <view class="form-col">
            <textarea
                class="reason-textarea"
                v-model="formData.reason"
                placeholder="请输入提议理由（选填）"
                :maxlength="500"
                auto-height
            />
         </view>
      </view>

      <!-- Submit Button -->
      <button class="submit-btn" @click="submit" :disabled="submitting">{{ isApproveMode ? '通过' : '提交提案' }}</button>
      <view class="safe-area-bottom"></view>

    </view>

    <!-- Search Modal Component -->
    <SearchModal
      v-model:visible="showSearchModal"
      :title="modalTitle"
      :placeholder="searchPlaceholder"
      :field="currentField"
      :initial-value="currentSearchValue"
      @select="handleSearchSelect"
    />

    <!-- Teacher List Modal Component -->
    <TeacherListModal
      v-model:visible="showTeacherModal"
      :teachers="formData.teachers"
      @add="handleAddTeacher"
      @edit="handleEditTeacher"
      @remove="handleRemoveTeacher"
    />

    <!-- Add Teacher Form Modal Component -->
    <AddTeacherModal
      v-model:visible="showAddTeacherForm"
      :initial-teacher="teacherBeingEdited"
      @confirm="handleConfirmAddTeacher"
      @close="handleTeacherEditorClose"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { onLoad } from "@dcloudio/uni-app";
import { http } from '@/config';
import { campusesData } from '@/data/mappingData';
import SearchModal from '@/components/proposal-components/SearchModal.vue';
import TeacherListModal from '@/components/proposal-components/TeacherListModal.vue';
import AddTeacherModal from '@/components/proposal-components/AddTeacherModal.vue';

interface Teacher {
  name: string;
  department?: string;
  title?: string;
  teacherId?: string;
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
const isApproveMode = ref(false);
const approveProposalId = ref('');
const editProposalId = ref('');

const formData = reactive({
    courseName: '',
    courseCode: '',
    department: '',
    category: '',
    teachers: [] as Teacher[],
    campuses: [] as string[],
    showUsername: null as boolean | null,
    reason: ''
});

const campusOptions = campusesData;

const showSearchModal = ref(false);
const showTeacherModal = ref(false);
const showAddTeacherForm = ref(false);
const editingTeacherIndex = ref(-1);
const currentField = ref('');

const teacherBeingEdited = computed<Teacher | null>(() => {
    if (editingTeacherIndex.value < 0) return null;
    return formData.teachers[editingTeacherIndex.value] || null;
});

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

const currentSearchValue = computed(() => {
    const values: Record<string, string> = {
        courseName: formData.courseName,
        courseCode: formData.courseCode,
        department: formData.department,
        category: formData.category
    };
    return values[currentField.value] || '';
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
    editingTeacherIndex.value = -1;
    showTeacherModal.value = false;
    showAddTeacherForm.value = true;
};

const handleEditTeacher = (index: number) => {
    editingTeacherIndex.value = index;
    showTeacherModal.value = false;
    showAddTeacherForm.value = true;
};

const handleRemoveTeacher = (index: number) => {
    formData.teachers.splice(index, 1);
};

const handleConfirmAddTeacher = (teacher: Teacher) => {
    if (editingTeacherIndex.value >= 0) {
        formData.teachers.splice(editingTeacherIndex.value, 1, teacher);
    } else {
        formData.teachers.push(teacher);
    }
    editingTeacherIndex.value = -1;
    showTeacherModal.value = true;
};

const handleTeacherEditorClose = () => {
    editingTeacherIndex.value = -1;
    showTeacherModal.value = true;
};

const goBack = () => {
    uni.navigateBack();
};

const fillFormFromProposal = (proposal: any) => {
    const course = proposal.course || {};
    formData.courseName = course.name || proposal.title || '';
    formData.courseCode = course.code || '';
    formData.department = course.department || '';
    formData.category = course.category || '';
    formData.campuses = Array.isArray(course.campuses) ? [...course.campuses] : [];
    formData.teachers = Array.isArray(course.teachers)
        ? course.teachers.map((t: any, index: number) => ({
            name: typeof t === 'string' ? t : t.name || '',
            department: typeof t === 'string' ? '' : t.department || '',
            title: typeof t === 'string' ? '' : t.title || '',
            teacherId: typeof t === 'string'
                ? course.teacherIds?.[index] || course.teacher_ids?.[index] || undefined
                : t.teacherId || t.teacherID || t.teacher_id || t.id || t._id || t.teacher?.id
                    || course.teacherIds?.[index] || course.teacher_ids?.[index] || undefined
          }))
        : [];
    formData.showUsername = proposal.showUsername ?? null;
    formData.reason = proposal.content || '';
};

const hydrateExistingTeacherIdsForApproval = async () => {
    const unresolvedTeachers = formData.teachers.filter(teacher => !teacher.teacherId && teacher.name.trim());
    await Promise.all(unresolvedTeachers.map(async (teacher) => {
        try {
            const res = await http.ProposalController.proposalFieldSuggestionsList({
                field: 'teacherName',
                keyword: teacher.name.trim(),
                page: 0,
                pageSize: 50
            });
            if (res.data?.code !== 0) return;
            const responseData: any = res.data.data || res.data;
            const exactMatches = (responseData?.suggestions || []).filter((suggestion: any) => {
                const suggestionName = String(suggestion.value || suggestion.label || '').trim();
                return suggestion.id && suggestionName === teacher.name.trim();
            });
            const titleMatches = teacher.title
                ? exactMatches.filter((suggestion: any) => {
                    const suggestionTitle = String(suggestion.title || '').trim();
                    const label = String(suggestion.label || '').trim();
                    return suggestionTitle === teacher.title || label.endsWith(`- ${teacher.title}`);
                })
                : [];
            const matchedTeacher = titleMatches[0] || exactMatches[0];
            if (matchedTeacher) {
                teacher.teacherId = matchedTeacher.id;
            }
        } catch (err) {
            console.error('[API] 补全已有教师ID失败:', err);
        }
    }));
};

const fetchProposalForForm = async (id: string) => {
    try {
        const res = await http.ProposalController.proposalDetail(id);
        if (res.data?.code === 0) {
            const proposal = res.data.proposal || res.data.data?.proposal;
            if (proposal) {
                fillFormFromProposal({
                    ...proposal,
                    finalCourse: proposal.finalCourse || proposal.final_course
                });
                if (isApproveMode.value) {
                    await hydrateExistingTeacherIdsForApproval();
                }
            }
        } else {
            uni.showToast({ title: res.data?.msg || '获取提案信息失败', icon: 'none' });
        }
    } catch (err) {
        console.error('[API] 获取提案详情失败:', err);
        uni.showToast({ title: '获取提案信息失败', icon: 'none' });
    }
};

const getProposalSubmitErrorMessage = (message: unknown, fallback: string) => {
    const text = String(message || '').trim();
    const normalized = text.toLowerCase();
    const isDailyLimitError = /(daily|today|quota|limit|maximum|too many|exceed|max)/.test(normalized)
        && /(proposal|submit|create|quota|limit)/.test(normalized);
    if (isDailyLimitError) {
        return '今日提案提交次数已达上限，请明天再试';
    }
    if (normalized === 'network error') {
        return '网络错误，请检查网络连接';
    }
    return text || fallback;
};

const promptAndSaveNickname = () => new Promise<boolean>((resolve) => {
    uni.showModal({
        title: '请先设置昵称',
        content: '你选择了展示昵称，但尚未编辑昵称，请输入昵称后再提交。',
        editable: true,
        placeholderText: '请输入不超过20个字符的昵称',
        success: async (result: any) => {
            if (!result.confirm) {
                resolve(false);
                return;
            }

            const username = String(result.content || '').trim();
            if (!username) {
                uni.showToast({ title: '请输入昵称', icon: 'none' });
                resolve(false);
                return;
            }
            if (username.length > 20) {
                uni.showToast({ title: '昵称不能超过20个字符', icon: 'none' });
                resolve(false);
                return;
            }

            try {
                const res = await http.UserController.userProfileUpdateCreate({ username });
                if (res.data?.code === 0) {
                    uni.showToast({ title: '昵称已保存', icon: 'success' });
                    resolve(true);
                } else {
                    uni.showToast({ title: res.data?.msg || '昵称保存失败', icon: 'none' });
                    resolve(false);
                }
            } catch (err) {
                console.error('[API] 保存昵称失败:', err);
                uni.showToast({ title: '昵称保存失败', icon: 'none' });
                resolve(false);
            }
        },
        fail: () => resolve(false)
    } as any);
});

const ensureDisplayUsername = async (): Promise<boolean> => {
    try {
        const res = await http.UserController.userProfileList();
        if (res.data?.code !== 0) {
            uni.showToast({ title: res.data?.msg || '获取用户昵称失败', icon: 'none' });
            return false;
        }

        const profile: any = res.data.data || res.data;
        if (String(profile?.username || '').trim()) return true;

        const canEditUsername = profile?.canEditUsername ?? profile?.can_edit_username ?? true;
        if (!canEditUsername) {
            uni.showToast({ title: '当前无法修改昵称，请选择不展示昵称', icon: 'none' });
            return false;
        }

        return promptAndSaveNickname();
    } catch (err) {
        console.error('[API] 检查用户昵称失败:', err);
        uni.showToast({ title: '获取用户昵称失败', icon: 'none' });
        return false;
    }
};

onLoad((options: any) => {
    if (options.approveProposalId) {
        isApproveMode.value = true;
        approveProposalId.value = options.approveProposalId;
        fetchProposalForForm(options.approveProposalId);
    } else if (options.editProposalId) {
        editProposalId.value = options.editProposalId;
        fetchProposalForForm(options.editProposalId);
    }
});

const submit = async () => {
    if (!formData.courseName.trim()) return uni.showToast({ title: '请输入课程名称', icon: 'none' });
    if (!formData.department) return uni.showToast({ title: '请选择开课院系', icon: 'none' });
    if (formData.teachers.length === 0) return uni.showToast({ title: '请添加授课教师', icon: 'none' });
    if (formData.campuses.length === 0) return uni.showToast({ title: '请选择开课校区', icon: 'none' });

    submitting.value = true;

    if (!isApproveMode.value && formData.showUsername === true) {
        const usernameReady = await ensureDisplayUsername();
        if (!usernameReady) {
            submitting.value = false;
            return;
        }
    }

    try {
        if (isApproveMode.value && approveProposalId.value) {
            const approvedCourseName = formData.courseName.trim();
            const approveBody = {
                proposalID: approveProposalId.value,
                title: approvedCourseName,
                finalCourse: {
                    name: approvedCourseName,
                    code: (formData.courseCode || '').trim().toUpperCase(),
                    department: formData.department,
                    category: formData.category,
                    campuses: formData.campuses,
                    teachers: formData.teachers.map(t => ({
                        name: t.name,
                        title: (t as any).title || '',
                        department: t.department || '',
                        id: (t as any).teacherId || ''
                    }))
                }
            };

            const res = await http.ProposalController.proposalApproveCreate(
                approveProposalId.value,
                approveBody
            );

            if (res.data && res.data.code === 0) {
                uni.showToast({ title: '已通过', icon: 'success' });
                uni.$emit('proposalListShouldRefresh');
                setTimeout(() => uni.navigateBack(), 1500);
            } else {
                uni.showToast({ title: getProposalSubmitErrorMessage(res.data?.msg, '操作失败'), icon: 'none' });
            }
        } else {
            const requestBody = {
                title: formData.courseName.trim(),
                content: formData.reason.trim(),
                course: {
                    name: formData.courseName.trim(),
                    code: (formData.courseCode || '').trim().toUpperCase(),
                    department: formData.department,
                    category: formData.category,
                    teachers: formData.teachers.map(t => ({
                        name: t.name,
                        title: (t as any).title || '',
                        department: t.department || '',
                        id: (t as any).teacherId || ''
                    })),
                    campuses: formData.campuses
                },
                showUsername: formData.showUsername
            };

            const res = await http.ProposalController.proposalAddCreate(requestBody);

            if (res.data && res.data.code === 0) {
                uni.showToast({ title: '提交成功', icon: 'success' });
                uni.$emit('proposalListShouldRefresh');
                setTimeout(() => uni.navigateBack(), 1500);
            } else {
                uni.showToast({ title: getProposalSubmitErrorMessage(res.data?.msg, '提交失败'), icon: 'none' });
            }
        }
    } catch (error: any) {
        console.error('[API] 提案提交请求失败:', error.message || error);
        const responseMessage = error?.response?.data?.msg || error?.response?.data?.message || error?.message;
        uni.showToast({ title: getProposalSubmitErrorMessage(responseMessage, '网络错误，请检查网络连接'), icon: 'none' });
    } finally {
        submitting.value = false;
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
    background: #fff;
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

.field-hint {
    font-size: 24rpx;
    color: #999;
    margin-top: 12rpx;
}

.optional-mark {
    font-size: 24rpx;
    color: #999;
    font-weight: normal;
}

.optional-tag {
    font-size: 22rpx;
    color: #999;
    font-weight: normal;
    margin-left: 8rpx;
}

.reason-textarea {
    width: 100%;
    min-height: 120rpx;
    padding: 20rpx;
    font-size: 28rpx;
    color: #333;
    background-color: #f9f9f9;
    border-radius: 12rpx;
    box-sizing: border-box;
    line-height: 1.6;
}

.form-row-inline {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .label {
        font-size: 28rpx;
        color: #333;
        flex-shrink: 0;
    }

    .inline-tags {
        gap: 16rpx;
    }
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
