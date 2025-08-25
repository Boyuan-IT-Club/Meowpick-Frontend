<template>
  <view class="top-bar">
    <view class="go-back" @click="goBack">
      <image src="@/images/go-back.png" class="icon" />
      <view class="txt">{{ course.data.name }}</view>
    </view>
  </view>
  <view class="ellipse" />
  <view class="title">
    <image src="@/images/comment-icon.png" class="icon" />
    <text class="tip">课程吐槽</text>
  </view>
  <view class="add-tag">
    <view class="tag-title">
      <image src="@/images/addTag-icon.png" class="icon" />
      <text class="tip">添加标签</text>
    </view>
    <view class="tag-box-chosen">
      <view class="chosen-title">
        <image src="@/images/chosen-icon.png" class="icon" />
        <text class="tip">已选择</text>
      </view>
      <view class="selected-box">
        <view
          v-for="item of SelectedTags"
          class="tag-item"
          @click="RemoveTags(item.text)"
        >
          <image :src="item.icon" class="emoji" />
          <text class="tag-txt">{{ item.text }}</text>
        </view>
      </view>
    </view>
    <view class="tag-box">
      <view class="box-title">
        <image src="@/images/choose-icon.png" class="icon" />
        <text class="tip">可选择</text>
      </view>
      <view class="chosen-box">
        <view
          v-for="item of TotalTags"
          class="tag-item"
          :style="{ backgroundColor: item.isSelected ? '#D3D3D3' : '#f1f1f1' }"
          @click="AddTags(item.text)"
        >
          <image :src="item.icon" class="emoji" />
          <text class="tag-txt">{{ item.text }}</text>
        </view>
      </view>
    </view>
  </view>
  <view class="add-comment">
    <view class="comment-title">
      <image src="@/images/addTag-icon.png" class="icon" />
      <text class="tip">添加吐槽</text>
    </view>
    <view class="comment-box">
      <textarea
        v-model="text"
        placeholder="请客观评价，不得发表涉及广告、时政、色情、辱骂、违法犯罪、欺诈等违规内容"
        class="content-text"
      />
    </view>
  </view>
  <view class="comment-button" @click="commit" :disabled="isClicked">
    <text class="content">吐槽</text>
  </view>
</template>
<script setup lang="ts">
import { useCourse } from "@/pages/course/index/index";
import { Tags, TotalTags, InitTags } from "@/utils/tags";
import { Ref } from "vue";

type Props = {};
const props = defineProps<Props>();

let course_id = "";
const { fetch, id, course, teachers, trends } = useCourse();
const text = ref("");
const tags = ref<string[]>([]);
const SelectedTags = ref<Tags[]>([]);
const isClicked = ref(false);
onLoad((options: any) => {
  course_id = options.id;
});
onShow(() => {
  fetch(course_id);
});
onMounted(() => {
  InitTags();
});
const goBack = () => {
  uni.navigateBack({
    delta: 1
  });
};
function AddTags(text: string) {
  for (const tag of TotalTags.value) {
    if (tag.text === text && !tag.isSelected && SelectedTags.value.length < 4) {
      tag.isSelected = true;
      SelectedTags.value.push(tag);
      tags.value.push(tag.text);
      break;
    }
    if (SelectedTags.value.length === 4) {
      uni.showToast({
        title: "最多添加4个",
        icon: "none"
      });
    }
  }
  // for (const tag of tags) {
  //     if (tag.text === text && tag.isSelected) {
  //         tag.isSelected = false;
  //         SelectedTags.value = SelectedTags.value.filter((selectedTag) => selectedTag.text !== text);
  //         break;
  //     }
  // }
}
function RemoveTags(text: string) {
  for (const tag of SelectedTags.value) {
    if (tag.text === text && tag.isSelected) {
      tag.isSelected = false;
      SelectedTags.value = SelectedTags.value.filter(
        (selectedTag) => selectedTag.text !== text
      );
      tags.value = tags.value.filter((tag) => tag !== text);
      break;
    }
  }
}

const commit = async () => {
  if (isClicked.value) return;
  if (!text.value) {
    uni.showToast({
      title: "未填写吐槽",
      duration: 2000,
      icon: "none"
    });
    return;
  }

  isClicked.value = true;
  try {
    console.log(id.value, {
      text: text.value,
      tags: tags.value
    });

    const res = await http.CommentController.add({
      target: id.value,
      text: text.value,
      tags: tags.value
    });

    uni.navigateBack({
      delta: 1
    });
  } catch (error) {
    console.error(error);
    isClicked.value = false;
  }
};
</script>

<style scoped lang="scss">
.ellipse {
  position: absolute;
  top: 22vw;
  background-color: #b70030;
  width: 100vw;
  height: 8vw;
  border-radius: 50%;
}
.title {
  position: absolute;
  top: 35vw;
  left: 30vw;
  font-size: 5.86vw;
  display: flex;
  flex-direction: row;
  .icon {
    width: 8vw;
    height: 7vw;
    margin-top: 1vw;
  }
  .tip {
    font-weight: bold;
    letter-spacing: 0.3vw;
    margin-left: 2vw;
  }
}
.add-tag {
  position: absolute;
  top: 45vw;
  .tag-title {
    margin-top: 8vw;
    margin-left: 5vw;
    display: flex;
    flex-direction: row;
    .icon {
      width: 5.5vw;
      height: 5.5vw;
      margin-top: 0.6vw;
    }
    .tip {
      font-size: 4.8vw;
      font-weight: bold;
      letter-spacing: 0.3vw;
      margin-left: 2vw;
    }
  }
  .tag-box-chosen {
    border: 0.5vw solid;
    //border-image-source: linear-gradient(111.97deg, #de3b3b 43.45%, #ea8120 108.2%);
    //border-image-slice: 1;
    border-color: #de3b3b;
    border-radius: 3.5vw;
    width: 89.33vw;
    height: auto;
    margin-left: 5vw;
    margin-top: 5vw;
    padding-bottom: 4vw;
    .chosen-title {
      font-size: 4.2vw;
      letter-spacing: 0.3vw;
      margin-top: 4vw;
      margin-left: 3vw;
      display: flex;
      flex-direction: row;
      .icon {
        width: 5vw;
        height: 5vw;
      }
      .tip {
        font-size: 4.2vw;
        letter-spacing: 0.3vw;
        margin-left: 2vw;
      }
    }
    .selected-box {
      display: flex;
      flex-wrap: wrap;
      width: 85vw;
      margin-left: 3vw;
      .tag-item {
        background: #f1f1f1;
        display: flex;
        flex-direction: row;
        padding: 1vw;
        border-radius: 2vw;
        width: 18vw;
        margin-left: 2vw;
        margin-top: 2vw;
        .emoji {
          width: 6.4vw;
          height: 6.4vw;
        }
        .tag-txt {
          margin-top: 1vw;
          margin-left: 1vw;
          font-size: 4vw;
          white-space: nowrap;
        }
      }
    }
  }
  .tag-box {
    border-style: dashed; /* 设置边框样式为虚线 */
    border-color: #de3b3b; /* 设置边框颜色 */
    border-width: 2px; /* 设置边框宽度 */
    border-radius: 4vw;
    width: 89.33vw;
    height: auto;
    margin-left: 5vw;
    margin-top: 4vw;
    padding-bottom: 4vw;
    .box-title {
      margin-top: 4vw;
      margin-left: 3vw;
      .icon {
        width: 5vw;
        height: 5vw;
      }
      .tip {
        font-size: 4.2vw;
        letter-spacing: 0.3vw;
        margin-left: 2vw;
      }
    }
    .chosen-box {
      display: flex;
      flex-wrap: wrap;
      width: 85vw;
      margin-left: 3vw;
      .tag-item {
        background: #f1f1f1;
        display: flex;
        flex-direction: row;
        padding: 1vw;
        border-radius: 2vw;
        width: 18vw;
        margin-left: 2vw;
        margin-top: 2vw;
        .emoji {
          width: 6.4vw;
          height: 6.4vw;
        }
        .tag-txt {
          margin-top: 1vw;
          margin-left: 1vw;
          font-size: 4vw;
          white-space: nowrap;
        }
      }
    }
  }
}
.add-comment {
  position: absolute;
  top: 135vw;

  .comment-title {
    margin-top: 5vw;
    margin-left: 5vw;
    display: flex;
    flex-direction: row;
    .icon {
      width: 5.5vw;
      height: 5.5vw;
      margin-top: 0.6vw;
    }
    .tip {
      font-size: 4.8vw;
      font-weight: bold;
      letter-spacing: 0.3vw;
      margin-left: 2vw;
    }
  }
  .comment-box {
    border: 0.5vw solid;
    border-color: #de3b3b; /* 设置边框颜色 */
    border-width: 2px; /* 设置边框宽度 */
    border-radius: 4vw;
    width: 89.33vw;
    height: 35vw;
    margin-left: 5vw;
    margin-top: 4vw;
    .content-text {
      display: block;
      width: 95%; /* 输入框宽度占满父元素宽度 */
      height: 90%;
      padding: 3vw;
      text-align: left;
      font-size: 4vw;
    }
  }
}
.comment-button {
  position: absolute;
  top: 190vw;
  left: 27vw;
  background-color: #b70030;
  box-shadow: 4px 4px 16px 0px #00000026;
  width: 42.1vw;
  height: 12.26vw;
  border-radius: 3vw;
  display: flex;
  justify-content: center;
  align-items: center;
  .content {
    color: #ffffff;
    font-size: 5vw;
    letter-spacing: 0.3vw;
    font-weight: bold;
  }
}
</style>
