export function useChoose() {
  const keyword = shallowRef("");
  const rows = ref<object[]>([]);

  const page = ref(0);

  function search(p: number) {
    if (keyword.value.length > 0) {
      http.CoursesController.searchCreate({
        keyword: keyword.value,
        type: "teacher",
        page: p,
        pageSize: 5
      }).then((res) => {
        const rawData = res.data?.courses || res.data.data?.courses || res.data.data?.data?.courses || [];
        const courses = rawData.map((course: any) => ({
          ...course,
          teacherList: course.teachers || [],
          tagCount: course.tagCount || {}
        }));
        rows.value = [...rows.value, { courses }];
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
