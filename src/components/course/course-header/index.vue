<template>
  <view class="msg">
    <view class="type">
      <view class="title">
        <image src="@/images/category-icon.png" class="icon" />
        <text class="tip">课程类别</text>
      </view>
      <text class="content">{{ data.category }}</text>
    </view>
    <view class="department">
      <view class="title">
        <image src="@/images/depart-icon.png" class="icon" />
        <text class="tip">开课院系</text>
      </view>
      <text class="content">{{ data.department }}</text>
    </view>
    <view class="teacher">
      <view class="title">
        <image src="@/images/teacher-icon.png" class="icon" />
        <text class="tip">任课教师</text>
      </view>
      <view v-for="item of teachers" class="teachers">
        <view class="content">{{ item.name }}</view>
      </view>
    </view>
    <view class="campus">
      <view class="title">
        <image src="@/images/campus-icon.png" class="icon" />
        <text class="tip">开设校区</text>
      </view>
      <text class="content">{{ getCampus(data.campuses) }}</text>
    </view>
    <view class="link">
      <view class="title">
        <image src="@/images/link-icon.png" class="icon" />
        <text class="tip">相关课程</text>
      </view>
      <view
        v-for="item of limitedList(data.link!)"
        class="class-link"
        @click="jump(item[0])"
      >
        <view class="content">{{ item[1] }}</view>
      </view>
    </view>
  </view>
</template>
<script setup lang="ts">
import type { CourseVO, TeacherVO } from "@/api/data-contracts";

type Props = {
  data: CourseVO;
  teachers: TeacherVO[];
};
const props = defineProps<Props>();

const jump = (id: string) => {
  uni.navigateTo({
    url: `/pages/course/index/index?id=${id}`
  });
};

const getCampus = (campuses: string[]) => {
  const hasZhongbei = campuses.includes("中山北路校区");
  const hasMinhang = campuses.includes("闵行校区");

  if (hasZhongbei && hasMinhang) {
    return "中北&闵行";
  } else if (hasZhongbei) {
    return "中北校区";
  } else if (hasMinhang) {
    return "闵行校区";
  } else {
    return "没有找到相关校区";
  }
};
const limitedList = (link: string[][]) => {
  return link.slice(0, 2);
};
</script>

<style scoped lang="scss">
.msg {
  display: grid;
  grid-template-columns: 35vw 35vw;
  grid-template-rows: auto auto;
  margin-left: 12vw;
  margin-top: 10vw;
  grid-gap: 10vw 10vw;
  .type {
    display: flex;
    flex-direction: column;
    .title {
      display: flex;
      flex-direction: row;
      .icon {
        width: 6vw;
        height: 6vw;
      }
      .tip {
        color: #181818;
        font-size: 3.5vw;
        margin-left: 4vw;
      }
    }
    .content {
      font-weight: bold;
      margin-top: 3vw;
      font-size: 3.8vw;
      margin-left: 10vw;
    }
  }
  .department {
    display: flex;
    flex-direction: column;
    .title {
      display: flex;
      flex-direction: row;
      .icon {
        width: 6vw;
        height: 6vw;
      }
      .tip {
        color: #181818;
        font-size: 3.5vw;
        margin-left: 4vw;
      }
    }
    .content {
      font-weight: bold;
      margin-top: 3vw;
      font-size: 3.8vw;
      margin-left: 10vw;
    }
  }
  .teacher {
    display: flex;
    flex-direction: column;
    .title {
      display: flex;
      flex-direction: row;
      .icon {
        width: 6vw;
        height: 6vw;
      }
      .tip {
        color: #181818;
        font-size: 3.5vw;
        margin-left: 4vw;
        margin-top: 0.6vw;
      }
    }
    .content {
      font-weight: bold;
      margin-top: 3vw;
      font-size: 3.8vw;
      width: 18.5vw;
      margin-left: 10vw;
    }
  }
  .campus {
    display: flex;
    flex-direction: column;
    .title {
      display: flex;
      flex-direction: row;
      .icon {
        width: 6vw;
        height: 6vw;
      }
      .tip {
        color: #181818;
        font-size: 3.5vw;
        margin-left: 4vw;
      }
    }
    .content {
      font-weight: bold;
      font-size: 3.8vw;
      margin-top: 3vw;
      margin-left: 10vw;
    }
  }
  .link {
    display: flex;
    flex-direction: column;
    margin-top: 3vw;
    grid-column-start: 1;
    grid-column-end: 3;
    .title {
      display: flex;
      flex-direction: row;
      .icon {
        width: 6vw;
        height: 6vw;
      }
      .tip {
        color: #181818;
        font-size: 3.5vw;
        margin-left: 4vw;
        margin-top: 0.6vw;
      }
    }
    .class-link {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      margin-left: 9vw;
      .content {
        background-color: #e9e9e9;
        margin-top: 1vw;
        border-radius: 2vw;
        padding: 1.5vw;
        font-size: 3.3vw;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}
</style>
