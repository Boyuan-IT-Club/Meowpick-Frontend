<template>
  <div class="search-result-box">
    <div class="search-result">
      <view class="title">
        <view class="name">
          {{ props.data?.data.name }}
        </view>
        <view class="dept-name">{{ props.data?.data.category }}</view>
      </view>
      <view class="information">
        <view class="circle" />
        <view class="department">{{ props.data?.data.department }}</view>
        <view class="circle" />
        <view
          v-for="item of props.data?.data?.teacherList"
          class="instructor"
          >{{ item.name }}</view
        >
      </view>
      <view class="tip">
        <view
          v-for="item of getTop3List(props.data.data?.tagCount!)"
          class="item"
        >
          <image class="emoji" :src="Emoji(item.tag)" />
          <view class="text">{{ item.count }}</view>
        </view>
      </view>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Course } from "@/api/data-contracts";
import { Emoji, getTop3List } from "@/utils/tags";

type Props = {
  data: Course;
};
const props = defineProps<Props>();
</script>

<style scoped lang="scss">
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
        max-width: 50vw;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .dept-name {
        margin-top: 4.5vw;
        margin-left: 2vw;
        font-size: 3.2vw;
        color: #545454;
        white-space: nowrap;
      }
    }
    .information {
      display: flex;
      flex-direction: row;
      margin-top: 2vw;
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
</style>
