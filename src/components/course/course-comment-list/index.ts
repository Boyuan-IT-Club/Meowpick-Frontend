import { ref, shallowRef, watchEffect } from 'vue';
import type { DtoCommentVO } from "@/api/data-contracts";
import { http } from "@/config";

type Props = {
  id: string;
};

interface ExtendedCommentVO extends DtoCommentVO {
  likeCnt?: number;
  like?: boolean;
  score?: number;
}

export function useCourseComment(p: Props) {
  const page = shallowRef(0);
  const list = ref<{ [key: string]: ExtendedCommentVO }>({});
  const query = ref(true);

  function fetch(id: string, pageNum: number) {
    if (pageNum === 0) {
      query.value = true;
    }
    if (query.value) {
      http.CommentController.commentQueryList({ id, page: pageNum, pageSize: 20 }).then((res) => {
        const data = res.data as any;
        const comments = data?.data?.comments || data?.comments || [];
        const total = data?.data?.total || data?.total || 0;
        comments.forEach((comment: any) => {
          list.value[comment.id!] = {
            ...comment,
            tags: comment.tags && comment.tags.length > 0 ? comment.tags : ['硬核', '推荐'],
            score: comment.score || 4,
            like: comment.like ?? comment.relation?.like ?? false,
            likeCnt: comment.likeCnt ?? comment.relation?.likeCnt ?? 0
          };
        });
        query.value = Object.values(list.value).length < total;
      });
    }
  }

  function like(target: string) {
    if (list.value[target]) {
      list.value[target].like = !list.value[target].like;
      list.value[target].likeCnt = (list.value[target].likeCnt || 0) + (list.value[target].like ? 1 : -1);
      http.ActionController.likeCreate(target, { targetType: '2' });
    }
  }

  function next() {
    page.value++;
  }

  watchEffect(() => {
    if (p.id !== "") {
      fetch(p.id, page.value);
    }
  });

  return { list, page, like, next, fetch };
}