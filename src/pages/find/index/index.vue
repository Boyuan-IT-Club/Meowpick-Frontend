<template>
  <top-bar :selected="0" />
  <view class="content">
    <!--        <img src="../../../images/cat.png" />-->
    <view class="find">
      <view class="input">
        <find @keydown="handleKeydown" />
      </view>
      <view class="hot">
        <text class="title">热搜</text>
        <view class="text">
          <view class="box">
            <view v-for="item of hot" class="item">
              <view class="txt" @click="jump2search(item)">{{ item }}</view>
            </view>
          </view>
        </view>
      </view>
      <view class="recent">
        <view class="history">
          <text class="title">搜索历史</text>
          <!--                    <image src="../../..//images/delete-icon.png" class="delete" @click="deleteHistory"></image>-->
        </view>

        <view class="text">
          <view class="box">
            <view v-for="item in recent" class="item">
              <view class="txt" @click="jump2Recent(item.text!)">
                {{ item.text }}
              </view>
              <!--                                <div class="icon" @click="commitInput(item.text!)">↖</div>-->
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
import type { SearchHistoryVO } from "@/api/data-contracts";
import { useTokenStore } from "@/config";

const tokenStore = useTokenStore();
const recentText = ref("");
const hot = ["思政类", "英语类", "体育类", "劳动与创造"];

const recent = shallowRef<SearchHistoryVO[]>([]);
onShow(() => {
  http.SearchController.recent().then((res) => {
    recent.value = res.data.payload;
  });
  uni.hideTabBar();
});

function jump2search(keyword: string) {
  uni.navigateTo({
    url: `/pages/find/choose/index?keyword=${keyword}`
  });
}

function jump2Recent(keyword: string) {
  PubSub.publish("commit_input", keyword);
  PubSub.publish("get_recent");
}

function handleKeydown(text: string) {
  console.log("Received text from ChildComponent:", text);
}

const deleteHistory = () => {
  recent.value = [];
  http.SearchController.removeRecent(tokenStore.userId);
};
</script>

<style scoped lang="scss">
.content {
  position: fixed;
  top: 35vw;
  left: 5vw;

  .hot {
    margin-top: 4vw;
    margin-left: 4vw;

    .title {
      font-weight: bold;
      font-size: 3.46vw;
    }

    .text {
      .box {
        margin-left: -5vw;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;

        .item {
          background-color: #f2f2f2;
          margin-left: 3vw;
          margin-top: 3vw;
          padding: 2vw;
          border-radius: 3vw;

          .txt {
            color: #181818;
            font-size: 3.2vw;
          }
        }
      }
    }
  }

  .recent {
    margin-top: 13vw;
    margin-left: 4vw;

    .history {
      display: flex;
      flex-direction: row;

      .title {
        font-weight: bold;
        font-size: 3.46vw;
      }

      .delete {
        width: 6vw;
        height: 6vw;
        margin-left: 60vw;
      }
    }

    .text {
      .box {
        margin-left: -5vw;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;

        .item {
          background-color: #f2f2f2;
          margin-left: 3vw;
          margin-top: 3vw;
          padding: 2vw;
          border-radius: 3vw;
          max-width: 30vw;

          .txt {
            color: #181818;
            font-size: 3.2vw;
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
