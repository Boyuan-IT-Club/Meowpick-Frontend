import type { CommentVO } from "@/api/data-contracts";

type Props = {
  id: string;
};

export function useCourseComment(p: Props) {
  const page = shallowRef(0);
  const list = ref<{ [key: string]: CommentVO }>({});
  let query = true;

  function fetch(id: string, page: number) {
    if (page == 0) {
      query = true;
    }
    if (query) {
      http.CommentController.commentQueryList({ courseId: id as any, page, pageSize: 10 }).then((res) => {
        res.data.comments?.forEach((comment) => {
          list.value[comment.id!] = comment;
        });
        query = Object.values(list.value).length < res.data.total!;
      });
    }
  }

  function like(target: string) {
    const comment = list.value[target];
    if (comment && comment.relation) {
      comment.relation.like = !comment.relation.like;
      comment.relation.like_cnt! += comment.relation.like ? 1 : -1;
      http.LikeController.likeCreate(target, {
        targetId: target,
        targetType: "2"
      });
    }
  }

  function next() {
    page.value++;
  }

  watchEffect(() => {
    if (p.id != "") {
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
