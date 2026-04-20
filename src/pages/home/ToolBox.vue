<template>
  <view class="tool-box">
    <view class="to-users">
      <view class="letter-container" @click="goToLetter">
        <image
          src="../../images/to-users.png"
          class="picture"
        />
        <view v-if="showNewIcon" class="new-badge">NEW</view>
      </view>
      <image
        src="../../images/update-log.png"
        class="picture"
        @click="goToUpdate"
      />
    </view>
    <view class="total-comments">
      <view class="box">
        <view class="title">已收录吐槽总数</view>
        <view class="number">{{ totalComment }}</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { http } from '@/config';

const showPanel1 = ref(false);
const showPanel2 = ref(false);
const totalComment = ref(0);
const showNewIcon = ref(true);

onShow(() => {
  http.CommentController.searchTotalList().then((res) => {
    totalComment.value = res.data.data.count;
  });
  
  // 检查用户是否已经查看过信件
  const hasReadLetter = uni.getStorageSync('hasReadLetter');
  showNewIcon.value = !hasReadLetter;
});

const goToLetter = () => {
  uni.navigateTo({
    url: "/pages/home/letter"
  });
  
  // 设置用户已查看信件的状态
  uni.setStorageSync('hasReadLetter', true);
  showNewIcon.value = false;
};

const goToUpdate = () => {
  uni.navigateTo({
    url: "/pages/home/update-log"
  });
};
</script>

<style scoped lang="scss">
.tool-box {
  display: flex;
  flex-direction: row;
  .to-users {
    display: flex;
    flex-direction: column;
    margin-left: 5vw;
    .letter-container {
      position: relative;
      width: 48vw;
      height: 18vw;
      .picture {
        width: 48vw;
        height: 18vw;
      }
      .new-badge {
        position: absolute;
        top: -1vw;
        right: -1vw;
        background-color: #ff0000;
        color: #ffffff;
        font-size: 3vw;
        font-weight: bold;
        padding: 1vw 2vw;
        border-radius: 3vw;
        z-index: 10;
      }
    }
    .picture {
      width: 48vw;
      height: 18vw;
    }
  }
  .total-comments {
    margin-top: 2.5vw;
    margin-left: 2.5vw;
    .box {
      display: flex;
      flex-direction: column;
      background-color: #ffffff;
      box-shadow: 2px 2px 16px 0px #0000001f;
      width: 36.5vw;
      height: 30vw;
      border-radius: 5vw;
      .title {
        display: flex;
        justify-content: center;
        margin-top: 7vw;
        font-weight: 550;
        letter-spacing: 0.1vw;
        font-size: 4vw;
      }
      .number {
        display: flex;
        justify-content: center;
        margin-top: 3vw;
        background: linear-gradient(102.91deg, #f77125 7.67%, #ce1717 112.84%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-size: 5.86vw;
        font-weight: bold;
      }
    }
  }
}
</style>