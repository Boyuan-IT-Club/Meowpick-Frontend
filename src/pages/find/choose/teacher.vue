<template>
  <view class="page-container">
    <scroll @bottom="handleScrollBottom" @scroll="handleScroll">
      <top-bar class="top-bar" :selected="0" />
      <view v-for="item of rows" class="content">
        <view v-for="course of item.courses" :key="course.id" @click="jump(course.id)">
          <div class="search-result-box">
            <div class="search-result">
              <view class="title">
                <view class="name">
                  {{ course.name }}
                </view>
                <view class="dept-name">{{ course.category }}</view>
              </view>
              <view class="information">
                <view class="circle" />
                <view class="department">{{ course.department }}</view>
                <view class="circle" />
                <view v-for="teacher of course.teacherList" :key="teacher.id" class="instructor">{{
                  teacher.name
                }}</view>
              </view>
              <view class="tip">
                <view v-for="tagItem of getTop3List(course.tagCount)" :key="tagItem.tag" class="item">
                  <image class="emoji" :src="Emoji(tagItem.tag)" />
                  <view class="text">{{ tagItem.count }}</view>
                </view>
              </view>
            </div>
          </div>
        </view>
      </view>
      <view class="bottom">--- 到底了哟 ---</view>

      <view class="propose-entry" @click="goToPropose">
        <text class="propose-entry-text">没有想搜的课程？点击这里新增课程</text>
      </view>
      <view class="scroll-bottom-spacer" />
    </scroll>
  </view>
</template>
<script setup lang="ts">
import { useChoose } from "./teacher";
import { Emoji, getTop3List } from "@/utils/tags";
import { onLoad } from "@dcloudio/uni-app";
import PubSub from "@/config/utils/pubsub";

const { keyword, rows, page, jump } = useChoose();
onLoad((options: any) => {
  const decodedKeyword = decodeURIComponent(options.keyword || "");
  keyword.value = decodedKeyword;
  PubSub.publish("commit_input", decodedKeyword);
});

function handleScrollBottom() {
  page.value++;
}

function handleScroll(e: any) {
  const scrollTop = e.detail?.scrollTop || 0;
  uni.$emit('pageScroll', { scrollTop });
}

function goToPropose() {
  uni.navigateTo({
    url: "/pages/proposal/propose"
  });
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
.bottom {
  margin-left: 37.5vw;
  margin-top: 2.5vw;
  font-size: 3.3vw;
  color: #777777;
}
.propose-entry {
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
.scroll-bottom-spacer {
  height: 22vw;
}
.content {
  margin-top: 30vw;
  margin-left: 5vw;
  .search-result-box {
    background-color: #b70030;
    width: 89vw;
    height: auto;
    margin-top: 5vw;
    border-radius: 3vw;
    .search-result {
      background-color: #ffffff;
      width: 87vw;
      height: auto;
      margin-left: 1vw;
      border-radius: 3vw;
      box-shadow: 4px 4px 16px 0px #0000001f;
      padding: 1.5vw;
      .title {
        display: flex;
        flex-direction: row;
        .name {
          margin-left: 2vw;
          margin-top: 4vw;
          font-size: 3.8vw;
          font-weight: bold;
        }
        .dept-name {
          margin-left: 2.5vw;
          margin-top: 4.5vw;
          font-size: 3.2vw;
          color: #545454;
        }
      }
      .information {
        display: flex;
        flex-direction: row;
        margin-top: 3vw;
        margin-bottom: 2vw;
        .circle {
          width: 2vw;
          height: 2vw;
          border-radius: 50%;
          background-color: #b70030;
          margin-left: 2vw;
          margin-top: 1.5vw;
        }
        .department {
          margin-left: 1.5vw;
          font-size: 3.5vw;
        }
        .instructor {
          margin-left: 1.5vw;
          font-size: 3.5vw;
        }
      }
      .tip {
        display: flex;
        flex-wrap: wrap;
        margin-top: 3vw;
        .item {
          background: #f1f1f1;
          display: flex;
          flex-direction: row;
          padding: 1.5vw;
          border-radius: 4vw;
          margin-left: 2vw;
          margin-bottom: 2vw;
          .emoji {
            width: 5.5vw;
            height: 5.5vw;
          }
          .text {
            margin-top: 0.5vw;
            margin-left: 1vw;
            color: #cf2600;
            font-size: 3.7vw;
          }
        }
      }
    }
  }
}
</style>
