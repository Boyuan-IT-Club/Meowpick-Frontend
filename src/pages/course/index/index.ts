import type { Course, CourseVO, TeacherVO } from "@/api/data-contracts";
import { useCourseStore } from "@/config";

export function useCourse() {
  const id = ref("");
  const store = useCourseStore();
  
  // 初始化 course 为空对象或默认值，避免 null/undefined
  const course = shallowRef<Course>({}); 
  const teachers = shallowRef<TeacherVO[]>([]);
  const trends = shallowRef<CourseVO[]>([]);

  function fetch(courseId: string) {
    id.value = courseId;
    
    // Mock Data Logic for Course Detail
    if (!courseId) return;

    if (courseId.startsWith('mock_') || courseId.startsWith('c') || courseId === 'c1' || courseId === 'c2') {
        const isMockC1 = courseId.includes('c1') || courseId === 'mock_c1';
         const mockData: CourseVO = {
            id: courseId,
            name: isMockC1 ? '高等数学 (Mock)' : '计算机网络 (Mock)',
            category: isMockC1 ? '通识必修' : '专业选修',
            department: isMockC1 ? '理学院' : '计算机学院',
            // Correct the link property shape: string[][] -> [[id, name]]
            link: [['mock_c2', '计算机网络'], ['mock_c1', '线性代数']],
            point: isMockC1 ? 4.8 : 4.5,
            describe: isMockC1 
                ? '高等数学是一门重要的基础课程，主要内容包括微积分、空间解析几何等。适合理工科学生学习。' 
                : '计算机网络介绍了互联网的基本原理，包括TCP/IP协议栈、HTTP协议等核心概念。',
            teachers: isMockC1 ? ['张三'] : ['李四'],
            campuses: ['闵行校区', '中北校区'],
            tagCount: { '推荐': 99, '容易': 20, '硬核': 50 }
        };
        
        course.value = { 
            data: { 
               ...mockData,
               teachers: isMockC1 ? ['张三'] : ['李四'],
               // Make sure teacherList is populated for components using it
               teacherList: isMockC1 ? [{id: 't1', name: '张三'}] : [{id: 't2', name: '李四'}] 
            },
            score: { avg: 4.8, total: 100, number: 10, percent: {} } // Mock score object too
        };
        // Don't return here if you want to test "loading" or allow real API attempt (but real API will fail for mock ID)
        return; 
    }
    
    // API Call
    http.CourseController.get(courseId).then((res) => {
      if (res.data && res.data.data) { // Check structure
        course.value = {
          data: res.data.data as CourseVO, // Cast to fix potential type mismatch if Course != {data: CourseVO}
        };
      } else {
          // If fetch fails or empty, maybe fallback?
      }

      const _link = course.value.data?.link ?? [];
      const link: string[] = [];
      _link.forEach((ln) => {
        link.push(ln[0]);
      });
    });
  }
  return {
    id,
    course,
    teachers,
    trends,
    fetch
  };
}