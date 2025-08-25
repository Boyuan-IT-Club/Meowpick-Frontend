import type { Course, CourseVO, TeacherVO } from "@/api/data-contracts";
import { useCourseStore } from "@/config";
import { data } from "autoprefixer";

export function useCourse() {
  const id = ref("");
  const course = shallowRef<Course>({ data: useCourseStore().course });
  const teachers = shallowRef<TeacherVO[]>([]);
  const trends = shallowRef<CourseVO[]>([]);

  function fetch(data: string) {
    // ins.id = data
    id.value = data;
    http.CourseController.get(data).then((res) => {
      course.value = res.data.payload;

      http.TeacherController.getBatch(res.data.payload.data?.teachers!).then(
        (res) => {
          teachers.value = res.data.payload;
        }
      );

      const _link = course.value.data?.link ?? [];
      const link: string[] = [];
      _link.forEach((ln) => {
        link.push(ln[0]);
      });

      // http.CourseController.list(link).then((res) => {
      //     trends.value = res.data.payload;
      // });
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
