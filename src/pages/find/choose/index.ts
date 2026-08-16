import type { DtoCourseVO } from "@/api/data-contracts";

export function useChoose() {
  const keyword = shallowRef("");
  const type = shallowRef<"course" | "teacher" | "department" | "category">(
    "course"
  );
  const rows = ref<DtoCourseVO[]>([]);
  const page = ref(0);

  function jump(id: string) {
    uni.navigateTo({
      url: `/pages/course/index/index?id=${id}`
    });
  }

  function search(p: number) {
    if (keyword.value.length > 0) {
      console.log('[useChoose] search called:', { keyword: keyword.value, type: type.value, page: p });
      http.CoursesController.searchCreate({
        keyword: keyword.value,
        type: type.value,
        page: p,
        pageSize: 10
      }).then((res) => {
        console.log('[useChoose] response:', JSON.stringify(res.data).substring(0, 500));

        const rawData = res.data?.data?.courses || res.data?.courses || res.data?.data?.data?.courses || [];
        console.log('[useChoose] rawData:', rawData);
        const courses = rawData.map((course: any) => ({
          ...course,
          teacherList: course.teachers || [],
          tagCount: course.tagCount || {}
        }));

        if (p === 0) {
          rows.value = courses;
        } else {
          rows.value = [...rows.value, ...courses];
        }
        console.log('[useChoose] rows updated:', rows.value);
      }).catch((err) => {
        console.error('[useChoose] search error:', err);
        rows.value = [];
      });
    }
  }

  function loadMore() {
    page.value++;
    search(page.value);
  }

  watch([keyword, type], () => {
    rows.value = [];
    page.value = 0;
    search(0);
  });

  return {
    keyword,
    type,
    rows,
    page,
    jump,
    search,
    loadMore
  };
}
