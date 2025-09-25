import type { CommentVO, Course, CourseVO, TeacherVO } from "@/api/data-contracts";

type choose = {
  course?: CourseVO[];
  teacher?: CourseVO[];
  department?: CourseVO[];
  category?: any[];
};
const map = {
  course: useCourseStore(),
  teacher: useCourseStore(),
  comment: useCourseStore(),
  post: useCourseStore()
};

export function useChoose() {
  const keyword = shallowRef("");
  const type = shallowRef<"course" | "teacher" | "department" | "category">(
    "course"
  );
  const rows = ref<choose>({
    course: [],
    teacher: [],
    department: [],
    category: []
  });
  const page = ref(0);

  function jump(id: string) {
    // map[type.value].setData(item)
    uni.navigateTo({
      url: `/pages/course/index/index?id=${id}`
    });
  }

  function search(page: number) {
    if (keyword.value.length > 0) {
      http.SearchController.search({
        keyword: keyword.value,
        type: type.value,
        page,
        pageSize: 10
      }).then((res) => {
        // 确保 type.value 对应的数组已初始化
        if (!rows.value[type.value]) {
          rows.value[type.value] = [];
        }
        
        // 正确处理响应数据，将 teachers 映射为 teacherList 以匹配组件需要的数据结构
        const courses = (res.data.data.courses || []).map(course => ({
          ...course,
          teacherList: course.teachers || [], // 给模板的 teacherList 字段
          tagCount: course.tagCount || {}     // 保证 tagCount 不为 null
        }));
        
        rows.value[type.value] = [
          ...rows.value[type.value]!,
          ...courses
        ];
        console.log("搜索信息：", rows.value[type.value]);
      });
    }
  }

  watch([page], () => {
    search(page.value);
  });
  watch([keyword, type], () => {
    rows.value[type.value] = [];
    search(page.value);
  });

  return {
    keyword,
    type,
    rows,
    page,
    jump
  };
}