<template>
  <view class="page-container">
    <scroll @bottom="handleScrollBottom" @scroll="handleScroll">
      <top-bar class="top-bar" :selected="0" />
      <view class="box">
        <ul v-if="rows[type] && rows[type].length > 0">
          <li
            v-for="item in rows[type]"
            :key="item.id"
            class="course-li"
            @click="jump(item.id)"
          >
            <choose-course :data="item" />
          </li>
        </ul>
        <view v-else class="empty-state">
          <text class="empty-text">暂无搜索结果</text>
        </view>
      </view>
      <view class="bottom">--- 到底了哟 ---</view>
    </scroll>
  </view>
</template>
<script setup lang="ts">
import { useChoose } from "./index";

const { type, keyword, jump, rows, page } = useChoose();
onLoad((options: any) => {
  keyword.value = options.keyword;
  type.value = options.type || "course";
  PubSub.publish("commit_input", options.keyword);
});

function handleScrollBottom() {
  page.value++;
}

function handleScroll(e: any) {
  const scrollTop = e.detail?.scrollTop || 0;
  uni.$emit('pageScroll', { scrollTop });
}
</script>
<style scoped lang="scss">
.page-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.box {
  margin-top: 35vw;
  margin-left: 5vw;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20vw 0;
  
  .empty-text {
    font-size: 3.5vw;
    color: #999;
  }
}

.bottom {
  margin-left: 37.5vw;
  margin-top: 2.5vw;
  font-size: 3.3vw;
  color: #777777;
}
</style>
