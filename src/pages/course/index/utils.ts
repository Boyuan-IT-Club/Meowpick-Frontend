import type { CommentVO, ActionVO } from "@/api/data-contracts";

type Props = {
  id: string;
};

// Extend CommentVO for local usage to include properties that might be missing or handled differently
interface ExtendedCommentVO extends CommentVO {
  likeCnt?: number;
  like?: boolean;
  score?: number;
}

export function useCourseComment(p: Props) {
  const page = shallowRef(0);
  const list = ref<{ [key: string]: ExtendedCommentVO }>({});
  let query = true;

  function fetch(id: string, page: number) {
    if (page == 0) {
      query = true;
    }
    // Mock data injection
    if (page === 0) {
        const mockComments: ExtendedCommentVO[] = [
            { id: 'm1', text: '这门课老师讲得非常好，深入浅出，很有收获！', tags: ['推荐', '硬核'], score: 5, uid: 'user1', likeCnt: 12, like: false, crateAt: new Date().toISOString() },
            { id: 'm2', text: '期末考试有点难，平时作业一定要认真做。', tags: ['硬核', '容易'], score: 3, uid: 'user2', likeCnt: 5, like: true, crateAt: new Date(Date.now() - 86400000).toISOString() },
            { id: 'm3', text: '给分很公道，推荐选修。', tags: ['推荐', '幽默'], score: 4, uid: 'user3', likeCnt: 8, like: false, crateAt: new Date(Date.now() - 172800000).toISOString() },
            { id: 'm4', text: '这门课比较水，适合刷学分。', tags: ['容易'], score: 2, uid: 'user4', likeCnt: 3, like: false, crateAt: new Date(Date.now() - 259200000).toISOString() },
            { id: 'm5', text: '老师人很好，点名不严，但是学不到太多硬核知识。', tags: ['避雷'], score: 1, uid: 'user5', likeCnt: 20, like: true, crateAt: new Date(Date.now() - 345600000).toISOString() }
        ];

        mockComments.forEach((comment) => {
             // 课程吐槽（评论）数据填充
             if(comment.id && !list.value[comment.id]) {
                list.value[comment.id] = { ...comment };
             }
        });
    }

    if (query) {
      // Temporarily comment out real API call to see mock data cleanly
      // http.CommentController.query({ id, page }).then((res) => {
      //   res.data.rows?.forEach((comment: CommentVO) => {
      //     list.value[comment.id!] = {
      //       ...comment, // extend from raw data
      //       tags: comment.tags && comment.tags.length > 0 ? comment.tags : ['硬核', '推荐'],
      //       score: comment.score || 4,
      //       like: comment.relation?.like ?? false,
      //       likeCnt: comment.relation?.like_cnt ?? 0
      //     };
      //   });
      //   query = Object.values(list.value).length < (res.data.total || 0);
      // });
    }
  }

  function like(target: string) {
    if (list.value[target]) {
      list.value[target].like = !list.value[target].like;
      list.value[target].likeCnt = (list.value[target].likeCnt || 0) + (list.value[target].like ? 1 : -1);
      // http.ActionController.like(target, {});
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

export function format(timeStamp: string): string {
  const date = new Date(timeStamp);
  const year = String(date.getFullYear());
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
}
