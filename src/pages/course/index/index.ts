import type { Course, CourseVO, TeacherVO } from "@/api/data-contracts";
import { useCourseStore } from "@/config";
import { data } from "autoprefixer";

export function useCourse() {
  const id = ref("");
  const course = shallowRef<Course>({ data: useCourseStore().course });
  const teachers = shallowRef<TeacherVO[]>([]);
  const trends = shallowRef<CourseVO[]>([]);

  function fetch(data: string) {
    id.value = data;
    http.CourseController.get(data).then((res) => {
      if (res.data.code === 0 && res.data.data) {
        course.value = {
          data: res.data.data,
        };
      }

      const _link = course.value.data?.link ?? [];
      const link: string[] = [];
      _link.forEach((ln) => {
        link.push(ln[0]);
      });
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

export function caculateTimeago(dateTimeStamp: any) {
  return useTime(dateTimeStamp);
}
