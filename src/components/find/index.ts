import type {
  SearchHistoryVO,
  CommentVO,
  Course,
  TeacherVO
} from "@/api/data-contracts";

export const useInput = () => {
  const searchText = ref("");
  const placeHolder = shallowRef("搜索课程类别、名称、院系或任课教师");
  const list = shallowRef<any[]>([]);
  const searchHistory = shallowRef<SearchHistoryVO[]>([]);
  const isSearch = ref(false);

  watchEffect(() => {
    console.log(searchText.value);
  });

  if (searchText) {
    isSearch.value = true;
  }

  const text = computed(() => {
    if (searchText.value != undefined && searchText.value?.length > 0) {
      isSearch.value = true;
      return searchText.value;
    } else {
      return placeHolder.value;
    }
  });

  return {
    searchText,
    placeHolder,
    list,
    searchHistory,
    text,
    isSearch
  };
};

type choose = {
  course?: Course[];
  teacher?: TeacherVO[];
  comment?: CommentVO[];
  post?: any[];
};
const map = {
  course: useCourseStore(),
  teacher: useCourseStore(),
  comment: useCourseStore(),
  post: useCourseStore()
};

export function useChoose() {
  const keyword = shallowRef("");
  const type = shallowRef<"course" | "teacher" | "comment" | "post">("course");
  const rows = ref<choose>({
    course: [],
    teacher: [],
    comment: [],
    post: []
  });
  const suggestList = ref<object[]>([]);
  const page = ref(0);

  function jump(id: string) {
    // map[type.value].setData(item)
    uni.navigateTo({
      url: `/pages/${type.value}/index/index?id=${id}`
    });
  }

  // function search(page: number) {
  //     if (keyword.value.length > 0) {
  //         http.SearchController.search({
  //             keyword: keyword.value,
  //             type: type.value,
  //             page,
  //             size: 15
  //         }).then((res) => {
  //             rows.value[type.value] = [...rows.value[type.value]!, ...res.data.payload.rows!];
  //         });
  //     }
  // }

  function suggestContent(page: number) {
    if (keyword.value) {
      http.SearchController.suggest({
        search: keyword.value,
        pageNum: page,
        pageSize: 15
      }).then((res) => {
        suggestList.value = [...suggestList.value, ...res.data.payload];
      });
    }
  }

  watch([page], () => {
    suggestContent(page.value);
  });
  watch([keyword, type], () => {
    suggestList.value = [];
    suggestContent(page.value);
  });

  return {
    keyword,
    type,
    rows,
    page,
    jump,
    suggestList
  };
}

export const SearchTypeMap = (type: string) => {
  switch (type) {
    case "course":
      return "课程";
    case "teacher":
      return "教师";
    case "depart":
      return "院系";
    case "category":
      return "类别";
  }
};
