import type { CommentVO, Course, CourseVO, TeacherVO } from "@/api/data-contracts";

// 定义统一的混合对象类型
type MixedResult = CourseVO & {
  resultType?: 'course' | 'teacher' | 'proposal'; // 标识类型
  matchScore?: number; // 匹配度
  // Add Teacher specific fields as optional to MixedResult to make TS happy or just use intersection
  depart?: string; 
  position?: string;
  avatar?: string;
  
  // TeacherVO has: id, avatar, name, uid, courses
  
  // Extend MixedResult to allow extra props
  category?: string;
  department?: string;
  link?: string[][];
  point?: number;
  describe?: string;
  teachers?: string[];
  teacherList?: TeacherVO[];
  campuses?: string[];
  tagCount?: object;
  // Proposal specific fields
  reason?: string;
  agreeCount?: number;
  campus?: string; // Add campus field standard
};

export function useChoose() {
  const keyword = ref(""); // Change shallowRef to ref for better reactivity and easier assignment
  const type = ref("course"); // Keep this to avoid breaking return contract if needed, though unused logic-wise
  
  const resultList = ref<MixedResult[]>([]);
  const page = ref(1);
  const loading = ref(false);
  
  // Filter states
  const filterCampus = ref<string>("");
  const filterDepart = ref<string>("");

  function jump(item: MixedResult) {
    if (item.resultType === 'teacher') {
        // Example: Jump to teacher detail
        // uni.navigateTo({ url: `/pages/teacher/detail?id=${item.id}` })
    } else if (item.resultType === 'proposal') {
        uni.navigateTo({
            url: `/pages/proposal/list/list`
        });
    } else {
        uni.navigateTo({
            url: `/pages/course/index/index?id=${item.id}`
        });
    }
  }

  // Rename search to doSearch and expose it, allow sortType
  function doSearch(reload: boolean, sortType: string = 'default') {
      if (reload) {
          page.value = 1;
          resultList.value = [];
      }
      loading.value = true;
      
      const param = { 
          keyword: keyword.value, // 使用 .value 确保取到最新值
          page: page.value,
          size: 10,
          type: "course" as "course" | "teacher"
      };
      
      // MOCK DATA FOR SEARCH RESULTS
      const mockCourseItem: MixedResult = {
          id: 'mock_c1',
          name: '微积分 (Mock)',
          category: '通识教育必修课程',
          department: '数学科学学院',
          point: 4.8,
          teachers: ['李老师'],
          teacherList: [{ name: '李老师', id: 't1' }],
          resultType: 'course',
          describe: '微积分基础与应用',
          tagCount: { '好评': 98, '容易': 25 },
          campus: '普陀校区'
      };

      const mockCourseItemNew1: MixedResult = {
          id: 'mock_c3',
          name: 'Python编程入门 (Mock)',
          category: '通识选修课程',
          department: '计算机科学与技术学院',
          point: 4.9,
          teachers: ['张三'],
          teacherList: [{ name: '张三', id: 't3' }],
          resultType: 'course',
          describe: 'Python语言基础与数据分析',
          tagCount: { '推荐': 120, '好评': 80 },
          campus: '闵行校区'
      };

      const mockCourseItemNew2: MixedResult = {
          id: 'mock_c4',
          name: '艺术鉴赏 (Mock)',
          category: '通识核心课程',
          department: '美术学院',
          point: 4.5,
          teachers: ['李四'],
          teacherList: [{ name: '李四', id: 't4' }],
          resultType: 'course',
          describe: '西方美术史概览',
          tagCount: { '容易': 150, '幽默': 60 },
          campus: '普陀校区'
      };

      const mockCourseItemNew3: MixedResult = {
          id: 'mock_c5',
          name: '心理学导论 (Mock)',
          category: '通识选修课程',
          department: '心理与认知科学学院',
          point: 4.7,
          teachers: ['王五'],
          teacherList: [{ name: '王五', id: 't5' }],
          resultType: 'course',
          describe: '探索人类心理奥秘',
          tagCount: { '推荐': 90, '幽默': 40 },
          campus: '两校区通用'
      };

      // Additional mock courses for better scrolling/testing
      const mockCourseItemNew4: MixedResult = {
          id: 'mock_c6',
          name: '数据库系统原理 (Mock)',
          category: '专业必修',
          department: '计算机学院',
          point: 4.6,
          teachers: ['赵老师'],
          teacherList: [{ name: '赵老师', id: 't6' }],
          resultType: 'course',
          describe: '讲述数据库设计与SQL优化',
          tagCount: { '硬核': 76, '严谨': 40 },
          campus: '闵行校区'
      };

      const mockCourseItemNew5: MixedResult = {
          id: 'mock_c7',
          name: '线性代数 (Mock)',
          category: '通识必修',
          department: '数学学院',
          point: 4.3,
          teachers: ['钱老师'],
          teacherList: [{ name: '钱老师', id: 't7' }],
          resultType: 'course',
          describe: '向量空间与矩阵运算',
          tagCount: { '枯燥': 60, '避雷': 33 },
          campus: '普陀校区'
      };

      const mockCourseItemNew6: MixedResult = {
          id: 'mock_c8',
          name: '计算机组成原理 (Mock)',
          category: '专业必修',
          department: '计算机学院',
          point: 4.4,
          teachers: ['孙老师'],
          teacherList: [{ name: '孙老师', id: 't8' }],
          resultType: 'course',
          describe: 'CPU 与存储系统基础',
          tagCount: { '硬核': 45, '容易': 12 },
          campus: '闵行校区'
      };

      const mockCourseItemNew7: MixedResult = {
          id: 'mock_c9',
          name: '管理学概论 (Mock)',
          category: '选修',
          department: '管理学院',
          point: 4.1,
          teachers: ['周老师'],
          teacherList: [{ name: '周老师', id: 't9' }],
          resultType: 'course',
          describe: '管理与组织行为学基础',
          tagCount: { '好评': 58 },
          campus: '两校区通用'
      };

      const mockCourseItemNew8: MixedResult = {
          id: 'mock_c10',
          name: '摄影入门 (Mock)',
          category: '兴趣选修',
          department: '传媒学院',
          point: 4.7,
          teachers: ['林老师'],
          teacherList: [{ name: '林老师', id: 't10' }],
          resultType: 'course',
          describe: '相机操作与构图',
          tagCount: { '幽默': 130 },
          campus: '普陀校区'
      };

      const mockCourseItemNew9: MixedResult = {
          id: 'mock_c11',
          name: '机器学习基础 (Mock)',
          category: '专业选修',
          department: '计算机学院',
          point: 4.9,
          teachers: ['贺老师'],
          teacherList: [{ name: '贺老师', id: 't11' }],
          resultType: 'course',
          describe: '监督学习与模型评估',
          tagCount: { '硬核': 200, '推荐': 80 },
          campus: '闵行校区'
      };

      const mockCourseItemNew10: MixedResult = {
          id: 'mock_c12',
          name: '公共艺术史 (Mock)',
          category: '通识选修',
          department: '艺术学院',
          point: 4.2,
          teachers: ['田老师'],
          teacherList: [{ name: '田老师', id: 't12' }],
          resultType: 'course',
          describe: '现代与当代艺术流派',
          tagCount: { '容易': 70 },
          campus: '普陀校区'
      };

      const mockCourseItem2: MixedResult = {
          id: 'mock_c2',
          name: '大学英语 (Mock)',
          category: '公共外语必修课程',
          department: '外语学院',
          point: 4.2,
          teachers: ['王英'],
          teacherList: [{ name: '王英', id: 't2' }],
          resultType: 'course',
          describe: '英语听说读写',
          tagCount: { '严谨': 50, '枯燥': 30 },
          campus: '闵行校区'
      };
      
      // MOCK PROPOSALS
      const mockProposal1: MixedResult = {
          id: 'mock_p1',
          name: '深度学习进阶',
          department: '计算机科学与技术学院',
          teacherName: '张教授团队',
          resultType: 'proposal',
          reason: '希望开设进阶课程...',
          agreeCount: 42,
          campus: '普陀校区'
      } as any;

      const mockProposal2: MixedResult = {
          id: 'mock_p2',
          name: '咖啡鉴赏',
          department: '生活美学',
          teacherName: '未知教师',
          resultType: 'proposal',
          reason: '丰富校园生活...',
          agreeCount: 156,
          campus: '闵行校区'
      } as any;

      const mockProposal3: MixedResult = {
          id: 'mock_p3',
          name: '校园乐队工作坊',
          department: '艺术与传媒',
          teacherName: '未知教师',
          resultType: 'proposal',
          reason: '丰富学生课余生活',
          agreeCount: 88,
          campus: '两校区通用'
      } as any;

      const mockProposal4: MixedResult = {
          id: 'mock_p4',
          name: 'AI伦理学专题',
          department: '哲学与法学院',
          teacherName: '未知教师',
          resultType: 'proposal',
          reason: '探讨技术与伦理边界',
          agreeCount: 203,
          campus: '闵行校区'
      } as any;
      
      const mockTeacherItem: MixedResult = {
            id: 'mock_t1',
            name: '张教授',
            category: '教师',
            department: '物理与电子科学学院',
            describe: '教授',
            resultType: 'teacher',
            matchScore: 0
      };

      const allMockCourses = [
          mockCourseItem,
          mockCourseItem2,
          mockCourseItemNew1,
          mockCourseItemNew2,
          mockCourseItemNew3,
          mockCourseItemNew4,
          mockCourseItemNew5,
          mockCourseItemNew6,
          mockCourseItemNew7,
          mockCourseItemNew8,
          mockCourseItemNew9,
          mockCourseItemNew10
      ];
      const allMockProposals = [mockProposal1, mockProposal2, mockProposal3, mockProposal4];

      // 统一的过滤+合并逻辑
      function buildResult(apiCourses: MixedResult[] = []) {
          let courses = apiCourses.length > 0
              ? apiCourses
              : [mockCourseItem, mockCourseItem2];
          // 追加 mock 数据以丰富测试
          courses = courses.concat(allMockCourses.filter(m => !courses.some(c => c.id === m.id)));
          let proposals: MixedResult[] = [...allMockProposals];

          if (filterCampus.value) {
              courses = courses.filter((c: any) => c.campus === filterCampus.value || c.campus === '两校区通用' || !c.campus);
              proposals = proposals.filter((p: any) => p.campus === filterCampus.value || p.campus === '两校区通用');
          }
          if (filterDepart.value) {
              courses = courses.filter((c: any) => c.department && c.department.includes(filterDepart.value));
              proposals = proposals.filter((p: any) => p.department && p.department.includes(filterDepart.value));
          }
          return [...courses, ...proposals];
      }

      Promise.all([
         http.SearchController.search({ ...param, type: "course" }), 
         http.SearchController.search({ ...param, type: "teacher" })
      ]).then(([courseRes, teacherRes]) => {
            const courseContent = (courseRes && (courseRes.data?.content || courseRes.content)) || [];
            const apiCourses = (courseContent || []).map((c: any) => ({ ...c, resultType: 'course' }));

            const combined = buildResult(apiCourses);

            if (page.value === 1) {
                resultList.value = combined;
            } else {
                resultList.value = resultList.value.concat(combined);
            }
      }).catch(err => {
            console.error(err);
            resultList.value = buildResult();
      }).finally(() => {
          loading.value = false;
      })
  }
  
  return {
    keyword,
    rows: resultList,
    page,
    loading,
    jump,
    doSearch,
    filterCampus, // Expose
    filterDepart  // Expose
  };
}