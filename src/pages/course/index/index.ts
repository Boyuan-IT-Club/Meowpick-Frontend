import { ref } from "vue";
import { http } from "@/config";
import type { DtoCourseVO as CourseVO, DtoTeacherVO as TeacherVO } from "@/api/data-contracts";

export function useCourse() {
  const id = ref("");
  // 直接存储 CourseVO 对象，不再嵌套 data 层
  const courseData = ref<CourseVO | null>(null);
  const teachers = ref<TeacherVO[]>([]);

  function fetch(courseId: string) {
    id.value = courseId;
    console.log('[CourseDetail] Fetching data for:', courseId);
    
    http.CourseController.courseDetail(courseId).then((res) => {
      console.log('[CourseDetail] Raw Response:', JSON.stringify(res));
      if (res && res.code === 0 && res.data) {
        // 根据用户提供的真实数据：res.data 直接就是课程对象
        // 兼容性逻辑：优先判断 res.data 是否直接包含课程核心字段
        const data = (res.data.name || res.data.id) ? res.data : (res.data.course || res.data);
        
        courseData.value = data;
        teachers.value = data.teachers || data.teacherList || [];
        console.log('[CourseDetail] Final courseData:', JSON.stringify(courseData.value));
      } else {
        console.error('[CourseDetail] Invalid response structure:', res);
      }
    }).catch(err => {
      console.error('[CourseDetail] Request failed:', err);
    });
  }

  return {
    id,
    courseData,
    teachers,
    fetch
  };
}
