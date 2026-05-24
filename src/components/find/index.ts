import { ref, computed, watch, type Ref } from 'vue';
import type {
  DtoSearchHistoryVO,
  DtoCommentVO,
  DtoCourseVO,
  DtoTeacherVO
} from "@/api/data-contracts";
import { http } from "@/config";

export const useFind = () => {
  return useInput();
};

export const useInput = () => {
  const searchText = ref("");
  const placeHolder = ref("搜索课程、老师或吐槽...");
  const list = ref<any[]>([]);
  const searchHistory = ref<DtoSearchHistoryVO[]>([]);
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

export function useSuggest(externalKeyword?: Ref<string>) {
  const internalKeyword = ref("");
  const keyword = externalKeyword || internalKeyword;
  const type = ref<"course" | "teacher" | "comment" | "post">("course");
  const rows = ref<choose>({
    course: [],
    teacher: [],
    comment: [],
    post: []
  });
  const suggestList = ref<object[]>([]);
  const page = ref(0);

  function jump(id: string) {
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
        const data = res.data;
        const suggestions = data?.data?.suggestions || data?.suggestions || [];

        // 始终将输入内容作为第一条
        const inputItem = {
          name: keyword.value,
          type: 'input',
          id: `input-${keyword.value}`
        };

        // 过滤掉与输入完全相同的项，避免重复
        const filteredSuggestions = suggestions
          .filter((item: any) => item.name !== keyword.value)
          .map((item: any) => ({
            name: item.name,
            type: item.type,
            id: `${item.type}-${item.name}`
          }));

        // 合并：输入内容 + 过滤后的建议
        suggestList.value = [inputItem, ...filteredSuggestions];
      })
      .catch((err: any) => {
        console.error('[useSuggest] error:', err);
        // 即使出错，也应该显示输入内容作为第一条
        suggestList.value = [{
          name: keyword.value,
          type: 'input',
          id: `input-${keyword.value}`
        }];
      });
  }

  watch([keyword, type], () => {
    suggestList.value = [];
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