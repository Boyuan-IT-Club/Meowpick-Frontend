<template>
    <top-bar :selected="2" />

    <!-- 正文内容区域 -->
    <view class="content2">
      <view class="form-container">
        <!-- 两列三行表单区域 -->
        <view class="form-grid">
          <ProposeFormItem
            label="课程名称"
            v-model="formData.courseName"
            :options="courseNameOptions"
            placeholder="请输入课程名称"
            mode="single"
          />
          <ProposeFormItem
            label="开课院系（单选）"
            v-model="formData.department"
            :options="departments"
            placeholder="请输入或选择院系"
            mode="single"
          />
          <ProposeFormItem
            label="授课教师（多选）"
            v-model="formData.teachers"
            :options="teachersOptions"
            placeholder="请输入教师姓名"
            mode="multi"
          />
          <ProposeFormItem
            label="开课校区（多选）"
            v-model="formData.campuses"
            :options="campusOptions"
            placeholder="请选择校区"
            mode="dropdown-multi"
          />
          <ProposeFormItem
            label="课程代码"
            v-model="formData.courseCode"
            :options="courseCodeOptions"
            placeholder="请输入课程代码"
            mode="single"
          />
          <ProposeFormItem
            label="分类"
            v-model="formData.category"
            :options="categoryOptions"
            placeholder="请选择分类"
            mode="single"
          />
        </view>

        <!-- 其他部分保持不变 -->
        <!-- 新增理由输入框 -->
        <view class="reason-container">
          <text class="reason-label">你新增的理由：</text>
          <textarea class="reason-input" placeholder="请详细描述新增该课程的理由..." v-model="formData.reason"></textarea>
        </view>

        <!-- 发布按钮 -->
        <button class="publish-btn" @click="submitForm">发布</button>
      </view>
    </view>

</template>

<script setup lang="ts">
import { reactive } from 'vue';
import ProposeFormItem from '@/components/propose-form/index.vue';
import api from '@/config/utils/http';
import type { DtoCourseVO } from '@/api/data-contracts';

const campusOptions = ['普陀校区', '闵行校区', '临港校区'];

const departments = [
  '心理与认知科学学院',
  '社会发展学院',
  '化学与分子工程学院',
  '空间人工智能学院',
  '数据科学与工程学院',
  '党委学生工作部',
  '美术学院',
  '软件工程学院',
  '教育学部',
  '国际教育中心',
  '教育信息技术学系',
  '外语学院办公室',
  '英语系',
  '日语系',
  '大学英语教学部',
  '法语系',
  '中国语言文学系',
  '德语系',
  '教育科学学院',
  '历史学系',
  '俄语系',
  '哲学系',
  '法学院',
  '马克思主义学院',
  '经济与管理学院',
  '亚欧商学院',
  '大学体育教学部',
  '翻译系外语学院',
  '党委武装部',
  '创新创业学院',
  '医学与健康研究院',
  '数学科学学院',
  '物理学院',
  '政治与国际关系学院',
  '公共管理学院',
  '统计学院',
  '生态与环境科学学院',
  '地理科学学院',
  '体育与健康学院',
  '信息与电子工程学院(集成电路科学与工程学院)',
  '生命科学学院',
  '音乐学院',
  '计算机科学与技术学院',
  '国际汉语文化学院',
  '传播学院',
  '设计学院',
  '河口海岸科学研究院'
];

const courseNameOptions = [
  '高等数学A',
  '线性代数',
  '大学物理',
  '程序设计基础',
  '数据结构',
  '操作系统',
  '计算机网络',
  '数据库原理',
  '软件工程',
  '人工智能导论'
];

const courseCodeOptions = [
  'MATH101',
  'MATH102',
  'PHYS101',
  'CS101',
  'CS201',
  'CS301',
  'CS401',
  'CS501',
  'CS601',
  'AI101'
];

const teachersOptions = [
  '张三',
  '李四',
  '王五',
  '赵六',
  '孙七',
  '周八',
  '吴九',
  '郑十'
];

const categoryOptions = [
  '公共必修',
  '通识教育课',
  '学科基础课',
  '专业课'
];

const formData = reactive({
  courseName: '',
  department: '',
  teachers: '',
  campuses: '',
  courseCode: '',
  category: '',
  reason: ''
});

// 表单提交 - 更新验证条件
const submitForm = async () => {
  if (!formData.courseName || !formData.reason || !formData.department || !formData.category || !formData.campuses) {
    uni.showToast({ 
      title: '课程名称、理由、院系、多选校区和分类不能为空', 
      icon: 'none' 
    });
    return;
  }

  const teachersArray = formData.teachers ? formData.teachers.split(',').map(t => t.trim()).filter(t => t) : [];
  const campusesArray = formData.campuses ? formData.campuses.split(',').map(c => c.trim()).filter(c => c) : [];

  const courseData: DtoCourseVO = {
    name: formData.courseName,
    department: formData.department,
    category: formData.category,
    code: formData.courseCode || undefined,
    campuses: campusesArray.length > 0 ? campusesArray : undefined,
    teachers: teachersArray.length > 0 ? teachersArray.map(name => ({ 
      name, 
      title: '', 
      department: formData.department, 
      id: undefined 
    })) : undefined
  };

  const requestData = {
    title: formData.courseName,
    content: formData.reason,
    course: courseData
  };

  console.log('提交的请求数据:', JSON.stringify(requestData, null, 2));

  try {
    const response = await api.ProposalController.proposalAddCreate(requestData);
    console.log('API响应:', response);
    console.log('响应数据:', response.data);
    
    if (response.data?.data?.proposalId) {
      uni.showToast({ title: '发布成功', icon: 'success' });
      setTimeout(() => uni.navigateBack(), 1500);
    } else {
      console.error('响应中没有proposalId:', response.data);
      uni.showToast({ title: '发布失败', icon: 'none' });
    }
  } catch (err) {
    console.error('发布提案失败:', err);
    console.error('错误详情:', JSON.stringify(err, null, 2));
    uni.showToast({ title: '发布失败', icon: 'none' });
  }
};

</script>

<style scoped lang="scss">
/* 样式保持不变 */
.form-item {
    .picker {
      position: relative;
      width: 100%;
      min-height: 10vw;
      border: 1px solid #e5e5e5;
      border-radius: 2vw;
      padding: 1vw 3vw;
      box-sizing: border-box;
      align-items: center;
      background-color: #ffffff;
    }
    
    .picker-view {
      width: 100%;
      min-height: 8vw;
      display: flex;
      align-items: center;
      font-size: 3.5vw;
      color: #333;
      flex-wrap: wrap;
      gap: 1vw;
    }
    
    .campus-tags-container {
      width: 100%;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 1vw;
    }
    
    .campus-placeholder {
      color: #999;
    }
    
    .campus-tags-container .teacher-tag {
      margin-right: 1vw;
    }

    // 校区选择器样式
    .campus-selector, .campus-multi-selector {
      position: relative;
      width: 100%;
    }

    .campus-panel {
      position: absolute;
      top: 100%;
      left: 0;
      width: 100%;
      background-color: #fff;
      border: 1px solid #e5e5e5;
      border-radius: 2vw;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      z-index: 10;
      padding: 2vw 0;
      max-height: 50vw; /* 增加最大高度，避免院系过多时超出屏幕 */
      overflow-y: auto; /* 院系过多时可滚动 */
      margin-top: 1vw;
    }

    .campus-item {
      padding: 2vw 3vw;
      font-size: 3.5vw;
      cursor: pointer;
      
      &:hover {
        background-color: #f5f5f5;
      }
      
      .checkbox-container {
        display: flex;
        align-items: center;
      }
      
      .checkbox {
        width: 4vw;
        height: 4vw;
        border: 1px solid #ccc;
        border-radius: 0.5vw;
        margin-right: 2vw;
        position: relative;
      }
      
      .checkbox.checked::after {
        content: '';
        position: absolute;
        width: 2vw;
        height: 4vw;
        top: -1vw;
        left: 1vw;
        border: solid #b70030;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }
    }

    .arrow-icon {
      position: absolute;
      right: 3vw;
      top: 50%;
      transform: translateY(-50%);
      width: 4vw;
      height: 4vw;
      transition: transform 0.3s ease;
    }

    .rotate {
      transform: translateY(-50%) rotate(180deg);
    }
  }


  .content2 {
    padding-top: 28vw;
    padding-bottom: 25vw;
    width: 100%;
    box-sizing: border-box;
    position: relative;
    z-index: 1;
    min-height: 100vh;
  }

  .form-container {
    width: 90vw;
    margin: 0 auto;
    background-color: #ffffff;
    border-radius: 3vw;
    padding: 5vw;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4vw;
    margin-bottom: 5vw;
    align-items: stretch;
  }

  .form-item {
    display: flex;
    flex-direction: column;
    gap: 1vw;
    height: 100%;

    .label {
      font-size: 3.5vw;
      color: #333333;
      line-height: 1.5;
    }

    .input {
      width: 100%;
      height: 10vw;
      border: 1px solid #e5e5e5;
      border-radius: 2vw;
      padding: 0 3vw;
      box-sizing: border-box;
      font-size: 3.5vw;
    }
  }

  .reason-container {
    margin-bottom: 6vw;

    .reason-label {
      display: block;
      font-size: 3.5vw;
      color: #333333;
      margin-bottom: 2vw;
    }

    .reason-input {
      width: 100%;
      min-height: 25vw;
      border: 1px solid #e5e5e5;
      border-radius: 2vw;
      padding: 3vw;
      box-sizing: border-box;
      font-size: 3.5vw;
      line-height: 1.6;
      resize: none;
      background-color: #ffffff;
    }
  }
  


  .publish-btn {
    width: 40vw;
    height: 12vw;
    background-color: #b70030;
    color: white;
    border-radius: 6vw;
    font-size: 4.5vw;
    font-weight: bold;
    line-height: 12vw;
    text-align: center;
    margin: 0 auto;
    border: none;
    padding: 0;
  }


</style>