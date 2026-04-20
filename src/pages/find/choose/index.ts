import type { DtoCourseVO, DtoTeacherVO } from "@/api/data-contracts";
import { ref } from 'vue';
import { http } from "@/config";

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
    if (reload) {
      page.value = 1;
      resultList.value = [];
    }
    loading.value = true;

    const param = {
      keyword: keyword.value,
      page: page.value,
      pageSize: 10,
      type: "course" as "course" | "teacher"
    };

    console.log('[useChoose] doSearch called, keyword:', keyword.value);

    Promise.all([
      http.CoursesController.searchCreate({ ...param, type: "course" }),
      http.CoursesController.searchCreate({ ...param, type: "teacher" }),
      http.ProposalController.proposalSuggestCreate({ keyword: keyword.value, page: 0, pageSize: 10 })
    ]).then(([courseRes, teacherRes, proposalRes]) => {
      console.log('[useChoose] Course response:', JSON.stringify(courseRes.data).substring(0, 200));
      console.log('[useChoose] Teacher response:', JSON.stringify(teacherRes.data).substring(0, 200));
      console.log('[useChoose] Proposal response:', JSON.stringify(proposalRes.data).substring(0, 200));

      const courseData = courseRes.data as any;
      const teacherData = teacherRes.data as any;
      const proposalData = proposalRes.data as any;
      const courseContent = (courseData?.data?.courses || courseData?.courses || []) as any[];
      const apiCourses = courseContent.map((c: any) => ({ ...c, resultType: 'course' }));

      const teacherContent = (teacherData?.data?.courses || teacherData?.courses || []) as any[];
      const apiTeachers = teacherContent.map((t: any) => ({ ...t, resultType: 'teacher' }));

      const proposalContent = (proposalData?.data?.proposals || proposalData?.proposals || []) as any[];
      const apiProposals = proposalContent.map((p: any) => ({ ...p, resultType: 'proposal', name: p.title }));

      console.log('[useChoose] Parsed courses:', apiCourses.length, 'teachers:', apiTeachers.length, 'proposals:', apiProposals.length);

      let combined = [...apiCourses, ...apiProposals, ...apiTeachers];

      if (filterCampus.value) {
        combined = combined.filter((c: any) => c.campus === filterCampus.value || c.campus === '两校区通用' || !c.campus);
      }
      if (filterDepart.value) {
        combined = combined.filter((c: any) => c.department && c.department.includes(filterDepart.value));
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
