<template>
  <view class="container">
    <!-- Header -->
    <view class="nav-bar" :style="navBarStyle">
      <view class="nav-content" :style="navContentStyle">
        <!-- Left aligned Back Button -->
        <view class="nav-left" :style="navLeftStyle">
            <BackBtn />
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
         
         <view class="form-row">
            <view class="label">课程名称</view>
            <input class="input" v-model="formData.courseName" placeholder="请输入课程名称" />
         </view>
         
         <view class="form-row">
            <view class="label">课程代码</view>
            <input class="input" v-model="formData.courseCode" placeholder="请输入课程代码 (选填)" />
         </view>

         <view class="form-row">
            <view class="label">开课院系</view>
             <picker mode="selector" :range="departmentOptions" @change="onDepartmentChange">
                <view class="picker-display" :class="{ empty: !formData.department }">
                    {{ formData.department || '请选择院系' }}
                    <text class="arrow">></text>
                </view>
             </picker>
         </view>

         <view class="form-row">
            <view class="label">课程类别</view>
             <picker mode="selector" :range="categoryOptions" @change="onCategoryChange">
                <view class="picker-display" :class="{ empty: !formData.category }">
                    {{ formData.category || '请选择类别' }}
                    <text class="arrow">></text>
                </view>
             </picker>
         </view>
      </view>


      <!-- Section 2: Teaching Info -->
      <view class="card">
         <view class="card-title">教学信息</view>

         <view class="form-row">
            <view class="label">授课教师</view>
            <input class="input" v-model="formData.teacher" placeholder="多位教师请用逗号分隔" />
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
  </view>
</template>

<script setup lang="ts">
import { reactive, computed, ref } from 'vue';
import BackBtn from "@/components/common/BackBtn.vue";
import { http } from "@/config";
import { TOAST_DURATION_MS } from "@/utils/constants";

// System Info
const sysInfo = uni.getSystemInfoSync();
// 默认胶囊信息
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

const navMiddleStyle = computed(() => {
    return {
        height: menuButtonInfo.height + 'px',
        display: 'flex', 
        alignItems: 'center',
    };
});

const contentSpacerStyle = computed(() => {
    return {
        height: (menuButtonInfo.bottom + 12) + 'px'
    };
});

// Data
const submitting = ref(false);

const formData = reactive({
    courseName: '',
    courseCode: '',
    department: '',
    category: '',
    teacher: '',
    teachers: [] as string[],
    campuses: [] as string[],
    reason: ''
});

// Options
const campusOptions = ['普陀校区', '闵行校区', '临港校区'];
const departmentOptions = [
  '心理与认知科学学院', '社会发展学院', '化学与分子工程学院', '空间人工智能学院',
  '数据科学与工程学院', '美术学院', '软件工程学院', '教育学部', '国际教育中心',
  '外语学院', '英语系', '日语系', '大学英语教学部', '法语系', '中文系', '德语系',
  '历史学系', '哲学系', '法学院', '马克思主义学院', '经管学院', '商学院', '体育与健康学院',
  '数学科学学院', '物理学院', '政治与国际关系学院', '公共管理学院', '统计学院',
  '生态与环境科学学院', '地理科学学院', '生命科学学院', '音乐学院', '计算机学院',
  '传播学院', '设计学院', '其他'
];

const categoryOptions = ['必修课', '选修课', '通识课', '体育课', '其他'];

// Logic
const onDepartmentChange = (e: any) => {
    formData.department = departmentOptions[e.detail.value];
};

const onCategoryChange = (e: any) => {
    formData.category = categoryOptions[e.detail.value];
};

const toggleCampus = (campus: string) => {
    const idx = formData.campuses.indexOf(campus);
    if (idx > -1) {
        formData.campuses.splice(idx, 1);
    } else {
        formData.campuses.push(campus);
    }
};

const submit = async () => {
    if (!formData.courseName.trim()) return uni.showToast({ title: '请输入课程名称', icon: 'none' });
    if (!formData.department) return uni.showToast({ title: '请选择开课院系', icon: 'none' });
    if (!formData.reason.trim()) return uni.showToast({ title: '请填写提议理由', icon: 'none' });

    submitting.value = true;

    // 构建请求数据
    const reqData = {
      title: formData.courseName,
      content: formData.reason,
      course: {
        name: formData.courseName,
        code: formData.courseCode || undefined,
        department: formData.department,
        category: formData.category || undefined,
        campuses: formData.campuses.length > 0 ? formData.campuses : undefined,
        teachers: formData.teacher ? [{ name: formData.teacher }] : []
      }
    };

    http.ProposalController.proposalAddCreate(reqData).then((res: any) => {
      submitting.value = false;
      const code = res.data?.code;
      const msg = res.data?.msg;
      console.log('[propose] submit response:', res.data);
      if (code === 200 || code === 0 || code === 201) {
        uni.showToast({ title: '提交成功', icon: 'success' });
        setTimeout(() => uni.navigateBack(), TOAST_DURATION_MS);
      } else {
        uni.showToast({ title: msg || `提交失败(code:${code})`, icon: 'none' });
      }
    }).catch((err: any) => {
      submitting.value = false;
      const errMsg = err?.message || err?.response?.data?.msg || JSON.stringify(err);
      console.error('[propose] submit error:', err);
      uni.showToast({ title: `提交失败:${errMsg}`, icon: 'none' });
    });
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
    /* empty container can be targeted via inline styles */
}

.nav-title-container {
    margin-left: 32rpx; /* Gap = padding-left of navbar */
    display: flex;
    align-items: center;

    .nav-title {
        font-size: 36rpx;
        font-weight: 600;
        color: #333;
    }
}

/* .nav-middle {
    flex: 1;
    .nav-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
    }
} */
// Content Spacer handles margin

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
    transition: all 0.1s;
    
    &.active {
        background: #FFF0F6;
        color: #b20035;
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
    background: linear-gradient(135deg, #b20035, #ff4d6a);
    color: #fff;
    font-size: 32rpx;
    font-weight: bold;
    margin-top: 20rpx;
    box-shadow: 0 8rpx 24rpx rgba(178, 0, 53, 0.25);
    
    &:active {
        transform: scale(0.98);
        box-shadow: 0 4rpx 12rpx rgba(178, 0, 53, 0.15);
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