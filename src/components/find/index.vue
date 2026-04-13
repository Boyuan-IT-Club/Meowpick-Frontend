<template>
  <view class="wrapper">
    <view class="input-box">
      <image class="go-back" src="@/images/go-back2.png" @click="GoBack" />
      <input
        v-model="searchText"
        class="search-text"
        :placeholder="placeHolder"
        @input="handleInput"
        :style="{ color: searchText ? '#000000' : '#777777' }"
      />

      <image
        class="icon"
        src="@/images/search-icon.png"
        @click="jump2List(searchText, 'course')"
      />
    </view>
    <scroll v-if="isVisible && searchText" class="search-list" @bottom="bottom">
      <ul>
        <li
          v-for="item in suggestList"
          :key="item.id"
          class="search-item"
          @click="
            jump2List(
              item.data?.name ? item.data?.name : item.data,
              item['type']
            )
          "
        >
          <view class="content">
            <view :class="`type-${item['type']}`">{{
              SearchTypeMap(item["type"])
            }}</view>
            <view v-if="item.data?.name" class="name">{{
              item.data?.name
            }}</view>
            <view v-else class="name">{{ item.data }}</view>
          </view>
          <view class="line" />
        </li>
      </ul>
    </scroll>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useInput, useSuggest, SearchTypeMap } from "./index";
import { PubSub } from "@/config";

const props = defineProps<{
  keyword?: string;
}>();
const emit = defineEmits<{
  onKeydown: [string];
}>();

const { searchText, placeHolder } = useInput();
const { keyword, page, suggestList } = useSuggest();

const isVisible = ref(false);

function handleInput() {
  isVisible.value = true;
  keyword.value = searchText.value;
}

watch(searchText, (newVal) => {
  keyword.value = newVal;
  if (!newVal) isVisible.value = false;
});

PubSub.subscribe("commit_input", (value) => {
  searchText.value = value || "";
});

PubSub.subscribe("get_recent", () => {
  isVisible.value = true;
});

const GoBack = () => {
  uni.navigateBack({ delta: 1 });
};

const bottom = () => {
  page.value++;
};

const jump2List = (kw: string, type: string) => {
  if (!kw) return;
  if (type === "teacher") {
    uni.navigateTo({
      url: `/pages/find/choose/teacher?keyword=${kw}`
    });
  } else {
    uni.navigateTo({
      url: `/pages/find/choose/index?keyword=${kw}&type=${type}`
    });
  }
};
</script>

<style scoped lang="scss">
.wrapper {
  position: relative;
  z-index: 100;
}
.input-box {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 89.33vw;
  height: 13.86vw;
  border: 0.45vw solid #e61e1e;
  background: white;
  border-radius: 6vw;
  padding: 0 4vw;
  .go-back {
    width: 2.6vw;
    height: 4vw;
  }
  .search-text {
    flex: 1;
    font-size: 3.4vw;
    color: #777777;
    margin-left: 2vw;
  }
  .icon {
    width: 6vw;
    height: 5.3vw;
  }
}
.search-list {
  position: absolute;
  top: 15vw;
  left: 0;
  background-color: #ffffff;
  width: 100vw;
  max-height: 80vh;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  z-index: 99;
  .search-item {
    padding: 0 5vw;
    .content {
      padding: 4vw 0;
      display: flex;
      flex-direction: row;
      align-items: center;
      .type-course { background-color: #ffe4d5; padding: 1vw 2vw; border-radius: 4vw; font-size: 3.3vw; }
      .type-teacher { background-color: #fff6d5; padding: 1vw 2vw; border-radius: 4vw; font-size: 3.3vw; }
      .type-department { background-color: #d5eeff; padding: 1vw 2vw; border-radius: 4vw; font-size: 3.3vw; }
      .type-category { background-color: #e5ffd5; padding: 1vw 2vw; border-radius: 4vw; font-size: 3.3vw; }
      .name { margin-left: 3vw; font-size: 3.7vw; }
    }
    .line { height: 1rpx; background-color: #ebebeb; }
  }
}
</style>
