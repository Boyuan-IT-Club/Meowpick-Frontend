import { ref, shallowRef, watch } from "vue";
import { http } from "@/config";
import type { CourseVO } from "@/api/data-contracts";

export function useChoose() {
  const keyword = ref("");
  const type = ref<"course" | "teacher" | "department" | "category">("course");
  // 直接提供一个扁平的 list 供模板使用，避免复杂的对象嵌套响应式问题
  const list = ref<any[]>([]);
  const page = ref(0);
  const loading = ref(false);

  function jump(id: string) {
    uni.navigateTo({
      url: `/pages/course/index/index?id=${id}`
    });
  }

  function search(currentPage: number) {
    if (!keyword.value) return;
    
    loading.value = true;
    console.log(`[Search] Performing ${type.value} search for: ${keyword.value}, page: ${currentPage}`);

    http.CoursesController.searchCreate({
      keyword: keyword.value,
      type: type.value,
      page: currentPage,
      pageSize: 10
    }).then((res) => {
      console.log(`[Search] API Success:`, res);
      if (res && res.code === 0 && res.data) {
        // 映射数据结构以匹配组件需求
        const newCourses = (res.data.courses || []).map(course => ({
          ...course,
          teacherList: course.teachers || [],
          tagCount: course.tagCount || {}
        }));

        if (currentPage === 0) {
          list.value = newCourses;
        } else {
          list.value = [...list.value, ...newCourses];
        }
        console.log(`[Search] List updated, total items: ${list.value.length}`);
      }
    }).finally(() => {
      loading.value = false;
    });
  }

  // 监听页码变化
  watch(page, (newPage) => {
    search(newPage);
  });

  // 监听关键词或类型变化，重置列表
  watch([keyword, type], () => {
    console.log(`[Search] Criteria changed, resetting list`);
    page.value = 0;
    list.value = [];
    search(0);
  });

  return {
    keyword,
    type,
    list,
    page,
    loading,
    jump
  };
}
