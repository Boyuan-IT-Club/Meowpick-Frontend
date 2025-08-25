<template>
  <view class="wrapper">
    <view class="input-box">
      <image class="go-back" src="@/images/go-back2.png" @click="GoBack" />
      <input
        v-model="searchText"
        class="search-text"
        :placeholder="placeHolder"
        @input="handleInput()"
        :style="{ color: searchText ? '#000000' : '#777777' }"
      />

      <image
        class="icon"
        src="@/images/search-icon.png"
        @click="jump2List(keyword, 'course')"
      />
    </view>
    <scroll v-if="isVisible && searchText" class="search-list" @bottom="bottom">
      <ul>
        <li
          v-for="item in suggestList"
          :key="item.data?.id"
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
import { useInput, useChoose, SearchTypeMap } from "./index";
import { useRoute } from "vue-router";

const props = defineProps<{
  keyword: string;
}>();
const emit = defineEmits<{
  onKeydown: string;
}>();

const { searchText, placeHolder, list, searchHistory, text } = useInput();
const { keyword, type, rows, page, jump, suggestList } = useChoose();

const isVisible = ref(false);
function handleInput() {
  if (suggestList.value.length > 0) {
    isVisible.value = true;
  }
}
const route = useRoute();
watch(route, () => {
  isVisible.value = false;
});
function notify() {
  emit("onKeydown", searchText.value);
}

function suggest() {
  keyword.value = searchText.value;
}
watch([searchText], () => {
  keyword.value = searchText.value;
});

PubSub.subscribe("commit_input", (value) => {
  searchText.value = value || "";
});
PubSub.subscribe("get_recent", () => {
  isVisible.value = true;
});

onLoad((options: any) => {
  keyword.value = options.keyword || "";
  PubSub.publish("commit_input", options.keyword);
});

const GoBack = () => {
  uni.navigateTo({
    url: "/pages/home/home"
  });
};

const bottom = () => {
  page.value++;
};

const jump2List = (keyword: string, type: string) => {
  if (type === "teacher") {
    uni.navigateTo({
      url: `/pages/find/choose/teacher?keyword=${keyword}`
    });
  } else {
    uni.navigateTo({
      url: `/pages/find/choose/index?keyword=${keyword}`
    });
  }
};
</script>

<style scoped lang="scss">
.input-box {
  display: flex;
  flex-direction: row;
  width: 89.33vw;
  height: 13.86vw;
  border: 0.45vw solid #e61e1e;
  z-index: 100;
  //border-image-source: linear-gradient(95.1deg, #e61e1e -3.97%, #ee9563 86.14%);
  //border-image-slice: 1;
  border-radius: 6vw;
  padding: 4vw;
  .go-back {
    width: 2.6vw;
    height: 4vw;
    margin-top: 0.5vw;
  }
  .search-text {
    font-size: 3.4vw;
    width: 70vw;
    color: #777777;
    letter-spacing: 0.1vw;
    margin-left: 2vw;
  }
  .icon {
    width: 6vw;
    height: 5.3vw;
    margin-left: 10vw;
  }
}
.search-list {
  position: absolute;
  background-color: #ffffff;
  width: 100vw;
  height: 216vw;
  z-index: 99;
  .search-item {
    display: flex;
    flex-direction: column;
    .content {
      margin-top: 5vw;
      display: flex;
      flex-direction: row;
      .type-course {
        background-color: #ffe4d5;
        padding: 1vw 2vw 1vw 2vw;
        border-radius: 4vw;
        font-size: 3.3vw;
        .txt {
          font-size: 3.3vw;
        }
      }
      .type-teacher {
        background-color: #fff6d5;
        padding: 1vw 2vw 1vw 2vw;
        border-radius: 4vw;
        font-size: 3.3vw;
        .txt {
          font-size: 3.3vw;
        }
      }
      .type-depart {
        background-color: #d5eeff;
        padding: 1vw 2vw 1vw 2vw;
        border-radius: 4vw;
        font-size: 3.3vw;
        .txt {
          font-size: 3.3vw;
        }
      }
      .type-category {
        background-color: #e5ffd5;
        padding: 1vw 2vw 1vw 2vw;
        border-radius: 4vw;
        font-size: 3.3vw;
        .txt {
          font-size: 3.3vw;
        }
      }
      .name {
        margin-left: 5vw;
        margin-top: 1vw;
        font-size: 3.7vw;
      }
    }
    .line {
      width: 89vw;
      height: 0.2vw;
      background-color: #ebebeb;
      margin-top: 3vw;
    }
  }
}
</style>
