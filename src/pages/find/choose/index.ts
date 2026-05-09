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
  const page = ref(1);
  const loading = ref(false);

  const filterCampus = ref<string>("");
  const filterDepart = ref<string>("");

  function jump(item: MixedResult) {
    if (item.resultType === 'teacher') {
      // TODO: 缺少教师详情页，跳转到搜索并筛选教师类型
      console.warn('[useChoose] teacher jump not implemented, no teacher detail page');
      uni.showToast({ title: '教师功能即将上线', icon: 'none' });
    } else if (item.resultType === 'proposal') {
      uni.navigateTo({
        url: `/pages/proposal/list/list`
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

    Promise.all([
      http.CoursesController.searchCreate({ ...param, type: "course" }),
      http.CoursesController.searchCreate({ ...param, type: "teacher" }),
      http.ProposalController.proposalSuggestCreate({ keyword: keyword.value, page: page.value - 1, pageSize: SEARCH_PAGE_SIZE })
    ]).then(([courseRes, teacherRes, proposalRes]) => {
      const courseData = courseRes.data as HandlerResponseDtoListCoursesResp;
      const teacherData = teacherRes.data as HandlerResponseDtoListCoursesResp;
      const proposalData = proposalRes.data as HandlerResponseDtoGetProposalSuggestionsResp;

      const courseContent = courseData?.data?.courses || [];
      const apiCourses: MixedResult[] = courseContent.map((c) => ({ ...c, resultType: 'course' as const }));

      const teacherContent = teacherData?.data?.courses || [];
      const apiTeachers: MixedResult[] = teacherContent.map((t) => ({ ...t, resultType: 'teacher' as const }));

      const proposalContent = proposalData?.data?.suggestions || [];
      const apiProposals: ProposalResult[] = proposalContent.map((p) => ({ ...p, resultType: 'proposal' as const, name: p.title }));

      let combined: MixedResult[] = [...apiCourses, ...apiProposals as MixedResult[], ...apiTeachers];

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

  return {
    keyword,
    rows: resultList,
    page,
    loading,
    jump,
    doSearch,
    filterCampus,
    filterDepart
  };
}
