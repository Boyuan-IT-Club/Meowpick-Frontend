<template>
    <view class="background">
        <view class="top-bar">
            <view class="tap-bar">
                <view class="search">
                    <text class="content" @click="goToSearch">搜索</text>
                    <image class="chosen-search" src="../../images/chosen_line.png" />
                </view>
                <view class="my-comment" @click="goToMyComments">我的吐槽</view>
            </view>
        </view>
        <view class="ellipse" />
        <view class="brand-title"><text class="brand-en">ECNU</text><text class="brand-cn">选课猫</text></view>
        <image :src="Logo" class="logo" mode="widthFix" />
        <view class="search-table">
            <image
                    src="../../images/search_table.png"
                    class="search-button"
                    @click="goToSearch"
            />
        </view>
        <view class="toolbox" />
        <ToolBox class="toolbox" />
<!--        <DebugPanel class="debug-panel" />-->
    </view>
</template>

<script setup lang="ts">
import ToolBox from "@/pages/home/ToolBox.vue";
import Logo from "@/images/logo.png";
import DebugPanel from "@/components/DebugPanel.vue";

const goToSearch = () => {
    uni.switchTab({
        url: "/pages/find/index/index"
    });
};
const goToMyComments = () => {
    uni.switchTab({
        url: "/pages/my-comments/my-comments"
    });
};
</script>

<style scoped lang="scss">
.background {
  width: 100vw;
  height: 100vw;
  .top-bar {
    position: fixed;
    top: 0;
    background-color: #b70030;
    width: 100vw;
    height: 25vw;
    z-index: 20;
    .tap-bar {
      display: flex;
      flex-direction: row;
      position: fixed;
      top: 14vw;
      left: 8vw;
      .search {
        color: #ffffff;
        font-size: 4.5vw;
        font-weight: bold;
        letter-spacing: 0.6vw;
        display: flex;
        flex-direction: column;
        .chosen-search {
          width: 6.4vw;
          height: 1vw;
          margin-top: 2vw;
          margin-left: 1vw;
        }
      }
      .my-comment {
        color: #ffffff;
        font-size: 4vw;
        margin-left: 11.2vw;
        letter-spacing: 0.3vw;
        margin-top: 0.3vw;
      }
    }
  }
  .ellipse {
    position: fixed;
    top: 21vw;
    background-color: #b70030;
    width: 100vw;
    height: 8vw;
    border-radius: 50%;
  }
  .logo {
    position: fixed;
    top: 43vw;
    width: 100vw;
    height: auto;
  }
  .brand-title {
    position: fixed;
    top: 33.5vw;
    display: flex;
    align-items: baseline;
    justify-content: center;
    width: 100vw;
    color: #111111;
    font-family: "Yuanti SC", "STYuanti-SC-Regular", "PingFang SC", "Microsoft YaHei", sans-serif;
    font-weight: 400;
    line-height: 1.25;
    text-align: center;
    .brand-en {
      margin-right: 0.4vw;
      font-size: 7vw;
      letter-spacing: 0.8vw;
    }
    .brand-cn {
      font-size: 7vw;
      letter-spacing: 1vw;
    }
  }
  .search-button {
    position: fixed;
    top: 105vw;
    left: 5vw;
    width: 92vw;
    height: 20vw;
  }
  .toolbox {
    margin-top: 125vw;
    position: fixed;
  }
  .mewochat {
    margin-top: 150vw;
  }
}
</style>
