import { ref, shallowRef, watch } from 'vue';
import { http } from "@/config";

interface TeacherCourse {
  id: string;
  name: string;
  department?: string;
  teacherList: any[];
  tagCount: Record<string, number>;
}

export function useChoose() {
  const keyword = shallowRef("");
  const rows = ref<TeacherCourse[]>([]);
  const page = ref(0);

  function search(pageNum: number) {
    if (keyword.value.length > 0) {
      http.CoursesController.searchCreate({
        keyword: keyword.value,
        type: "teacher",
        page: pageNum,
        pageSize: 5
      }).then((res) => {
        const data = res.data as any;
        const courses = data?.data?.courses || data?.courses || [];
        rows.value = [...rows.value, ...courses.map((course: any) => ({
          ...course,
          teacherList: course.teachers || [],
          tagCount: course.tagCount || {}
        }))];
      });
    }
  }

  function jump(id: string) {
    uni.navigateTo({
      url: `/pages/course/index/index?id=${id}`
    });
  }

  watch([page], () => {
    search(page.value);
  });
  watch([keyword], () => {
    rows.value = [];
    search(0);
  });

  return {
    keyword,
    rows,
    page,
    search,
    jump
  };
}
