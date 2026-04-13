import { ref, shallowRef, watch } from "vue";
import { http } from "@/config";
import type { CommentVO } from "@/api/data-contracts";

export function useCourseComment() {
  const page = shallowRef(1);
  const list = ref<CommentVO[]>([]);
  let query = true;

  function fetch(page: number) {
    if (page === 1) {
      query = true;
      list.value = [];
    }

    if (query) {
      console.log(`[MyComments] Fetching page ${page}`);
      http.CommentController.commentHistoryCreate({ page, pageSize: 5 }).then((res) => {
        console.log(`[MyComments] Raw Response:`, JSON.stringify(res));
        if (res && res.code === 0 && res.data) {
          const newComments = res.data.comments || [];
          const mapped = newComments.map(c => {
            const rawLike = (c as any).like ?? (c as any).isLiked;
            const isLiked = rawLike === true || rawLike === 1 || String(rawLike) === 'true';
            return {
              ...c,
              like: isLiked,
              likeCnt: Number(c.likeCnt || 0)
            };
          });
          
          if (page === 1) {
            list.value = mapped;
          } else {
            list.value = [...list.value, ...mapped];
          }
          query = list.value.length < (res.data.total || 0);
          console.log(`[MyComments] Updated list size: ${list.value.length}, Total possible: ${res.data.total}`);
        }
      }).catch(err => {
        console.error(`[MyComments] Request error:`, err);
      });
    }
  }

  function like(targetId: string) {
    console.log('[MyComments] Like Clicked:', targetId);
    const index = list.value.findIndex(c => String(c.id) === String(targetId));
    if (index !== -1) {
      const comment = { ...list.value[index] };
      // 1. 立即触发本地响应式更新
      comment.like = !comment.like;
      const originalCnt = Number(comment.likeCnt || 0);
      comment.likeCnt = comment.like ? originalCnt + 1 : Math.max(0, originalCnt - 1);
      
      list.value[index] = comment;
      console.log('[MyComments] Local Update:', { id: targetId, like: comment.like, likeCnt: comment.likeCnt });

      // 2. 发送异步请求同步后端
      http.LikeController.likeCreate(targetId, {
        targetId: targetId,
        targetType: "2"
      }).then(res => {
        if (res && res.code === 0 && res.data) {
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
        console.error('[MyComments] Like API Failed:', err);
      });
    }
  }

  function next() {
    page.value++;
  }

  watch([page], () => {
    fetch(page.value);
  });

  return {
    list,
    page,
    like,
    next,
    fetch
  };
}
