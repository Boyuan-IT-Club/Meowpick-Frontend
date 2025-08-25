<template>
  <view class="background">
    <image src="@/images/cat.png" class="background-image" />
    <view class="box">
      <!--            <view class="title">给用户的一封信</view>-->
      <p class="text">{{ text1 }}</p>
      <p class="text">{{ text2 }}</p>
      <p class="text">{{ text3 }}</p>
      <p class="text">{{ text4 }}</p>
      <p class="text">{{ text5 }}</p>
      <view class="goto-mewoChat" @click="goToMewoChat">点击传送</view>
      <!--            <p class="text">{{ text6 }}</p>-->
      <!--            <view class="getID" @click="copyWeChatID">点我复制微信号</view>-->
    </view>
  </view>
</template>

<script setup lang="ts">
const text1 = `感谢同学们对选课猫一直以来的支持!  (鞠躬)`;
const text2 = `选课猫最初是开发者为了方便老乡群记录课程评价而开发的，最初的选课猫仅有老乡们对于体育课程的评价。后来应大家要求开发了新版，涵盖了学校所有开设课程，从此后课程评价的增长一发不可收拾，从最初的100余条评价，到现在马上突破4000条，使用人数也远超预期。`;
const text3 = `用户数上升也带来了一个问题，选课猫作为一个完全非盈利的项目，每逢选课都会产生上百元的服务器成本，总所周知ECNU每学期三轮选课，也就是一年六次的大出血……为了防止用户快速增长，我们曾经甚至关闭了选课猫的小程序搜索入口，仅允许老用户使用。`;
const text4 = `我们也尝试在平台内接入广告，但广告带来的收入至今为止不足百元，因此我们选择移除广告，让小程序更加干净。`;
const text5 = `>我们团队的新项目也已经上线啦!新项目将长期致力于城市流浪猫的救助和治理，欢迎大家支持!`;
const text6 = `>选课猫项目也招募小伙伴来重构，团队有服务器可以部署。`;
const goToMewoChat = () => {
  uni.navigateToMiniProgram({
    appId: "wxd7e995c7b9d793b8"
  });
};
// const weChatID = ref('你的微信号');
// const copyWeChatID = async () => {
//     try {
//         await navigator.clipboard.writeText(weChatID.value);
//         console.log('微信号已复制到剪贴板');
//     } catch (err) {
//         console.error('复制失败: ', err);
//     }
// };
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
    .goto-mewoChat {
      color: #3399ff;
      font-weight: bold;
      margin-top: 2vw;
      font-size: 4vw;
    }
    .getID {
      color: #3399ff;
      border-bottom: 0.5vw solid #3399ff;
      margin-top: 2vw;
      width: 29vw;
    }
  }
}
</style>
