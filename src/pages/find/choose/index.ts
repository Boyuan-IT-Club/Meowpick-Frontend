import type { CommentVO, Course, TeacherVO } from "@/api/data-contracts";

type choose = {
  course?: Course[];
  teacher?: Course[];
  depart?: Course[];
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
  const type = shallowRef<"course" | "teacher" | "depart" | "category">(
    "course"
  );
  const rows = ref<choose>({
    course: [],
    teacher: [],
    depart: [],
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
        size: 10
      }).then((res) => {
        rows.value[type.value] = [
          ...rows.value[type.value]!,
          ...res.data.payload.rows!
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
