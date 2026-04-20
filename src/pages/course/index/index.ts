import type { DtoCourseVO, DtoTeacherVO } from "@/api/data-contracts";
import { useCourseStore, http } from "@/config";

export function useCourse() {
  const id = ref("");
  const store = useCourseStore();

  const course = shallowRef<{ data?: DtoCourseVO }>({});
  const teachers = shallowRef<string[]>([]);
  const trends = shallowRef<DtoCourseVO[]>([]);

  function fetch(courseId: string) {
    if (!courseId || courseId === "") return;
    id.value = courseId;

    http.CourseController.courseDetail(courseId).then((res) => {
      if (res.data && res.data.data) {
        const courseData = res.data.data as DtoCourseVO;
        course.value = { data: courseData };
        if (courseData.teachers) {
          teachers.value = courseData.teachers.map((t: DtoTeacherVO) => t.name || '');
        }
      }
    });
  }

  return { id, course, teachers, trends, fetch };
}
