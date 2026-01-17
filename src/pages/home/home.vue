<template>
    <view class="background">
        <!-- 引用封装的顶部导航组件 -->
        <top-bar :selected="0" />
        <image :src="Logo" class="logo" />
        <view class="search-table">
            <image
                src="../../images/search_table.png"
                class="search-button"
                @click="goToSearch"
            />
        </view>
        <ToolBox class="toolbox" />
        <!-- <DebugPanel class="debug-panel" /> -->
    </view>
</template>

<script setup lang="ts">
import ToolBox from "@/pages/home/ToolBox.vue";
import Logo from "@/images/logo.png";
import DebugPanel from "@/components/DebugPanel.vue";
import TopBar from "@/components/top-bar/top-bar.vue";
import { onShow } from "@dcloudio/uni-app";

// 隐藏原生tabBar，避免与自定义导航栏冲突
onShow(() => {
    uni.hideTabBar();
});

// 跳转逻辑
const goToSearch = () => {
    uni.navigateTo({
        url: "/pages/find/index/index"
    });
};
</script>

<style scoped lang="scss">
.background {
    width: 100vw;
    height: 100vh;
    position: relative;

    .logo {
        position: fixed;
        top: 33vw;
        width: 100vw;
        height: 69.87vw;
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