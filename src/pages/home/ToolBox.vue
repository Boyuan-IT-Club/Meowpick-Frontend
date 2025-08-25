<template>
  <view class="tool-box">
    <view class="to-users">
      <image
        src="../../images/to-users.png"
        class="picture"
        @click="goToLetter"
      />
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
  <view class="to-chat">
    <view class="cat-box">
      <view class="info">
        <view class="cat-title">MewoChat 小程序</view>
        <view class="cat-tool">
          <view class="go-app" @click="goToMewoChat">进入程序</view>
          <view class="introduction" @click="getInstruction">查看介绍</view>
        </view>
      </view>
      <image src="@/images/mewochat-icon.jpg" class="mewo-chat" />
    </view>
  </view>
</template>

<script setup lang="ts">
const showPanel1 = ref(false);
const showPanel2 = ref(false);
const totalComment = ref(0);
onShow(() => {
  http.SearchController.total().then((res) => {
    totalComment.value = res.data.payload;
  });
});

const goToMewoChat = () => {
  uni.navigateToMiniProgram({
    appId: "wxd7e995c7b9d793b8"
  });
};

const goToLetter = () => {
  uni.navigateTo({
    url: "/pages/home/letter"
  });
};
const goToUpdate = () => {
  uni.navigateTo({
    url: "/pages/home/update-log"
  });
};

const getInstruction = () => {
  const Url = "https://mp.weixin.qq.com/s/HCwy-C7lFVyOBf5qUOhtSA";
  uni.navigateTo({
    url: `/pages/web-frame/web-frame?url=${Url}`
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
.to-chat {
  margin-left: 6.5vw;
  margin-top: 2vw;
  .cat-box {
    width: 85vw;
    height: 24.53vw;
    background-color: #ffffff;
    box-shadow: 2px 2px 16px 0px #0000001f;
    border-radius: 5vw;
    display: flex;
    flex-direction: row;
    .info {
      display: flex;
      flex-direction: column;
      .cat-title {
        margin-left: 4vw;
        margin-top: 4vw;
        font-weight: 550;
        font-size: 4vw;
      }
      .cat-tool {
        display: flex;
        flex-direction: row;
        margin-top: 3vw;
        .go-app {
          margin-left: 3vw;
          color: #175aaa;
          background-color: #6aaeff99;
          border-radius: 2vw;
          font-size: 3.46vw;
          padding: 1.5vw;
        }
        .introduction {
          margin-left: 3vw;
          color: #165fb6;
          background: #6aaeff3d;
          border-radius: 2vw;
          font-size: 3.46vw;
          padding: 1.5vw;
        }
      }
    }
    .mewo-chat {
      width: 22vw;
      height: 22vw;
      margin-left: 18vw;
      margin-top: 1vw;
    }
  }
}
.shadow {
  position: fixed;
  top: 0;
  left: 0;
  background-color: #22222244;
  width: 100vw;
  height: 200vw;
  z-index: 98;
  .panel {
    position: fixed;
    background-color: #ffffff;
    width: 85vw;
    height: 150vw;
    z-index: 99;
    top: 40vw;
    left: 7.5vw;
    border-radius: 3vw;
    box-shadow: 2px 2px 16px 0px #0000001f;
    .title {
      font-weight: bold;
    }
  }
}
</style>
