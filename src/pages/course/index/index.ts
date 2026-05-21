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
      console.log('[useCourse] raw response:', JSON.stringify(res));
      console.log('[useCourse] res.data:', JSON.stringify(res.data));
      console.log('[useCourse] res.data.data:', JSON.stringify(res.data?.data));
      if (res.data && res.data.data) {
        const courseData = res.data.data as DtoCourseVO;
        course.value = { data: courseData };
        console.log('[useCourse] courseData:', JSON.stringify(courseData));
        if (courseData.teachers) {
          teachers.value = courseData.teachers.map((t: DtoTeacherVO) => t.name || '');
        }
      }
    });
  }

  return { id, course, teachers, trends, fetch };
}
