import type { CommentVO } from "@/api/data-contracts";
export function useCourseComment() {
  const page = shallowRef(0);
  const list = ref<CommentVO[]>([]);
  let query = true;

  function fetch(page: number) {
    if (page === 0) {
      query = true;
      list.value = [];
    }

    if (query) {
      http.CommentController.history({ page, pageSize: 5 }).then((res) => {
        res.data.data.comments?.forEach((comment) => {
          list.value.push(comment);
        });
        query = list.value.length < res.data.data.total!;
      });
    }
  }

  function like(target: string) {
    const comment = list.value.find(c => c.id === target);
    if (!comment) return;

    comment.like = !comment.like;
    comment.likeCnt += comment.like ? 1 : -1;

    http.ActionController.like(target, {});
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
