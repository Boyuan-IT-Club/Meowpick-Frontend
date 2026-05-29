import type { DtoCourseVO } from "@/api/data-contracts";

type choose = {
  course?: DtoCourseVO[];
  teacher?: DtoCourseVO[];
  department?: DtoCourseVO[];
  category?: any[];
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
    uni.navigateTo({
      url: `/pages/course/index/index?id=${id}`
    });
  }

  function search(p: number) {
    if (keyword.value.length > 0) {
      http.CoursesController.searchCreate({
        keyword: keyword.value,
        type: type.value === 'department' || type.value === 'category' ? 'course' : type.value,
        page: p,
        pageSize: 10
      }).then((res) => {
        if (!rows.value[type.value]) {
          rows.value[type.value] = [];
        }
        
        const rawData = res.data?.courses || res.data.data?.courses || res.data.data?.data?.courses || [];
        const courses = rawData.map((course: any) => ({
          ...course,
          teacherList: course.teachers || [],
          tagCount: course.tagCount || {}
        }));
        
        rows.value[type.value] = [
          ...rows.value[type.value]!,
          ...courses
        ];
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