import type { DtoCommentVO } from "@/api/data-contracts";
import { http } from "@/config";

export function useCourseComment() {
  const page = shallowRef(0);
  const list = ref<DtoCommentVO[]>([]);
  let query = true;

  function fetch(page: number) {
    if (page === 0) {
      query = true;
      list.value = [];
    }

    if (query) {
      http.CommentController.commentHistoryCreate({ page, pageSize: 5 }).then((res) => {
        if (res.data?.code === 0) {
          const responseData = res.data.data || res.data;
          responseData?.comments?.forEach((comment) => {
            list.value.push(comment);
          });
          query = list.value.length < (responseData?.total || 0);
        }
      });
    }
  }

  function like(target: string) {
    const comment = list.value.find(c => c.id === target);
    if (!comment) return;

    http.LikeController.likeCreate(target, {
      targetId: target,
      targetType: '2'
    }).then((res) => {
      if (res.data?.code === 0) {
        const isLiked = res.data?.like ?? res.data?.data?.like ?? !comment.like;
        const newCnt = res.data?.likeCnt ?? res.data?.data?.likeCnt ?? (isLiked ? comment.likeCnt! + 1 : comment.likeCnt! - 1);
        comment.like = isLiked;
        comment.likeCnt = newCnt;
      }
    }).catch((err) => {
      console.error('[API] 点赞评论失败:', err);
    });
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
