<template>
  <top-bar :selected="0" />
  <view class="content">
    <view class="find">
      <view class="input">
        <find-component @on-keydown="handleKeydown" />
      </view>
      <view class="recent">
        <view class="history">
          <text class="title">搜索历史</text>
        </view>

        <view class="text">
          <view class="box">
            <view v-for="item in recent" :key="item.id" class="item">
              <view class="txt" @click="jump2Recent(item.query!)">
                {{ item.query }}
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <div class="category" />
    <div class="recommend" />
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { http, PubSub } from "@/config";
import type { SearchHistoryVO } from "@/api/data-contracts";
import FindComponent from "@/components/find/index.vue";

const recent = ref<SearchHistoryVO[]>([]);

onShow(() => {
  console.log('[FindPage] onShow - Fetching recent searches');
  http.SearchController.searchRecentList().then((res) => {
    if (res && res.code === 0 && res.data) {
      recent.value = res.data.histories || [];
      console.log('[FindPage] Recent searches updated:', recent.value.length);
    }
  }).catch(err => {
    console.error('[FindPage] Fetch recent failed:', err);
  });
});

function jump2Recent(keyword: string) {
  PubSub.publish("commit_input", keyword);
  PubSub.publish("get_recent");
}

function handleKeydown(text: string) {
  console.log("Received text from ChildComponent:", text);
}
</script>

<style scoped lang="scss">
.content {
  position: fixed;
  top: 30vw;
  left: 5vw;
  width: 90vw;

  .recent {
    margin-top: 6vw;
    margin-left: 2vw;

    .history {
      display: flex;
      flex-direction: row;
      .title {
        font-weight: bold;
        font-size: 3.46vw;
        color: #333;
      }
    }

    .text {
      .box {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        margin-top: 2vw;

        .item {
          background-color: #f2f2f2;
          margin-right: 3vw;
          margin-bottom: 3vw;
          padding: 1.5vw 3vw;
          border-radius: 3vw;

          .txt {
            color: #181818;
            font-size: 3.2vw;
            max-width: 30vw;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }
    }
  }
}
</style>
