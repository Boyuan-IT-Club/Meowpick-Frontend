import type { DtoCourseVO } from "@/api/data-contracts";

export default defineStore("course-store", {
  unistorage: true,
  state() {
    return {
      course: {} as DtoCourseVO
    };
  },
  actions: {
    setData(course: DtoCourseVO) {
      this.course = course;
    }
  }
});
