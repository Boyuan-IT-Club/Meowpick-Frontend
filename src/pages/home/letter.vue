<template>
  <view class="background">
    <image src="@/images/cat.png" class="background-image" />
    <view class="box">
      <p class="text">{{ text1 }}</p>
      <p class="text">{{ text2 }}</p>
      <p class="text">{{ text3 }}</p>
      <p class="text">{{ text4 }}</p>
      <p class="text">{{ text5 }}</p>
      <p class="text">{{ text6 }}</p>
      <p class="text">{{ text7 }}</p>
      <p class="text">{{ text8 }}</p>
      <p class="text">{{ text9 }}</p>
      <p class="text">{{ text10 }}</p>
      <p class="text">{{ text11 }}</p>
      <p class="text">{{ text12 }}</p>
    </view>
  </view>
</template>

<script setup lang="ts">
onLoad(() => {
  // 当用户访问这封信时，标记为已读
  uni.setStorageSync('hasReadLetter', true);
});

const text1 = `全新版的 选课猫 终于和大家见面啦！`;
const text2 = `原开发团队的朋友们大多已经毕业或升学，因此选课猫曾有一段时间陷入无人维护的状态。`;
const text3 = `在 2025 年暑假，我们新团队正式接过选课猫的维护与重构任务。`;
const text4 = ``;
const text5 = `也许大家暂时不会觉得新版有太多变化，这是因为我们暂未增加新功能。`;
const text6 = `但事实上，我们已经彻底重构了选课猫的整体后端架构，让系统更加稳定流畅。`;
const text7 = `今后在选课高峰期，也不再那么容易出现崩溃的情况啦！`;
const text8 = ``;
const text9 = `未来，我们还计划逐步推出更多功能，`;
const text10 = `包括大家期待已久的「新增课程和老师」功能等。`;
const text11 = `感谢大家一直以来对选课猫的喜爱与支持 ❤`;
const text12 = `选课猫团队 2025年10月13日`;
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