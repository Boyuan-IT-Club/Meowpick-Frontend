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
        rows.value = [...rows.value, ...res.data.payload.rows!];
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
