import { ref, shallowRef, watch } from 'vue';
import { http } from "@/config";

export function useChoose() {
  const keyword = shallowRef("");
  const rows = ref<object[]>([]);

  const page = ref(0);

  function search(page: number) {
    if (keyword.value.length > 0) {
      http.CoursesController.searchCreate({
        keyword: keyword.value,
        type: "teacher",
        page,
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
    // map[type.value].setData(item)
    uni.navigateTo({
      url: `/pages/course/index/index?id=${id}`
    });
  }

  watch([page], () => {
    search(page.value);
  });
  watch([keyword], () => {
    rows.value = [];
    search(page.value);
  });

  return {
    keyword,
    rows,
    page,
    search,
    jump
  };
}
