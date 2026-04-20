import type {
  DtoSearchHistoryVO,
  DtoCommentVO,
  DtoCourseVO,
  DtoTeacherVO
} from "@/api/data-contracts";
import { http } from "@/config";
import { useCourseStore } from "@/config";

export const useFind = () => {
  return useInput();
};

export const useInput = () => {
  const searchText = ref("");
  const placeHolder = shallowRef("搜索课程类别、名称、院系或任课教师");
  const list = shallowRef<any[]>([]);
  const searchHistory = shallowRef<DtoSearchHistoryVO[]>([]);
  const isSearch = ref(false);

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
  course?: DtoCourseVO[];
  teacher?: DtoTeacherVO[];
  comment?: DtoCommentVO[];
  post?: any[];
};
const map = {
  course: useCourseStore(),
  teacher: useCourseStore(),
  comment: useCourseStore(),
  post: useCourseStore()
};

export function useSuggest(externalKeyword?: Ref<string>) {
  const internalKeyword = shallowRef("");
  const keyword = externalKeyword || internalKeyword;
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

  function suggestContent(pageNum: number) {
    if (!keyword.value) {
      suggestList.value = [];
      return;
    }

    http.SearchController.searchSuggestList({ keyword: keyword.value })
      .then((res: any) => {
        console.log('[useSuggest] success:', JSON.stringify(res.data).substring(0, 200));
        const data = res.data;
        const suggestions = data?.data?.suggestions || data?.suggestions || [];
        suggestList.value = suggestions.map((item: any) => ({
          name: item.name,
          type: item.type,
          id: `${item.type}-${item.name}`
        }));
      })
      .catch((err: any) => {
        console.error('[useSuggest] error:', err);
        suggestList.value = [];
      });
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
    suggestList,
    suggestContent
  };
}

export const SearchTypeMap = (type: string) => {
  switch (type) {
    case "course":
      return "课程";
    case "teacher":
      return "教师";
    case "department":
      return "院系";
    case "category":
      return "类别";
  }
};