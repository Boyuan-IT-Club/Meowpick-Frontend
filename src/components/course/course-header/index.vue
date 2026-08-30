<template>
  <view class="msg">
    <view class="type">
      <view class="title">
        <image src="@/images/category-icon.png" class="icon" />
        <text class="tip">课程类别</text>
      </view>
      <text class="content" :class="{ changed: isChanged('category') }">{{ data.category }}</text>
      <text v-if="isChanged('category')" class="content final-value">{{ finalCourse?.category }}</text>
    </view>
    <view class="department">
      <view class="title">
        <image src="@/images/depart-icon.png" class="icon" />
        <text class="tip">开课院系</text>
      </view>
      <text class="content" :class="{ changed: isChanged('department') }">{{ data.department }}</text>
      <text v-if="isChanged('department')" class="content final-value">{{ finalCourse?.department }}</text>
    </view>
    <view class="teacher">
      <view class="title">
        <image src="@/images/teacher-icon.png" class="icon" />
        <text class="tip">任课教师</text>
      </view>
      <view class="teachers">
        <view
          v-for="(teacher, index) in data.teachers || []"
          :key="teacherKey(teacher, index)"
          class="content"
          :class="{ changed: isChanged('teachers') }"
        >
          {{ teacherText(teacher) }}
        </view>
        <template v-if="isChanged('teachers')">
          <view
            v-for="(teacher, index) in finalCourse?.teachers || []"
            :key="`final-${teacherKey(teacher, index)}`"
            class="content final-value"
          >
            {{ teacherText(teacher) }}
          </view>
        </template>
      </view>
    </view>
    <view class="campus">
      <view class="title">
        <image src="@/images/campus-icon.png" class="icon" />
        <text class="tip">开设校区</text>
      </view>
      <view class="campus-list">
        <view class="content" :class="{ changed: isChanged('campuses') }">{{ campusesText(data.campuses) }}</view>
        <view v-if="isChanged('campuses')" class="content final-value">{{ campusesText(finalCourse?.campuses) }}</view>
      </view>
    </view>
    <view class="link">
      <view class="title">
        <view class="title-left">
          <image src="@/images/link-icon.png" class="icon" />
          <view v-if="statusType" class="status-badge" :class="statusType">
            <text class="status-text">{{ statusText }}</text>
          </view>
          <text v-if="statusType && statusDate" class="status-date">{{ statusDate }}</text>
          <text v-if="!statusType" class="tip">{{ linkTitle || '相关课程' }}</text>
        </view>
        <text class="contributor">贡献者：{{ contributor || '/' }}</text>
      </view>
      <view
        v-for="(item, index) of limitedList(data.link)"
        :key="index"
        class="class-link"
        @click="jump(item[0])"
      >
        <view class="content">{{ item[1] }}</view>
      </view>
    </view>
  </view>
</template>
<script setup lang="ts">
import type { DtoCourseVO } from "@/api/data-contracts";

type Props = {
  data: DtoCourseVO;
  contributor?: string;
  linkTitle?: string;
  statusType?: 'pending' | 'approved' | 'rejected';
  statusText?: string;
  statusDate?: string;
  finalCourse?: {
    category?: string;
    department?: string;
    teachers?: Array<{ name?: string; title?: string } | string>;
    campuses?: string[];
  };
};
const props = defineProps<Props>();

const teacherText = (teacher: { name?: string; title?: string } | string) => {
  if (typeof teacher === "string") return teacher;
  return [teacher.name, teacher.title].filter(Boolean).join("");
};

const teacherKey = (teacher: { name?: string; title?: string } | string, index: number) => (
  `${teacherText(teacher)}-${index}`
);

const teachersText = (teachers?: Array<{ name?: string; title?: string } | string>) => (teachers || [])
  .map(teacherText)
  .filter(Boolean)
  .join("、");

const campusesText = (campuses?: string[]) => (campuses || []).join("、");

const isChanged = (field: "category" | "department" | "teachers" | "campuses") => {
  if (!props.finalCourse) return false;
  if (field === "teachers") {
    return teachersText(props.data.teachers) !== teachersText(props.finalCourse.teachers);
  }
  if (field === "campuses") {
    return campusesText(props.data.campuses) !== campusesText(props.finalCourse.campuses);
  }
  return props.data[field] !== props.finalCourse[field];
};

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
const limitedList = (link: string[][] | null) => {
  return (link || []).slice(0, 2);
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
    .final-value {
      display: block;
      margin-top: 1vw;
      color: #b70030;
    }
    .changed {
      color: #888;
      text-decoration: line-through;
      text-decoration-color: #b70030;
      text-decoration-thickness: 2rpx;
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
    .final-value {
      display: block;
      margin-top: 1vw;
      color: #b70030;
    }
    .changed {
      color: #888;
      text-decoration: line-through;
      text-decoration-color: #b70030;
      text-decoration-thickness: 2rpx;
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
    .final-value {
      display: block;
      margin-top: 1vw;
      color: #b70030;
    }
    .changed {
      color: #888;
      text-decoration: line-through;
      text-decoration-color: #b70030;
      text-decoration-thickness: 2rpx;
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
    .campus-list {
      margin-top: 3vw;
      margin-left: 10vw;
      display: flex;
      flex-direction: column;
      gap: 1.5vw;

      .content {
        font-weight: bold;
        font-size: 3.8vw;
      }
      .final-value {
        display: block;
        margin-top: 1vw;
        color: #b70030;
      }
      .changed {
        color: #888;
        text-decoration: line-through;
        text-decoration-color: #b70030;
        text-decoration-thickness: 2rpx;
      }
    }
  }
  .link {
    display: flex;
    flex-direction: column;
    margin-top: 5vw;
    grid-column-start: 1;
    grid-column-end: 3;
    .title {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      .title-left {
        display: flex;
        flex-direction: row;
        align-items: center;
      }
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
      .status-badge {
        margin-left: 4vw;
        padding: 0.5vw 2vw;
        border-radius: 2vw;

        .status-text {
          font-size: 3.2vw;
        }
        &.pending {
          background-color: #fff7e6;
          .status-text { color: #fa8c16; }
        }
        &.approved {
          background-color: #f6ffed;
          .status-text { color: #52c41a; }
        }
        &.rejected {
          background-color: #fff1f0;
          .status-text { color: #ff4d4f; }
        }
      }
      .status-date {
        font-size: 3.2vw;
        color: #999;
        margin-left: 2vw;
      }
      .contributor {
        font-size: 3.2vw;
        color: #999;
        margin-right: 2vw;
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

  .type .content,
  .department .content,
  .teacher .content,
  .campus .campus-list .content {
    width: 23vw;
    box-sizing: border-box;
    line-height: 1.35;
    word-break: break-all;
  }
}
</style>
