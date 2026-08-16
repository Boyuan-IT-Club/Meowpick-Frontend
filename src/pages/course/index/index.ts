import type { DtoCourseVO, DtoTeacherVO } from "@/api/data-contracts";
import { useCourseStore } from "@/config";

type CourseData = { data: DtoCourseVO };

export function useCourse() {
  const id = ref("");
  const course = shallowRef<CourseData>({ data: useCourseStore().course });
  const teachers = shallowRef<DtoTeacherVO[]>([]);
  const trends = shallowRef<DtoCourseVO[]>([]);

  function fetch(data: string) {
    id.value = data;
    http.CourseController.courseDetail(data).then((res) => {
      console.log('[useCourse] response:', JSON.stringify(res.data));
      const courseData = res.data?.data?.course || res.data?.course || res.data?.data || res.data;
      console.log('[useCourse] courseData:', courseData);
      if (courseData) {
        course.value = {
          data: courseData,
        };
      }

      const _link = course.value.data?.link ?? [];
      const link: string[] = [];
      _link.forEach((ln) => {
        link.push(ln[0]);
      });
    }).catch((err) => {
      console.error('[useCourse] fetch error:', err);
    });
  }
  return {
    id,
    course,
    teachers,
    trends,
    fetch
  };
}
