import { ref } from 'vue';
import type { DtoCourseVO, DtoTeacherVO } from "@/api/data-contracts";
import { useCourseStore, http } from "@/config";

export function useCourse() {
  const id = ref("");
  const store = useCourseStore();

  const course = ref<{ data?: DtoCourseVO }>({});
  const teachers = ref<string[]>([]);
  const trends = ref<DtoCourseVO[]>([]);

  function fetch(courseId: string) {
    if (!courseId || courseId === "") return;
    id.value = courseId;

    http.CourseController.courseDetail(courseId).then((res) => {
      if (res.data && res.data.data && res.data.data.course) {
        const courseData = res.data.data.course as DtoCourseVO;
        course.value = { data: courseData };
        if (courseData.teachers) {
          teachers.value = courseData.teachers.map((t: DtoTeacherVO) => t.name || '');
        }
      }
    });
  }

  return { id, course, teachers, trends, fetch };
}
