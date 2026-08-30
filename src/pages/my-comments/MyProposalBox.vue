<template>
  <view class="my-proposal-box">
    <view class="proposal-box">
      <view class="title">
        <view class="name">{{ props.data.title || '未知课程' }}</view>
        <view class="status-tag" :class="getStatusClass()">{{ getStatusText() }}</view>
      </view>
      <view class="information" v-if="props.data.course">
        <view class="circle" />
        <view class="department">{{ props.data.course.department }}</view>
        <view class="circle" />
        <view class="category">{{ props.data.course.category }}</view>
      </view>
      <view class="campus" v-if="props.data.course?.campuses?.length">
        <view class="circle" />
        <view class="campus-text">{{ props.data.course.campuses.join('、') }}</view>
      </view>
      <view class="teachers" v-if="props.data.course?.teachers?.length">
        <view class="circle" />
        <view class="teacher-list">
          <view v-for="teacher of props.data.course.teachers" :key="typeof teacher === 'string' ? teacher : teacher.name" class="instructor">
            {{ typeof teacher === 'string' ? teacher : `${teacher.name || ''}${teacher.title || ''}` }}
          </view>
        </view>
      </view>
      <view class="time">{{ formatTime(props.data.createdAt) }}</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { DtoProposalVO } from "@/api/data-contracts";

type Props = {
  data: DtoProposalVO;
};
const props = defineProps<Props>();

function getStatusClass(): string {
  return props.data.deleted ? 'deleted' : props.data.status || '';
}

function getStatusText(): string {
  if (props.data.deleted) return '已删除';
  const statusMap: Record<string, string> = {
    'pending': '待审核',
    'approved': '已通过',
    'rejected': '已下架'
  };
  return statusMap[props.data.status || ''] || props.data.status || '';
}

function formatTime(timeStamp?: string): string {
  if (!timeStamp) return '';
  try {
    let normalized = timeStamp;
    if (!normalized.includes('Z') && !normalized.includes('+') && !normalized.includes('T')) {
      normalized = normalized.replace(' ', 'T') + 'Z';
    } else if (normalized.includes('T') && !normalized.includes('Z') && !normalized.includes('+')) {
      normalized = normalized + 'Z';
    }
    const date = new Date(normalized);
    if (isNaN(date.getTime())) return timeStamp;
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  } catch {
    return timeStamp;
  }
}
</script>

<style scoped lang="scss">
.my-proposal-box {
  background-color: #b70030;
  width: 89vw;
  height: auto;
  margin-top: 5vw;
  border-radius: 3vw;

  .proposal-box {
    background-color: #ffffff;
    display: flex;
    flex-direction: column;
    width: 87vw;
    height: auto;
    margin-left: 1vw;
    border-radius: 3vw;
    box-shadow: 1px 1px 5px 0px #0000001f;

    .title {
      display: flex;
      flex-direction: row;
      align-items: center;

      .name {
        margin-left: 4vw;
        margin-top: 4vw;
        font-size: 4vw;
        font-weight: bold;
      }

      .status-tag {
        margin-left: 2.5vw;
        margin-top: 4vw;
        font-size: 2.8vw;
        padding: 0.5vw 2vw;
        border-radius: 2vw;

        &.pending {
          background-color: #fff7e6;
          color: #fa8c16;
        }

        &.approved {
          background-color: #f6ffed;
          color: #52c41a;
        }

        &.rejected {
          background-color: #fff1f0;
          color: #ff4d4f;
        }

        &.deleted {
          background-color: #f5f5f5;
          color: #8c8c8c;
        }
      }
    }

    .information {
      display: flex;
      flex-direction: row;
      margin-top: 3vw;

      .circle {
        width: 2vw;
        height: 2vw;
        border-radius: 50%;
        background-color: #b70030;
        margin-left: 4vw;
        margin-top: 1.5vw;
      }

      .department {
        margin-left: 1.5vw;
        font-size: 3.5vw;
      }

      .category {
        margin-left: 1.5vw;
        font-size: 3.5vw;
      }
    }

    .campus {
      display: flex;
      flex-direction: row;
      margin-top: 2vw;

      .circle {
        width: 2vw;
        height: 2vw;
        border-radius: 50%;
        background-color: #b70030;
        margin-left: 4vw;
        margin-top: 1.5vw;
      }

      .campus-text {
        margin-left: 1.5vw;
        font-size: 3.5vw;
      }
    }

    .teachers {
      display: flex;
      flex-direction: row;
      margin-top: 2vw;

      .circle {
        width: 2vw;
        height: 2vw;
        border-radius: 50%;
        background-color: #b70030;
        margin-left: 4vw;
        margin-top: 1.5vw;
        flex-shrink: 0;
      }

      .teacher-list {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        margin-left: 1.5vw;

        .instructor {
          font-size: 3.5vw;
          margin-right: 2vw;
        }
      }
    }

    .time {
      margin-left: 55vw;
      font-size: 3.5vw;
      margin-top: 2vw;
    }
  }
}
</style>
