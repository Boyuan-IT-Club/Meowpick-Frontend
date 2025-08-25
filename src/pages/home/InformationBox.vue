<template>
  <view class="background">
    <view class="box">
      <p v-for="item of data" class="text">{{ item }}</p>
    </view>
  </view>
</template>

<script setup lang="ts">
type Props = {
  data: string[];
};
const props = defineProps<Props>();
const text1 = `2024/6/5 3.0.0版本`;
const text2 = `* 选课猫新页面上线`;
const text3 = `* 新增统计课程标签数量`;
</script>

<style scoped lang="scss">
.background {
  .box {
    margin: 2vw 0;
    width: 96vw;
    height: auto;
    padding: 3vw;
    background: #ffffff;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
    z-index: 99;
    opacity: 0.8;
    display: flex;
    position: relative;
    left: 2vw;
    flex-direction: column;
    border-radius: 2vw;
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
