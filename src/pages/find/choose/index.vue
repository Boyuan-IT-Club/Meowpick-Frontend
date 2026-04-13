<template>
  <scroll @bottom="handleScrollBottom">
    <top-bar class="top-bar" :selected="0" />
    <view class="box">
      <view v-if="loading && list.length === 0" class="loading-tip">搜索中...</view>
      <ul v-else-if="list.length > 0">
        <li
          v-for="item in list"
          :key="item.id"
          class="course-li"
          @click="jump(item.id)"
        >
          <choose-course :data="item" />
        </li>
      </ul>
      <view v-else class="empty-tip">未找到相关课程</view>
    </view>
    <view v-if="list.length > 0" class="bottom">--- 到底了哟 ---</view>
  </scroll>
</template>

<script setup lang="ts">
import { onLoad } from "@dcloudio/uni-app";
import { PubSub } from "@/config";
import { useChoose } from "./index";
import ChooseCourse from "@/components/choose/choose-course/index.vue";

const { type, keyword, jump, list, page, loading } = useChoose();

onLoad((options: any) => {
  console.log('[SearchPage] onLoad options:', options);
  if (options.keyword) {
    keyword.value = options.keyword;
    type.value = options.type || "course";
    PubSub.publish("commit_input", options.keyword);
  }
});

function handleScrollBottom() {
  if (!loading.value) {
    page.value++;
  }
}
</script>

<style scoped lang="scss">
.box {
  margin-top: 35vw;
  margin-left: 5vw;
  width: 90vw;
}
.loading-tip, .empty-tip {
  text-align: center;
  padding: 20vw 0;
  color: #999;
  font-size: 3.5vw;
}
.bottom {
  text-align: center;
  padding: 5vw 0;
  font-size: 3.3vw;
  color: #777777;
}
.course-li {
  list-style: none;
  margin-bottom: 4vw;
}
</style>
