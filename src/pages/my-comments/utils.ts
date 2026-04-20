import type { DtoCommentVO } from "@/api/data-contracts";
import { ref, shallowRef, watch } from 'vue';
import { http } from "@/config";

export function useCourseComment() {
  const page = shallowRef(0);
  const list = ref<DtoCommentVO[]>([]);
  const loading = ref(false);
  const error = ref(false);
  let query = true;

  function fetch(pageNum: number) {
    if (pageNum === 0) {
      query = true;
      list.value = [];
    }

    loading.value = true;
    error.value = false;

    if (query) {
      http.CommentController.commentHistoryCreate({ page: pageNum, pageSize: 5 }).then((res) => {
        const data = res.data as any;
        const comments = data?.data?.comments || data?.comments || [];
        const total = data?.data?.total || data?.total || 0;
        comments.forEach((comment: any) => {
          list.value.push(comment);
        });
        query = list.value.length < total;
        loading.value = false;
      }).catch((err: any) => {
        console.error('[useCourseComment] fetch error:', err);
        loading.value = false;
        error.value = true;
      });
    } else {
      loading.value = false;
    }
  }

  function like(target: string) {
    const comment = list.value.find(c => c.id === target);
    if (!comment) return;

    comment.like = !comment.like;
    comment.likeCnt = (comment.likeCnt || 0) + (comment.like ? 1 : -1);

    http.ActionController.likeCreate(target, { targetType: '2' });
  }

  function remove(id: string) {
    return http.CommentController.commentDelete(id).then((res: any) => {
      if (res.data?.code === 200 || res.data?.success) {
        list.value = list.value.filter(c => c.id !== id);
        return true;
      }
      return false;
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
    loading,
    error,
    like,
    next,
    fetch,
    remove
  };
}
