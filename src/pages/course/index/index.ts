import type { DtoCourseVO, DtoTeacherVO } from "@/api/data-contracts";
import { useCourseStore } from "@/config";

type CourseData = { data: DtoCourseVO };

export function useCourse() {
  const id = ref("");
  const course = shallowRef<CourseData>({ data: useCourseStore().course });
  const teachers = shallowRef<DtoTeacherVO[]>([]);
  const trends = shallowRef<DtoCourseVO[]>([]);
  const contributor = ref('/');

  function setContributor(courseData: DtoCourseVO) {
    const contributorData = courseData.contributor;
    if (contributorData?.showUsername !== true) {
      contributor.value = '/';
      return;
    }

    contributor.value = String(contributorData.username || '').trim() || '默认用户';
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
        setContributor(courseData as DtoCourseVO);
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
