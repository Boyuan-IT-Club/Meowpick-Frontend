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

        <!-- 新增提案 FAB 按钮 -->
        <view class="fab-btn" @click="goToPropose">
            <text class="fab-plus">+</text>
        </view>
    </view>
</template>

<script setup lang="ts">
import ToolBox from "@/pages/home/ToolBox.vue";
import Logo from "@/images/logo.png";
import DebugPanel from "@/components/DebugPanel.vue";
import TopBar from "@/components/top-bar/top-bar.vue";
import { onShow, onPageScroll } from "@dcloudio/uni-app";

onShow(() => {
    uni.hideTabBar();
});

onPageScroll((e) => {
    uni.$emit('pageScroll', e);
});

// 跳转逻辑
const goToSearch = () => {
    uni.navigateTo({
        url: "/pages/find/index/index"
    });
};

const goToPropose = () => {
    uni.navigateTo({
        url: "/pages/proposal/propose"
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

    .fab-btn {
        position: fixed;
        bottom: 25vw;
        right: 5vw;
        width: 15vw;
        height: 15vw;
        background: linear-gradient(135deg, #b70030, #ff4d6a);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(183, 0, 48, 0.3);
        z-index: 100;

        &:active {
            transform: scale(0.95);
        }

        .fab-plus {
            font-size: 8vw;
            line-height: 1;
            color: #ffffff;
        }
    }

}
</style>