import type { DtoCommentVO, HandlerResponseDtoListCourseCommentsResp } from "@/api/data-contracts";
import { ref, watch } from 'vue';
import { http } from "@/config";
import { DEFAULT_PAGE_SIZE, TARGET_TYPE_COMMENT } from "@/utils/constants";

type Props = {
  id: string;
};

interface ExtendedCommentVO extends DtoCommentVO {
  likeCnt?: number;
  like?: boolean;
  score?: number;
}

export function useCourseComment(p: Props) {
  const page = ref(0);
  const list = ref<{ [key: string]: ExtendedCommentVO }>({});
  const query = ref(true);

  function fetch(id: string, pageNum: number) {
    if (!id || id === "") return;
    if (pageNum === 0) {
      query.value = true;
    }
    if (query.value) {
      http.CommentController.commentQueryList({ id, page: pageNum, pageSize: DEFAULT_PAGE_SIZE }).then((res) => {
        const data = res.data as HandlerResponseDtoListCourseCommentsResp;
        const comments = data?.data?.comments || [];
        const total = data?.data?.total || 0;
        comments.forEach((comment) => {
          list.value[comment.id!] = {
            ...comment,
            tags: comment.tags && comment.tags.length > 0 ? comment.tags : ['硬核', '推荐'],
            score: comment.score || 4,
            like: comment.like ?? comment.relation?.like ?? false,
            likeCnt: comment.likeCnt ?? comment.relation?.likeCnt ?? comment.relation?.like_cnt ?? 0
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
      http.ActionController.likeCreate(target, { targetType: TARGET_TYPE_COMMENT });
    }
  }

  function next() {
    page.value++;
  }

  watch(() => p.id, (newId) => {
    if (newId && newId !== "") {
      page.value = 0;
      list.value = {};
      fetch(newId, 0);
    }
  }, { immediate: true });

  return { list, page, like, next, fetch };
}

export function format(timeStamp: string): string {
  const date = new Date(timeStamp);
  const year = String(date.getFullYear());
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}
