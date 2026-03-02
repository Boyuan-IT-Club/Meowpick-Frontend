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
        
        // 临时添加虚拟数据进行测试展示
        if (res.data.data.rows && res.data.data.rows.length === 0) {
           res.data.data.rows = [
             {
               id: "mock1",
               text: "这门课真的太硬核了，一定要好好复习才能过！",
               tags: ["硬核", "避雷"],
               crateAt: new Date().toISOString(),
               user: { name: "计算机系学长", avatar: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" },
               relation: { like: false, like_cnt: 12 }
             },
             {
               id: "mock2",
               text: "老师讲得很幽默，给分也很好，推荐大一新生选！",
               tags: ["推荐", "幽默", "容易"],
               crateAt: new Date(Date.now() - 3600000).toISOString(),
               user: { name: "选课小助手", avatar: "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" },
               relation: { like: true, like_cnt: 8 }
             }
           ];
           res.data.data.total = 2;
        } else if (res.data.data.rows) {
           // 确保已有的真实评论如果没标签也给造几条假标签供测试看效果
           res.data.data.rows.forEach((item, index) => {
             if (!item.tags || item.tags.length === 0) {
               item.tags = index % 2 === 0 ? ["硬核", "推荐"] : ["容易", "幽默"];
             }
           });
        }

        res.data.data.rows?.forEach((comment) => {
          list.value[comment.id!] = comment;
        });
        query = Object.values(list.value).length < res.data.data.total!;   
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
