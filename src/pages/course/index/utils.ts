import { ref, shallowRef, watchEffect } from "vue";
import { http } from "@/config";
import type { CommentVO } from "@/api/data-contracts";

type Props = {
  id: string;
};

export function useCourseComment(p: Props) {
  const page = shallowRef(1);
  const list = ref<CommentVO[]>([]);
  let query = true;

  function fetch(id: string, pageNum: number) {
    console.log('[CourseCommentFetch] Requesting ID:', id, 'Page:', pageNum);
    if (pageNum === 1) {
      query = true;
      list.value = [];
    }
    
    if (query) {
      http.CommentController.commentQueryList({ id: id, page: pageNum, pageSize: 10 }).then((res) => {
        console.log('[CourseComment] Success:', res);
        if (res && res.code === 0 && res.data) {
          const newComments = res.data.comments || [];
          const mapped = newComments.map(c => {
            // 后端可能返回 boolean, 0/1, 或 "true"/"false"
            const rawLike = (c as any).like ?? (c as any).isLiked;
            const isLiked = rawLike === true || rawLike === 1 || String(rawLike) === 'true';
            return {
              ...c,
              like: isLiked,
              likeCnt: Number(c.likeCnt || 0)
            };
          });

          list.value = pageNum === 1 ? mapped : [...list.value, ...mapped];

          query = list.value.length < (res.data.total || 0);
          console.log('[CourseComment] List updated, size:', list.value.length, 'Next Query Allowed:', query);
        }

      });
    }
  }

  function like(targetId: string) {
    console.log('[CourseComment] Like Clicked:', targetId);
    const index = list.value.findIndex(c => String(c.id) === String(targetId));
    if (index !== -1) {
      const comment = { ...list.value[index] };
      // 1. 立即触发本地响应式更新
      comment.like = !comment.like;
      const originalCnt = Number(comment.likeCnt || 0);
      comment.likeCnt = comment.like ? originalCnt + 1 : Math.max(0, originalCnt - 1);
      
      list.value[index] = comment;
      console.log('[CourseComment] Local Update:', { id: targetId, like: comment.like, likeCnt: comment.likeCnt });

      // 2. 发送异步请求同步后端
      http.LikeController.likeCreate(targetId, {
        targetId: targetId,
        targetType: "2"
      }).then(res => {
        if (res && res.code === 0 && res.data) {
          // 后端返回成功，我们再次确认状态（以防并发操作）
          const updatedIndex = list.value.findIndex(c => String(c.id) === String(targetId));
          if (updatedIndex !== -1) {
             list.value[updatedIndex] = {
               ...list.value[updatedIndex],
               likeCnt: Number(res.data.likeCnt ?? list.value[updatedIndex].likeCnt),
               like: res.data.like ?? list.value[updatedIndex].like
             };
          }
        }
      }).catch(err => {
        console.error('[CourseComment] Like API Failed:', err);
      });
    }
  }

  function next() {
    console.log('[CourseComment] next() called, current page:', page.value);
    page.value++;
  }

  watchEffect(() => {
    if (p.id) {
      fetch(p.id, page.value);
    }
  });

  return {
    list,
    page,
    like,
    next,
    fetch
  };
}

export function format(timeStamp: string): string {
  if (!timeStamp) return "";
  const date = new Date(timeStamp);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}
