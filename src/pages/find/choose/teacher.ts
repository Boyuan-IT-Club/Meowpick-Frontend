import { onUnmounted, ref, watch } from 'vue';
import { http } from "@/config";
import { TEACHER_SEARCH_PAGE_SIZE } from "@/utils/constants";
import type { DtoCourseVO } from "@/api/data-contracts";

interface TeacherCourse extends DtoCourseVO {
  teacherList: DtoCourseVO['teachers'];
  tagCount: Record<string, number>;
}

export function useChoose() {
  const keyword = ref("");
  const rows = ref<TeacherCourse[]>([]);
  const page = ref(0);
  const loading = ref(false);

  function search(pageNum: number) {
    if (keyword.value.length > 0) {
      loading.value = true;
      http.CoursesController.searchCreate({
        keyword: keyword.value,
        type: "teacher",
        page: pageNum,
        pageSize: TEACHER_SEARCH_PAGE_SIZE
      }).then((res) => {
        const courses = res.data?.data?.courses || [];
        rows.value = [...rows.value, ...courses.map((course) => ({
          ...course,
          teacherList: course.teachers || [],
          tagCount: course.tagCount || {}
        }))];
      }).catch((err) => {
        console.error('[teacher search] error:', err);
      }).finally(() => {
        loading.value = false;
      });
    }
  }

  function jump(id: string) {
    uni.navigateTo({
      url: `/pages/course/index/index?id=${id}`
    });
  }

  const stopPageWatch = watch([page], () => {
    search(page.value);
  });
  const stopKeywordWatch = watch([keyword], () => {
    rows.value = [];
    search(0);
  });

  onUnmounted(() => {
    stopPageWatch();
    stopKeywordWatch();
  });

  return {
    keyword,
    rows,
    page,
    loading,
    search,
    jump
  };
}
