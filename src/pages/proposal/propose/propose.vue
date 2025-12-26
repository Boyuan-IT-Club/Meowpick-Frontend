<template>
    <top-bar :selected="2" />

    <!-- 正文内容区域 -->
    <view class="content">
      <view class="form-container">
        <!-- 两列三行表单区域 -->
        <view class="form-grid">
          <!-- 第一行 -->
          <view class="form-item">
            <text class="label">课程名称</text>
            <input type="text" class="input" placeholder="请输入课程名称" v-model="formData.courseName" />
          </view>
          <view class="form-item">
            <text class="label">开课院系（单选）</text>
            <view class="campus-selector">
              <view class="picker" @click="toggleCampusPanel">
                <view class="picker-view">
                  {{ selectedCampus || '请选择院系' }}
                  <image 
                    src="/static/images/arrow-down.png" 
                    class="arrow-icon" 
                    :class="{ 'rotate': isCampusPanelOpen }"
                  />
                </view>
              </view>
              
              <!-- 院系面板 -->
              <view class="campus-panel" v-if="isCampusPanelOpen">
                <view 
                  class="campus-item" 
                  v-for="(item, index) in departments" 
                  :key="index"
                  @click="handleCampusSelect(item)"
                >
                  {{ item }}
                </view>
              </view>
            </view>
          </view>

          <!-- 其他部分保持不变 -->
          <!-- 第二行 -->
          <view class="form-item">
            <text class="label">授课教师（多选）</text>
            <input type="text" class="input" placeholder="请输入教师姓名，用逗号分隔" v-model="formData.teachers" />
          </view>
          <view class="form-item">
            <text class="label">开课校区（多选）</text>
            <view class="campus-multi-selector">
              <view class="picker" @click="toggleMultiCampusPanel">
                <view class="picker-view">
                  {{ selectedMultiCampuses.length ? selectedMultiCampuses.join(',') : '请选择校区' }}
                  <image 
                    src="/static/images/arrow-down.png" 
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
            <input type="text" class="input" placeholder="请输入课程代码" v-model="formData.courseCode" />
          </view>
          <view class="form-item">
            <text class="label">分类</text>
            <!-- 分类选择器 -->
            <view class="category-selector">
              <view class="picker" @click="toggleCategoryPanel">
                <view class="picker-view">
                  {{ selectedCategoryPath || '请选择分类' }}
                  <image 
                    src="/static/images/arrow-down.png" 
                    class="arrow-icon" 
                    :class="{ 'rotate': isCategoryPanelOpen }"
                  />
                </view>
              </view>
              
              <!-- 分类层级面板 -->
              <view class="category-panel" v-if="isCategoryPanelOpen">
                <!-- 返回按钮 - 只有非顶级分类才显示 -->
                <view 
                  class="back-btn" 
                  @click="handleBack"
                  v-if="currentCategoryLevel > 0"
                >
                  <image src="/static/images/arrow-left.png" class="back-icon" />
                  <text>返回上一级</text>
                </view>
                
                <view class="category-level">
                  <view 
                    class="category-item" 
                    v-for="item in currentCategoryItems" 
                    :key="item.id"
                    @click="handleCategorySelect(item)"
                  >
                    {{ item.name }}
                    <image 
                      src="/static/images/arrow-right.png" 
                      class="right-arrow" 
                      v-if="item.children && item.children.length"
                    />
                  </view>
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

// 单选院系相关
const isCampusPanelOpen = ref(false);
const selectedCampus = ref('');

// 多选校区相关
const isMultiCampusPanelOpen = ref(false);
const selectedMultiCampuses = ref<string[]>([]);

// 单选院系选择逻辑
const toggleCampusPanel = () => {
  isCampusPanelOpen.value = !isCampusPanelOpen.value;
  // 关闭其他面板
  if (isCampusPanelOpen.value) {
    isMultiCampusPanelOpen.value = false;
    isCategoryPanelOpen.value = false;
  }
};

const handleCampusSelect = (item: string) => {
  selectedCampus.value = item;
  formData.department = item;  // 修改为department字段
  isCampusPanelOpen.value = false;
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

// 分类数据（层级结构）
const categoryData = [
  {
    id: 1,
    name: '公共必修',
    children: [
      { id: 11, name: '国情教育' },
      { id: 12, name: '英语类' },
      { id: 13, name: '体育类' },
      { id: 14, name: '思政类' }
    ]
  },
  {
    id: 2,
    name: '通识教育课程',
    children: [
      { id: 21, name: '人类思维与学科史论' },
      { id: 22, name: '经典阅读',
        children: [
          { id: 221, name: '伟大的智慧' }
        ]
      },
      { id: 23, name: '模块课程',
        children: [
          { id: 231, name: '实践、技术与创新' },
          { id: 232, name: '理性、科学与发展' },
          { id: 233, name: '思辨、推理与判断' },
          { id: 234, name: '文化、审美与诠释' },
          { id: 235, name: '价值、社会与进步' },
          { id: 236, name: '伦理、教育与沟通' }
        ]
      }
    ]
  },
  {
    id: 3,
    name: '学科基础课程',
    children: [
      { id: 31, name: '学科基础课' }
    ]
  },
  {
    id: 4,
    name: '专业教育课程',
    children: [
      { id: 41, name: '专业必修' },
      { id: 42, name: '专业限制选修' },
      { id: 43, name: '专业任意选修' }
    ]
  }
];

// 分类状态管理
const isCategoryPanelOpen = ref(false);
const currentCategoryItems = ref(categoryData); // 当前显示的分类项
const currentCategoryLevel = ref(0); // 当前分类层级
const categoryHistory = ref<any[]>([]); // 分类历史记录
const selectedCategory = ref<any>(null);
const categoryPath = ref<string[]>([]);

// 切换分类面板显示/隐藏
const toggleCategoryPanel = () => {
  isCategoryPanelOpen.value = !isCategoryPanelOpen.value;
  // 关闭其他面板
  if (isCategoryPanelOpen.value) {
    isCampusPanelOpen.value = false;
    isMultiCampusPanelOpen.value = false;
  }
};

// 处理分类选择
const handleCategorySelect = (item: any) => {
  // 记录当前状态到历史，用于返回
  categoryHistory.value.push({
    items: [...currentCategoryItems.value],
    level: currentCategoryLevel.value,
    path: [...categoryPath.value]
  });
  
  // 更新选中路径
  const newPath = [...categoryPath.value, item.name];
  categoryPath.value = newPath;
  
  // 更新当前层级
  currentCategoryLevel.value++;
  
  // 如果有子分类，展示下一级；否则关闭面板并确认选择
  if (item.children && item.children.length) {
    currentCategoryItems.value = item.children;
  } else {
    selectedCategory.value = item;
    isCategoryPanelOpen.value = false;
  }
};

// 返回上一级分类
const handleBack = () => {
  if (categoryHistory.value.length > 0) {
    const prevState = categoryHistory.value.pop()!;
    currentCategoryItems.value = prevState.items;
    currentCategoryLevel.value = prevState.level;
    categoryPath.value = prevState.path;
    selectedCategory.value = null; // 清除选中状态
  }
};

// 格式化显示的分类路径
const selectedCategoryPath = computed(() => {
  return categoryPath.value.length ? categoryPath.value.join('：') : '';
});

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
  // 验证分类是否选中
  const isCategorySelected = selectedCategory.value !== null;
  
  // 增加院系和分类的必填验证
  if (!formData.courseName || !formData.reason || !formData.department || !isCategorySelected || !formData.campuses) {
    uni.showToast({ 
      title: '课程名称、理由、院系、多选校区和分类不能为空', 
      icon: 'none' 
    });
    return;
  }
  
  // 组装完整分类路径
  formData.category = selectedCategoryPath.value;

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
    width: 100%;
    height: 10vw;
    border: 1px solid #e5e5e5;
    border-radius: 2vw;
    padding: 0 3vw;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .picker-view {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    font-size: 3.5vw;
    color: #333;
  }

  // 校区选择器样式
  .campus-selector, .campus-multi-selector {
    position: relative;
    width: 100%;
  }

  .campus-panel {
    position: absolute;
    top: 11vw;
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

  // 其他样式保持不变
  .category-selector {
    position: relative;
    width: 100%;
  }

  .category-panel {
    position: absolute;
    top: 11vw;
    left: 0;
    width: 100%;
    background-color: #fff;
    border: 1px solid #e5e5e5;
    border-radius: 2vw;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    z-index: 10;
    padding: 2vw 0;
  }

  .back-btn {
    display: flex;
    align-items: center;
    padding: 2vw 3vw;
    font-size: 3.5vw;
    color: #666;
    border-bottom: 1px solid #f5f5f5;
    margin-bottom: 2vw;
    cursor: pointer;
    
    .back-icon {
      width: 4vw;
      height: 4vw;
      margin-right: 2vw;
    }
    
    &:hover {
      background-color: #f5f5f5;
    }
  }

  .category-level {
    padding: 1vw 3vw;
  }

  .category-item {
    padding: 2vw 0;
    font-size: 3.5vw;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    &:hover {
      color: #b70030;
    }
  }

  .arrow-icon {
    width: 4vw;
    height: 4vw;
    transition: transform 0.3s ease;
  }

  .rotate {
    transform: rotate(180deg);
  }

  .right-arrow {
    width: 4vw;
    height: 4vw;
    opacity: 0.5;
  }
}


  .content {
    padding-top: 28vw;
    padding-bottom: 25vw;
    width: 100%;
    box-sizing: border-box;
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
  }

  .form-item {
    display: flex;
    flex-direction: column;
    gap: 1vw;

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