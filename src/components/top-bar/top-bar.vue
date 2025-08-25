<template>
  <view class="top-bar">
    <view class="tap-bar">
      <view
        v-for="(item, index) of tabBarList"
        :key="index"
        :class="{ 'tab-bar-item': true, currentTar: selected == item.id }"
        @click="switchTab(item.pagePath)"
      >
        <view
          class="tab_text"
          :style="{
            fontWeight: selected == index ? 'bold' : 'normal',
            fontSize: selected == index ? '4.5vw' : '4vw',
            letterSpacing: selected == index ? '0.6vw' : '0.3vw'
          }"
        >
          <view>{{ item.text }}</view>
        </view>
      </view>
    </view>
    <image
      class="chosen-search"
      src="../../images/chosen_line.png"
      :style="{ marginLeft: selected === 0 ? '9vw' : '34vw' }"
    />
  </view>
  <view class="ellipse" />
</template>

<script setup lang="ts">
const props = defineProps<{
  selected: number;
}>();

const tabBarList = ref([
  {
    id: 0,
    pagePath: "/pages/find/index/index",
    text: "搜索"
  },
  {
    id: 1,
    pagePath: "/pages/my-comments/my-comments",
    text: "我的吐槽"
  }
]);
const switchTab = (page: string) => {
  uni.switchTab({
    url: page
  });
};
</script>

<style scoped lang="scss">
.top-bar {
  position: fixed;
  top: 0;
  background-color: #b70030;
  width: 100vw;
  height: 25vw;
  z-index: 20;
  .tap-bar {
    margin-top: 14vw;
    margin-left: 3vw;
    display: grid;
    width: 50vw;
    grid-template-columns: 20vw 30vw;
    align-items: end;
    .tab-bar-item {
      color: #ffffff;
      font-size: 4vw;
      transition: all 1s ease-in-out;
      margin: auto;
      letter-spacing: 0.5vw;
    }
  }
  .chosen-search {
    position: absolute;
    width: 6.4vw;
    height: 1vw;
    z-index: 99;
    margin-top: 2vw;
    margin-left: 6vw;
    transition: all 0.5s ease-in-out;
  }
}
.ellipse {
  position: fixed;
  top: 21vw;
  background-color: #b70030;
  width: 100vw;
  height: 8vw;
  border-radius: 50%;
  z-index: 10;
}
</style>
