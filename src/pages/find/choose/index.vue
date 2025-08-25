<template>
  <scroll @bottom="handleScrollBottom">
    <top-bar class="top-bar" :selected="0" />
    <view class="box">
      <ul>
        <li
          v-for="item in rows.course"
          class="course-li"
          @click="jump(item.data?.id!)"
        >
          <choose-course :data="item" />
        </li>
      </ul>
    </view>
    <view class="bottom">--- 到底了哟 ---</view>
  </scroll>
</template>
<script setup lang="ts">
import { useChoose } from "./index";

const { type, keyword, jump, rows, page } = useChoose();
onLoad((options: any) => {
  keyword.value = options.keyword;
  PubSub.publish("commit_input", options.keyword);
});

function handleScrollBottom() {
  page.value++;
}
</script>
<style scoped lang="scss">
.box {
  margin-top: 35vw;
  margin-left: 5vw;
}
.bottom {
  margin-left: 37.5vw;
  margin-top: 2.5vw;
  font-size: 3.3vw;
  color: #777777;
}
</style>
