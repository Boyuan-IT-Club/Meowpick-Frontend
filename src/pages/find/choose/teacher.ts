export function useChoose() {
  const keyword = shallowRef("");
  const rows = ref<object[]>([]);

  const page = ref(0);

  function search(page: number) {
    if (keyword.value.length > 0) {
      http.SearchController.search({
        keyword: keyword.value,
        type: "teacher",
        page,
        size: 5
      }).then((res) => {
        const courses = res.data.data.courses!.map(course => ({
          ...course,
          teacherList: course.teachers || [], // 给模板的 teacherList 字段
          tagCount: course.tagCount || {}     // 保证 tagCount 不为 null
        }));
        rows.value = [...rows.value, { courses }];
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
