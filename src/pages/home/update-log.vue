<template>
  <view class="background">
    <image src="@/images/cat.png" class="background-image" />
    <scroll v-for="item of UpdateLog">
      <InformationBox :data="item" />
    </scroll>
  </view>
</template>

<script setup lang="ts">
import InformationBox from "@/pages/home/InformationBox.vue";
import { UpdateLog } from "./information";
</script>

<style scoped lang="scss">
.background {
  position: relative;
  .background-image {
    position: fixed;
    width: 70vw;
    height: 105vw;
    left: 25vw;
    top: 10vw;
    z-index: 0;
  }
  .box {
    position: absolute;
    left: 2vw;
    top: 5vw;
    width: 96vw;
    height: auto;
    padding: 5vw;
    background: #ffffff;
    box-shadow: 1vw 1vw 6vw 3vw #0000001f;
    z-index: 1;
    opacity: 0.8;
    display: flex;
    flex-direction: column;
    border-radius: 1vw;
    word-wrap: break-word; /* 允许长单词或URL地址换行 */
    overflow-wrap: break-word; /* 允许在单词内部换行以避免溢出 */
    .title {
      display: flex;
      font-weight: bold;
      justify-content: center;
    }
    .text {
      white-space: pre-wrap;
      margin-top: 2vw;
      font-size: 4vw;
    }
  }
}
</style>
