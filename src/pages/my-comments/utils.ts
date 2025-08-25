import type { CommentVO } from "@/api/data-contracts";
export function useCourseComment() {
  const page = shallowRef(0);
  const list = ref<{ [key: string]: CommentVO }>({});
  let query = true;

  function fetch(page: number) {
    if (page == 0) {
      query = true;
    }
    if (query) {
      http.CommentController.history({ page, size: 5 }).then((res) => {
        res.data.payload.rows?.forEach((comment) => {
          list.value[comment.id!] = comment;
          console.log(comment.uid);
        });
        query = Object.values(list.value).length < res.data.payload.total!;
      });
    }
  }

  function like(target: string) {
    list.value[target].relation!.like = !list.value[target].relation!.like;
    list.value[target].relation!.like_cnt! += list.value[target].relation!.like
      ? 1
      : -1;
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
