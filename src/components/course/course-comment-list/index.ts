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
      http.CommentController.query({ id, page }).then((res) => {
        res.data.payload.rows?.forEach((comment) => {
          list.value[comment.id!] = comment;
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
