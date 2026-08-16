<template>
  <top-bar :selected="0" />
  <view class="content">
    <!--        <img src="../../../images/cat.png" />-->
    <view class="find">
      <view class="input">
        <find @keydown="handleKeydown" />
      </view>
<!--      <view class="hot">-->
<!--        <text class="title">热搜</text>-->
<!--        <view class="text">-->
<!--          <view class="box">-->
<!--            <view v-for="item of hot" class="item">-->
<!--              <view class="txt" @click="jump2search(item)">{{ item }}</view>-->
<!--            </view>-->
<!--          </view>-->
<!--        </view>-->
<!--      </view>-->
      <view class="recent">
        <view class="history">
          <text class="title">搜索历史</text>
          <!--                    <image src="../../..//images/delete-icon.png" class="delete" @click="deleteHistory"></image>-->
        </view>

        <view class="text">
          <view class="box">
            <view v-for="item in recent" class="item">
              <view class="txt" @click="jump2Recent(item.query!)">
                {{ safeDecode(item.query) }}
              </view>
              <!--                                <div class="icon" @click="commitInput(item.text!)">↖</div>-->
            </view>
          </view>
        </view>
      </view>
    </view>
    <div class="category" />
    <div class="recommend" />

    <!-- 新增提案入口 -->
    <view class="propose-entry" @click="goToPropose">
      <text class="propose-entry-text">没有想搜的课程？点击这里新增课程</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { DtoSearchHistoryVO } from "@/api/data-contracts";
import { useTokenStore } from "@/config";
import { ref } from "vue";
import { onShow, onPageScroll } from "@dcloudio/uni-app";
import { http } from "@/config";
import PubSub from "@/config/utils/pubsub";
import find from "@/components/find/index.vue";

const tokenStore = useTokenStore();
const recentText = ref("");
// const hot = ["思政类", "英语类", "体育类", "劳动与创造"];

const recent = ref<DtoSearchHistoryVO[]>([]);
onShow(() => {
  http.SearchController.searchRecentList().then((res) => {
    const responseData = res.data.data || res.data;
    recent.value = responseData?.histories || res.data?.histories || [];
  });
  uni.hideTabBar();
});

onPageScroll((e) => {
  uni.$emit('pageScroll', e);
});

function jump2search(keyword: string) {
  uni.navigateTo({
    url: `/pages/find/choose/index?keyword=${encodeURIComponent(keyword)}`
  });
}

function jump2Recent(keyword: string) {
  PubSub.publish("commit_input", safeDecode(keyword));
  PubSub.publish("get_recent");
}

function handleKeydown(text: string) {
  console.log("Received text from ChildComponent:", text);
}

const deleteHistory = () => {
  recent.value = [];
  // 接口已变更，暂时注释
  // http.SearchController.removeRecent(tokenStore.userId);
};

const goToPropose = () => {
  uni.navigateTo({
    url: "/pages/proposal/propose"
  });
};

function safeDecode(str?: string): string {
  if (!str) return "";
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
}
</script>

<style scoped lang="scss">
.content {
  position: fixed;
  top: 35vw;
  left: 5vw;
  right: 5vw;
  padding-bottom: 20vw;

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
    margin-top: 6vw;
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

  .propose-entry {
    margin-top: 8vw;
    display: flex;
    justify-content: center;
    padding: 3vw 0;

    .propose-entry-text {
      font-size: 3.2vw;
      color: #ffffff;
      background-color: #b70030;
      padding: 2vw 5vw;
      border-radius: 5vw;
    }
  }
}
</style>
