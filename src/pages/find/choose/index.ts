import type {
  DtoCourseVO,
  DtoTeacherVO,
  HandlerResponseDtoGetProposalSuggestionsResp,
  HandlerResponseDtoListCoursesResp,
  DtoProposalSuggestionsVO
} from "@/api/data-contracts";
import { ref } from 'vue';
import { http } from "@/config";
import { SEARCH_PAGE_SIZE } from "@/utils/constants";

type MixedResult = DtoCourseVO & {
  resultType?: 'course' | 'teacher' | 'proposal';
  matchScore?: number;
  depart?: string;
  position?: string;
  avatar?: string;
  category?: string;
  department?: string;
  link?: string[][];
  point?: number;
  describe?: string;
  teachers?: string[];
  teacherList?: DtoTeacherVO[];
  campuses?: string[];
  tagCount?: object;
  reason?: string;
  agreeCount?: number;
  campus?: string;
  title?: string;
};

type ProposalResult = DtoProposalSuggestionsVO & {
  resultType?: 'proposal';
  name?: string;
};

export function useChoose() {
  const keyword = ref("");
  const type = ref("course");

  const resultList = ref<MixedResult[]>([]);
  const proposalList = ref<ProposalResult[]>([]);
  const page = ref(1);
  const proposalPage = ref(0);
  const loading = ref(false);
  const proposalLoading = ref(false);
  const proposalsLoaded = ref(false); // 标记是否已加载过提议

  const filterCampus = ref<string>("");
  const filterDepart = ref<string>("");

  function jump(item: MixedResult) {
    if (item.resultType === 'teacher') {
      // 搜索该教师的课程
      keyword.value = item.name || '';
      doSearch(true, 'default');
    } else if (item.resultType === 'proposal') {
      const dataStr = encodeURIComponent(JSON.stringify(item));
      uni.navigateTo({
        url: `/pages/course/proposal-detail/index?data=${dataStr}`
      });
    } else {
      uni.navigateTo({
        url: `/pages/course/index/index?id=${item.id}`
      });
    }
  }

  function doSearch(reload: boolean, sortType: string = 'default') {
    if (!keyword.value.trim()) {
      loading.value = false;
      return;
    }
    if (reload) {
      page.value = 1;
      resultList.value = [];
      // 重置提议相关状态
      proposalPage.value = 0;
      proposalList.value = [];
      proposalsLoaded.value = false;
    }
    loading.value = true;

    const param = {
      keyword: keyword.value,
      page: page.value,
      pageSize: SEARCH_PAGE_SIZE,
      type: "course" as "course" | "teacher",
      // TODO: 后端如支持 campus/depart 过滤，需改为: campus: filterCampus.value, depart: filterDepart.value
      sort: sortType
    };

    // 只搜索课程和教师，不搜索提议（提议延迟到点击按钮后）
    Promise.all([
      http.CoursesController.searchCreate({ ...param, type: "course" }),
      http.CoursesController.searchCreate({ ...param, type: "teacher" })
    ]).then(([courseRes, teacherRes]) => {
      const courseData = courseRes.data as HandlerResponseDtoListCoursesResp;
      const teacherData = teacherRes.data as HandlerResponseDtoListCoursesResp;

      const courseContent = courseData?.data?.courses || [];
      const apiCourses: MixedResult[] = courseContent.map((c) => ({ ...c, resultType: 'course' as const }));

      const teacherContent = teacherData?.data?.courses || [];
      const apiTeachers: MixedResult[] = teacherContent.map((t) => ({ ...t, resultType: 'teacher' as const }));

      let combined: MixedResult[] = [...apiCourses, ...apiTeachers];

      if (filterCampus.value) {
        combined = combined.filter((c) => c.campus === filterCampus.value || c.campus === '两校区通用' || !c.campus);
      }
      if (filterDepart.value) {
        combined = combined.filter((c) => c.department && c.department.includes(filterDepart.value));
      }

      if (page.value === 1) {
        resultList.value = combined;
      } else {
        resultList.value = resultList.value.concat(combined);
      }
    }).catch(err => {
      console.error('[useChoose] Search error:', err);
    }).finally(() => {
      loading.value = false;
    })
  }

  // 延迟加载提议（点击"查看其他同学提议"按钮后调用）
  function loadProposals(reload: boolean = false) {
    if (proposalsLoaded.value && !reload) {
      // 已经加载过，不需要重复加载
      return;
    }
    if (reload) {
      proposalPage.value = 0;
      proposalList.value = [];
    }
    proposalLoading.value = true;

    http.ProposalController.proposalSuggestCreate({
      keyword: keyword.value,
      page: proposalPage.value,
      pageSize: SEARCH_PAGE_SIZE
    }).then((proposalRes) => {
      const proposalData = proposalRes.data as HandlerResponseDtoGetProposalSuggestionsResp;
      const proposalContent = proposalData?.data?.suggestions || [];
      const newProposals: ProposalResult[] = proposalContent.map((p) => ({
        ...p,
        resultType: 'proposal' as const,
        name: p.title
      }));

      if (proposalPage.value === 0) {
        proposalList.value = newProposals;
      } else {
        proposalList.value = proposalList.value.concat(newProposals);
      }
      proposalsLoaded.value = true;
    }).catch(err => {
      console.error('[useChoose] Load proposals error:', err);
    }).finally(() => {
      proposalLoading.value = false;
    })
  }

  // 加载更多提议
  function loadMoreProposals() {
    if (proposalLoading.value) return;
    proposalPage.value++;
    loadProposals(false);
  }

  return {
    keyword,
    rows: resultList,
    proposalRows: proposalList,
    page,
    loading,
    proposalLoading,
    proposalsLoaded,
    jump,
    doSearch,
    loadProposals,
    loadMoreProposals,
    filterCampus,
    filterDepart
  };
}
