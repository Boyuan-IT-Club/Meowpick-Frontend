<template>
    <top-bar :selected="2" />

    <!-- 正文内容区域 -->
    <view class="content2">
      <view class="form-container">
        <!-- 两列三行表单区域 -->
        <view class="form-grid">
          <!-- 第一行 -->
          <view class="form-item">
            <text class="label">课程名称</text>
            <view class="tag-selector">
              <view class="tags-container">
                <view 
                  v-for="(tag, index) in formData.courseName ? [formData.courseName] : []" 
                  :key="index"
                  :class="['tag', courseNameOptions.includes(tag) ? 'existing-tag' : 'new-tag']"
                >
                  {{ tag }}
                  <text class="tag-remove" @click.stop="formData.courseName = ''">×</text>
                </view>
                <input
                  type="text"
                  class="tag-input"
                  :placeholder="formData.courseName ? '' : '请输入课程名称'"
                  v-model="courseNameInput"
                  @input="handleCourseNameInput"
                  @focus="showCourseNamePanel = true"
                  @blur="handleCourseNameBlur"
                  style="min-width: 35vw;"
                />
              </view>
              
              <view class="tag-panel" v-if="showCourseNamePanel">
                <view 
                  class="tag-item" 
                  v-for="(item, index) in filteredCourseNames" 
                  :key="index"
                  @click="selectCourseName(item)"
                >
                  {{ item }}
                </view>
                <view class="tag-add-new" @click="addNewCourseName">
                  <text class="add-icon">+</text>
                  <text>新增：{{ courseNameInput }}</text>
                </view>
              </view>
            </view>
          </view>
          <view class="form-item">
            <text class="label">开课院系（单选）</text>
            <view class="tag-selector">
              <view class="tags-container">
                <view 
                  v-for="(tag, index) in formData.department ? [formData.department] : []" 
                  :key="index"
                  :class="['tag', departments.includes(tag) ? 'existing-tag' : 'new-tag']"
                >
                  {{ tag }}
                  <text class="tag-remove" @click.stop="formData.department = ''">×</text>
                </view>
                <input
                  type="text"
                  class="tag-input"
                  :placeholder="formData.department ? '' : '请输入或选择院系'"
                  v-model="departmentInput"
                  @input="handleDepartmentInput"
                  @focus="showDepartmentPanel = true"
                  @blur="handleDepartmentBlur"
                  style="min-width: 35vw;"
                />
              </view>
              
              <view class="tag-panel" v-if="showDepartmentPanel">
                <view 
                  class="tag-item" 
                  v-for="(item, index) in filteredDepartments" 
                  :key="index"
                  @click="selectDepartment(item)"
                >
                  {{ item }}
                </view>
                <view class="tag-add-new" @click="addNewDepartment">
                  <text class="add-icon">+</text>
                  <text>新增：{{ departmentInput }}</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 其他部分保持不变 -->
          <!-- 第二行 -->
          <view class="form-item">
            <text class="label">授课教师（多选）</text>
            <view class="teacher-multi-selector">
              <view class="teacher-tags-container">
                <view 
                  v-for="(teacher, index) in formData.teachers.split(',').filter(v => v.trim())" 
                  :key="index"
                  :class="['teacher-tag', teachersOptions.includes(teacher.trim()) ? 'existing-tag' : 'new-tag']"
                >
                  {{ teacher.trim() }}
                  <text class="teacher-tag-remove" @click.stop="removeTeacher(teacher.trim())">×</text>
                </view>
                <input
                  type="text"
                  class="teacher-input"
                  :placeholder="hasTeachers ? '' : '请输入教师姓名'"
                  v-model="teacherInput"
                  @input="handleTeacherInput"
                  @focus="showTeacherPanel = true"
                  @blur="handleTeacherBlur"
                  style="min-width: 35vw;"
                />
              </view>
              
              <view class="teacher-panel" v-if="showTeacherPanel">
                <view 
                  class="teacher-item" 
                  v-for="(teacher, index) in filteredTeachers" 
                  :key="index"
                  @click="selectTeacher(teacher)"
                >
                  {{ teacher }}
                </view>
                <view class="teacher-add-new" @click="addNewTeacher">
                  <text class="add-icon">+</text>
                  <text>新增：{{ teacherInput }}</text>
                </view>
              </view>
            </view>
          </view>
          <view class="form-item">
            <text class="label">开课校区（多选）</text>
            <view class="campus-multi-selector">
              <view class="picker" @click="toggleMultiCampusPanel">
                <view class="picker-view campus-tags-container">
                  <view 
                    v-for="(campus, index) in selectedMultiCampuses" 
                    :key="index"
                    :class="['teacher-tag', 'existing-tag']"
                  >
                    {{ campus }}
                    <text class="teacher-tag-remove" @click.stop="removeCampus(campus)">×</text>
                  </view>
                  <view v-if="selectedMultiCampuses.length === 0" class="campus-placeholder">请选择校区</view>
                  <image 
                    src="../../images/arrow-down.png" 
                    class="arrow-icon" 
                    :class="{ 'rotate': isMultiCampusPanelOpen }"
                  />
                </view>
              </view>
              
              <!-- 多校区选择面板 -->
              <view class="campus-panel" v-if="isMultiCampusPanelOpen">
                <view 
                  class="campus-item" 
                  v-for="(item, index) in campusOptions" 
                  :key="index"
                  @click="handleMultiCampusSelect(item)"
                >
                  <view class="checkbox-container">
                    <view class="checkbox" :class="{ 'checked': selectedMultiCampuses.includes(item) }"></view>
                    <text>{{ item }}</text>
                  </view>
                </view>
              </view>
            </view>
          </view>

          <!-- 第三行 -->
          <view class="form-item">
            <text class="label">课程代码</text>
            <view class="tag-selector">
              <view class="tags-container">
                <view 
                  v-for="(tag, index) in formData.courseCode ? [formData.courseCode] : []" 
                  :key="index"
                  :class="['tag', courseCodeOptions.includes(tag) ? 'existing-tag' : 'new-tag']"
                >
                  {{ tag }}
                  <text class="tag-remove" @click.stop="formData.courseCode = ''">×</text>
                </view>
                <input
                  type="text"
                  class="tag-input"
                  :placeholder="formData.courseCode ? '' : '请输入课程代码'"
                  v-model="courseCodeInput"
                  @input="handleCourseCodeInput"
                  @focus="showCourseCodePanel = true"
                  @blur="handleCourseCodeBlur"
                  style="min-width: 35vw;"
                />
              </view>
              
              <view class="tag-panel" v-if="showCourseCodePanel">
                <view 
                  class="tag-item" 
                  v-for="(item, index) in filteredCourseCodes" 
                  :key="index"
                  @click="selectCourseCode(item)"
                >
                  {{ item }}
                </view>
                <view class="tag-add-new" @click="addNewCourseCode">
                  <text class="add-icon">+</text>
                  <text>新增：{{ courseCodeInput }}</text>
                </view>
              </view>
            </view>
          </view>
          <view class="form-item">
            <text class="label">分类</text>
            <view class="tag-selector">
              <view class="tags-container">
                <view 
                  v-for="(tag, index) in formData.category ? [formData.category] : []" 
                  :key="index"
                  :class="['tag', categoryOptions.includes(tag) ? 'existing-tag' : 'new-tag']"
                >
                  {{ tag }}
                  <text class="tag-remove" @click.stop="formData.category = ''">×</text>
                </view>
                <input
                  type="text"
                  class="tag-input"
                  :placeholder="formData.category ? '' : '请选择分类'"
                  v-model="categoryInput"
                  @input="handleCategoryInput"
                  @focus="showCategoryPanel = true"
                  @blur="handleCategoryBlur"
                  style="min-width: 35vw;"
                />
              </view>
              
              <view class="tag-panel" v-if="showCategoryPanel">
                <view 
                  class="tag-item" 
                  v-for="(item, index) in filteredCategories" 
                  :key="index"
                  @click="selectCategory(item)"
                >
                  {{ item }}
                </view>
                <view class="tag-add-new" @click="addNewCategory">
                  <text class="add-icon">+</text>
                  <text>新增：{{ categoryInput }}</text>
                </view>
              </view>
            </view>
          </view>
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
import { reactive, ref, computed } from 'vue';

// 计算属性：判断是否已有教师
const hasTeachers = computed(() => {
  return formData.teachers.split(',').filter(v => v.trim()).length > 0;
});

// 校区选项
const campusOptions = ['普陀校区', '闵行校区', '临港校区'];

// 开课院系选项
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

// 课程名称选项（示例数据，实际项目中可能从API获取）
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

// 课程代码选项（示例数据，实际项目中可能从API获取）
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

// 教师选项（示例数据，实际项目中可能从API获取）
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

// 多选校区相关
const isMultiCampusPanelOpen = ref(false);
const selectedMultiCampuses = ref<string[]>([]);

// 移除校区
const removeCampus = (campus: string) => {
  const index = selectedMultiCampuses.value.indexOf(campus);
  if (index > -1) {
    selectedMultiCampuses.value.splice(index, 1);
    // 更新表单数据
    formData.campuses = selectedMultiCampuses.value.join(',');
  }
};

// 教师多选相关
const teacherInput = ref('');
const showTeacherPanel = ref(false);
const filteredTeachers = ref<string[]>([]);

// 教师输入处理
const handleTeacherInput = () => {
  if (teacherInput.value.trim()) {
    filteredTeachers.value = teachersOptions.filter(teacher => 
      teacher.toLowerCase().includes(teacherInput.value.toLowerCase())
    );
  } else {
    filteredTeachers.value = teachersOptions;
  }
  // 始终显示面板
  showTeacherPanel.value = true;
};

// 教师面板失焦处理
const handleTeacherBlur = () => {
  setTimeout(() => {
    showTeacherPanel.value = false;
  }, 200);
};

// 选择教师
const selectTeacher = (teacher: string) => {
  const currentTeachers = formData.teachers.split(',').filter(v => v.trim());
  if (!currentTeachers.includes(teacher)) {
    formData.teachers = currentTeachers.length > 0 
      ? currentTeachers.join(', ') + ', ' + teacher 
      : teacher;
  }
  teacherInput.value = '';
  filteredTeachers.value = [];
  showTeacherPanel.value = false;
};

// 新增教师
const addNewTeacher = () => {
  if (teacherInput.value.trim()) {
    const newTeacher = teacherInput.value.trim();
    const currentTeachers = formData.teachers.split(',').filter(v => v.trim());
    if (!currentTeachers.includes(newTeacher)) {
      formData.teachers = currentTeachers.length > 0 
        ? currentTeachers.join(', ') + ', ' + newTeacher 
        : newTeacher;
    }
    teacherInput.value = '';
    filteredTeachers.value = [];
    showTeacherPanel.value = false;
  }
};

// 移除教师
const removeTeacher = (teacher: string) => {
  const currentTeachers = formData.teachers.split(',').filter(v => v.trim());
  const newTeachers = currentTeachers.filter(t => t.trim() !== teacher);
  formData.teachers = newTeachers.join(', ');
};

// 课程名称相关
const courseNameInput = ref('');
const showCourseNamePanel = ref(false);
const filteredCourseNames = ref<string[]>([]);

const handleCourseNameInput = () => {
  if (courseNameInput.value.trim()) {
    filteredCourseNames.value = courseNameOptions.filter(course => 
      course.toLowerCase().includes(courseNameInput.value.toLowerCase())
    );
  } else {
    filteredCourseNames.value = courseNameOptions;
  }
  // 始终显示面板
  showCourseNamePanel.value = true;
};

const handleCourseNameBlur = () => {
  setTimeout(() => {
    showCourseNamePanel.value = false;
  }, 200);
};

const selectCourseName = (course: string) => {
  formData.courseName = course;
  courseNameInput.value = '';
  filteredCourseNames.value = [];
  showCourseNamePanel.value = false;
};

const addNewCourseName = () => {
  if (courseNameInput.value.trim()) {
    formData.courseName = courseNameInput.value.trim();
    courseNameInput.value = '';
    filteredCourseNames.value = [];
    showCourseNamePanel.value = false;
  }
};

// 院系相关
const departmentInput = ref('');
const showDepartmentPanel = ref(false);
const filteredDepartments = ref<string[]>([]);

const handleDepartmentInput = () => {
  if (departmentInput.value.trim()) {
    filteredDepartments.value = departments.filter(dept => 
      dept.toLowerCase().includes(departmentInput.value.toLowerCase())
    );
  } else {
    filteredDepartments.value = departments;
  }
  // 始终显示面板
  showDepartmentPanel.value = true;
};

const handleDepartmentBlur = () => {
  setTimeout(() => {
    showDepartmentPanel.value = false;
  }, 200);
};

const selectDepartment = (dept: string) => {
  formData.department = dept;
  departmentInput.value = '';
  filteredDepartments.value = [];
  showDepartmentPanel.value = false;
};

const addNewDepartment = () => {
  if (departmentInput.value.trim()) {
    formData.department = departmentInput.value.trim();
    departmentInput.value = '';
    filteredDepartments.value = [];
    showDepartmentPanel.value = false;
  }
};

// 课程代码相关
const courseCodeInput = ref('');
const showCourseCodePanel = ref(false);
const filteredCourseCodes = ref<string[]>([]);

const handleCourseCodeInput = () => {
  if (courseCodeInput.value.trim()) {
    filteredCourseCodes.value = courseCodeOptions.filter(code => 
      code.toLowerCase().includes(courseCodeInput.value.toLowerCase())
    );
  } else {
    filteredCourseCodes.value = courseCodeOptions;
  }
  // 始终显示面板
  showCourseCodePanel.value = true;
};

const handleCourseCodeBlur = () => {
  setTimeout(() => {
    showCourseCodePanel.value = false;
  }, 200);
};

const selectCourseCode = (code: string) => {
  formData.courseCode = code;
  courseCodeInput.value = '';
  filteredCourseCodes.value = [];
  showCourseCodePanel.value = false;
};

const addNewCourseCode = () => {
  if (courseCodeInput.value.trim()) {
    formData.courseCode = courseCodeInput.value.trim();
    courseCodeInput.value = '';
    filteredCourseCodes.value = [];
    showCourseCodePanel.value = false;
  }
};

// 分类相关
const categoryInput = ref('');
const showCategoryPanel = ref(false);
const filteredCategories = ref<string[]>([]);

const handleCategoryInput = () => {
  if (categoryInput.value.trim()) {
    filteredCategories.value = categoryOptions.filter(category => 
      category.toLowerCase().includes(categoryInput.value.toLowerCase())
    );
  } else {
    filteredCategories.value = categoryOptions;
  }
  // 始终显示面板
  showCategoryPanel.value = true;
};

const handleCategoryBlur = () => {
  setTimeout(() => {
    showCategoryPanel.value = false;
  }, 200);
};

const selectCategory = (category: string) => {
  formData.category = category;
  categoryInput.value = '';
  filteredCategories.value = [];
  showCategoryPanel.value = false;
};

const addNewCategory = () => {
  if (categoryInput.value.trim()) {
    formData.category = categoryInput.value.trim();
    categoryInput.value = '';
    filteredCategories.value = [];
    showCategoryPanel.value = false;
  }
};

// 其他部分保持不变
// 多选校区选择逻辑
const toggleMultiCampusPanel = () => {
  isMultiCampusPanelOpen.value = !isMultiCampusPanelOpen.value;
  // 关闭其他面板
  if (isMultiCampusPanelOpen.value) {
    isCampusPanelOpen.value = false;
    isCategoryPanelOpen.value = false;
  }
};

const handleMultiCampusSelect = (item: string) => {
  const index = selectedMultiCampuses.value.indexOf(item);
  if (index > -1) {
    // 已选中，取消选择
    selectedMultiCampuses.value.splice(index, 1);
  } else {
    // 未选中，添加选择
    selectedMultiCampuses.value.push(item);
  }
  // 更新表单数据
  formData.campuses = selectedMultiCampuses.value.join(',');
};

// 分类选项
const categoryOptions = [
  '公共必修',
  '通识教育课',
  '学科基础课',
  '专业课'
];

// 表单数据 - 修改campus为department
const formData = reactive({
  courseName: '',
  department: '', // 存储选中的院系
  teachers: '',
  campuses: '', // 存储选中的多选校区，用逗号分隔
  courseCode: '',
  category: '', // 存储选中的分类
  reason: ''
});

// 表单提交 - 更新验证条件
const submitForm = () => {
  // 检查是否有未处理的输入内容
  if (courseNameInput.value.trim() || departmentInput.value.trim() || teacherInput.value.trim() || courseCodeInput.value.trim() || categoryInput.value.trim()) {
    uni.showToast({ 
      title: '请先处理输入框中的内容（选择已有选项或点击新增）', 
      icon: 'none' 
    });
    return;
  }

  // 增加院系和分类的必填验证
  if (!formData.courseName || !formData.reason || !formData.department || !formData.category || !formData.campuses) {
    uni.showToast({ 
      title: '课程名称、理由、院系、多选校区和分类不能为空', 
      icon: 'none' 
    });
    return;
  }

  // 构建完整提案数据（包含默认1人同意）
  const proposalData = {
    ...formData,
    agreeCount: 1,  // 默认1人同意
    id: Date.now(),  // 临时ID，实际项目用后端返回的ID
    createTime: new Date().toLocaleString(),
    status: 'pending'
  };
  
  console.log('提交表单数据:', proposalData);

  // 小程序环境使用wx存储API
  let proposals = wx.getStorageSync('proposals') || [];
  proposals.unshift(proposalData);  // 添加到数组开头
  wx.setStorageSync('proposals', proposals);
  
  uni.showToast({ title: '发布成功', icon: 'success' });
  setTimeout(() => uni.navigateBack(), 1500);
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

    .tag-selector,
    .teacher-multi-selector,
    .campus-multi-selector {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    // 教师多选样式
    .teacher-multi-selector {
      position: relative;
      width: 100%;
    }

    .teacher-tags-container {
      position: relative;
      width: 100%;
      min-height: 10vw;
      border: 1px solid #e5e5e5;
      border-radius: 2vw;
      padding: 1vw;
      box-sizing: border-box;
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      gap: 1vw;
      background-color: #ffffff;
    }

    .teacher-tags-container .teacher-tag,
    .campus-tags-container .teacher-tag {
      display: inline-flex;
      align-items: center;
      padding: 1vw 2vw;
      border-radius: 2vw;
      font-size: 3vw;
      height: auto;
      min-height: 6vw;
      line-height: 1.5;
      word-wrap: break-word;
      white-space: normal;
      max-width: 100%;
      box-sizing: border-box;
    }
    
    .teacher-tag.existing-tag {
      background-color: #b70030;
      color: white;
    }
    
    .teacher-tag.new-tag {
      background-color: #f0f0f0;
      color: #333;
    }
    
    /* 校区标签强制使用红色背景 */
    .campus-tags-container .teacher-tag {
      background-color: #b70030 !important;
      color: white !important;
    }

    .teacher-tag-remove {
      margin-left: 1vw;
      cursor: pointer;
      font-size: 4vw;
      line-height: 1;
    }

    .teacher-input {
      flex: 0 1 auto;
      border: none;
      outline: none;
      font-size: 3.5vw;
      min-width: 15vw;
      max-width: 30vw;
      height: auto;
      min-height: 6vw;
      box-sizing: border-box;
      line-height: 1.5;
      text-align: left;
      direction: ltr;
      padding: 0.5vw 1vw;
    }
    
    .teacher-input:focus {
      outline: none;
    }
    
    /* 统一输入框样式 */
    .tag-selector {
      position: relative;
      width: 100%;
    }
    
    .tags-container {
      position: relative;
      width: 100%;
      min-height: 10vw;
      border: 1px solid #e5e5e5;
      border-radius: 2vw;
      padding: 1vw;
      box-sizing: border-box;
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      gap: 1vw;
      background-color: #ffffff;
    }
    
    .tags-container .tag {
      display: inline-flex;
      align-items: center;
      padding: 1vw 2vw;
      border-radius: 2vw;
      font-size: 3vw;
      height: auto;
      min-height: 6vw;
      line-height: 1.5;
      word-wrap: break-word;
      white-space: normal;
      max-width: 100%;
      box-sizing: border-box;
    }
    
    .tag.existing-tag {
      background-color: #b70030;
      color: white;
    }
    
    .tag.new-tag {
      background-color: #f0f0f0;
      color: #333;
    }
    
    .tag-remove {
      margin-left: 1vw;
      cursor: pointer;
      font-size: 4vw;
      line-height: 1;
    }
    
    .tag-input {
      flex: 0 1 auto;
      border: none;
      outline: none;
      font-size: 3.5vw;
      min-width: 15vw;
      max-width: 30vw;
      height: 6vw;
      box-sizing: border-box;
      line-height: 6vw;
      text-align: left;
      direction: ltr;
    }
    
    .tag-input:focus {
      outline: none;
    }
    
    .tag-panel {
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
      max-height: 50vw;
      overflow-y: auto;
      margin-top: 1vw;
    }
    
    .tag-item {
      padding: 2vw 3vw;
      font-size: 3.5vw;
      cursor: pointer;
      
      &:hover {
        background-color: #f5f5f5;
      }
    }
    
    .tag-add-new {
      margin-top: 2vw;
      padding: 2vw 3vw;
      font-size: 3.5vw;
      cursor: pointer;
      transition: background-color 0.2s ease;
      display: flex;
      align-items: center;
      border-top: 1px solid #e5e5e5;
      
      &:hover {
        background-color: #f5f5f5;
      }
      
      .add-icon {
        width: 4vw;
        height: 4vw;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #b70030;
        color: white;
        border-radius: 50%;
        margin-right: 2vw;
        font-size: 3vw;
      }
    }

    .teacher-panel {
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
      max-height: 50vw;
      overflow-y: auto;
      margin-top: 1vw;
    }

    .teacher-item {
      padding: 2vw 3vw;
      font-size: 3.5vw;
      cursor: pointer;
      transition: background-color 0.2s ease;

      &:hover {
        background-color: #f5f5f5;
      }
    }

    .teacher-add-new {
      margin-top: 2vw;
      padding: 2vw 3vw;
      font-size: 3.5vw;
      cursor: pointer;
      transition: background-color 0.2s ease;
      display: flex;
      align-items: center;
      border-top: 1px solid #e5e5e5;

      &:hover {
        background-color: #f5f5f5;
      }

      .add-icon {
        width: 4vw;
        height: 4vw;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #b70030;
        color: white;
        border-radius: 50%;
        margin-right: 2vw;
        font-size: 3vw;
      }
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
  
  /* 确保输入框样式统一，防止布局变化 */
  .tags-container,
  .teacher-tags-container {
    min-height: 10vw;
    box-sizing: border-box;
    width: 100%;
  }
  
  .tag-input,
  .teacher-input {
    flex: 1;
    min-width: 35vw;
    box-sizing: border-box;
    height: 6vw;
    line-height: 6vw;
    text-align: left;
    direction: ltr;
  }
  
  .tag,
  .teacher-tag {
    height: 6vw;
    line-height: 6vw;
    white-space: nowrap;
  }
  
  /* 确保表单网格布局稳定 */
  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4vw;
    margin-bottom: 5vw;
  }
  
  .form-item {
    display: flex;
    flex-direction: column;
    gap: 1vw;
  }
  
  /* 确保标签容器在多行时保持宽度一致 */
  .tags-container::after,
  .teacher-tags-container::after {
    content: '';
    flex: 1;
    min-width: 35vw;
    height: 6vw;
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