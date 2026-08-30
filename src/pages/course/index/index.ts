import type { DtoCourseVO, DtoTeacherVO } from "@/api/data-contracts";
import { useCourseStore } from "@/config";

type CourseData = { data: DtoCourseVO };
type CourseWithProposal = DtoCourseVO & {
  proposalId?: string;
  proposal_id?: string;
  sourceProposalId?: string;
  userId?: string;
  user_id?: string;
  showUsername?: boolean;
  show_username?: boolean;
  proposal?: {
    userId?: string;
    showUsername?: boolean;
  };
};

export function useCourse() {
  const id = ref("");
  const course = shallowRef<CourseData>({ data: useCourseStore().course });
  const teachers = shallowRef<DtoTeacherVO[]>([]);
  const trends = shallowRef<DtoCourseVO[]>([]);
  const contributor = ref('/');

  async function fetchContributor(courseData: CourseWithProposal) {
    contributor.value = '/';

    let proposal = courseData.proposal;
    const proposalId = courseData.proposalId || courseData.proposal_id || courseData.sourceProposalId;
    const directShowUsername = courseData.showUsername ?? courseData.show_username;

    if (directShowUsername === false || proposal?.showUsername === false) return;

    if (!proposal && proposalId) {
      try {
        const proposalRes = await http.ProposalController.proposalDetail(proposalId);
        if (proposalRes.data?.code === 0) {
          const responseData: any = proposalRes.data;
          proposal = responseData.data?.proposal || responseData.proposal;
        }
      } catch (err) {
        console.error('[useCourse] fetch proposal contributor settings error:', err);
        return;
      }
    }

    const showUsername = proposal?.showUsername ?? directShowUsername;
    const userId = proposal?.userId || courseData.userId || courseData.user_id;
    if (showUsername !== true || !userId) return;

    try {
      const profileRes = await http.UserController.userUsernameDetail(String(userId));
      if (profileRes.data?.code === 0) {
        const profile: any = profileRes.data.data || profileRes.data;
        contributor.value = profile?.username || '/';
      }
    } catch (err) {
      console.error('[useCourse] fetch contributor profile error:', err);
    }
  }

  async function fetch(data: string) {
    id.value = data;
    contributor.value = '/';
    try {
      const res = await http.CourseController.courseDetail(data);
      console.log('[useCourse] response:', JSON.stringify(res.data));
      const responseData: any = res.data;
      const courseData = responseData?.data?.course || responseData?.course || responseData?.data || responseData;
      console.log('[useCourse] courseData:', courseData);
      if (courseData) {
        course.value = {
          data: courseData,
        };
        await fetchContributor(courseData as CourseWithProposal);
      }

      const _link = course.value.data?.link ?? [];
      const link: string[] = [];
      _link.forEach((ln) => {
        link.push(ln[0]);
      });
    } catch (err) {
      console.error('[useCourse] fetch error:', err);
    }
  }
  return {
    id,
    course,
    teachers,
    trends,
    contributor,
    fetch
  };
}
