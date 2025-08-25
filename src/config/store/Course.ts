export default defineStore("course-store", {
  unistorage: true,
  state() {
    return {
      course: {}
    };
  },
  actions: {
    setData(course: any) {
      this.course = course;
    }
  }
});
