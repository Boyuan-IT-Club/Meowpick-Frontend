<template>
  <view class="background">
    <view class="top-bar">
      <view class="go-back" @click="goBack">
        <image src="@/images/go-back.png" class="icon" />
        <view class="txt">{{ proposalData.title || '提案详情' }}</view>
      </view>
    </view>
    <view class="ellipse" />

    <course-header
      :data="courseData"
      :contributor="'喵同学'"
      :statusType="proposalData.status"
      :statusText="statusText"
      :statusDate="statusDate"
      class="information"
    />
    <view class="line" />

    <view class="reject-box" v-if="proposalData.status === 'rejected' && proposalData.rejectReason">
      <view class="reject-title">
        <image class="icon" src="@/images/comment-icon.png" />
        <view class="title">拒绝原因</view>
      </view>
      <view class="reject-content">{{ proposalData.rejectReason }}</view>
    </view>

    <view class="reason-box">
      <view class="reason-title">
        <image class="icon" src="@/images/comment-icon.png" />
        <view class="title">提案理由</view>
      </view>
      <view class="reason-content" v-if="proposalData.content">{{ proposalData.content }}</view>
      <view class="reason-content empty" v-else>暂无提案理由</view>
    </view>

    <view class="bottom-spacer" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from "@dcloudio/uni-app";
import { http } from '@/config';
import CourseHeader from '@/components/course/course-header/index.vue';

const proposalData = ref<any>({});
const proposalId = ref('');

const courseData = computed(() => {
  const course = proposalData.value.course || {};
  return {
    category: course.category || '',
    department: course.department || '',
    teachers: Array.isArray(course.teachers) ? course.teachers : [],
    campuses: Array.isArray(course.campuses) ? course.campuses : [],
    link: null,
    name: course.name || proposalData.value.title || '',
  };
});

const statusText = computed(() => {
  const status = proposalData.value.status;
  return status ? getStatusText(status) : '';
});

const statusDate = computed(() => {
  const status = proposalData.value.status;
  if (!status) return '';
  const dateStr = (status === 'pending' ? proposalData.value.createdAt : proposalData.value.updatedAt) || proposalData.value.date || '';
  return formatDate(dateStr);
});

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  try {
    let normalized = dateString;
    if (!normalized.includes('Z') && !normalized.includes('+') && !normalized.includes('T')) {
      normalized = normalized.replace(' ', 'T') + 'Z';
    } else if (normalized.includes('T') && !normalized.includes('Z') && !normalized.includes('+')) {
      normalized = normalized + 'Z';
    }
    const date = new Date(normalized);
    if (isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
};

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': '待审核',
    'approved': '已通过',
    'rejected': '已拒绝'
  };
  return statusMap[status] || status;
};

const fetchProposalDetail = async () => {
  if (!proposalId.value) return;
  try {
    const res = await http.ProposalController.proposalDetail(proposalId.value, proposalId.value);
    if (res.data?.code === 0) {
      const proposal = res.data.proposal || res.data.data?.proposal;
      if (proposal) {
        proposalData.value = { ...proposal };
      }
    }
  } catch (err) {
    console.error('[API] 获取提案详情失败:', err);
  }
};

onLoad((options: any) => {
  if (options.id) {
    proposalId.value = options.id;
  }
  if (options.data) {
    try {
      const data = JSON.parse(decodeURIComponent(options.data));
      proposalData.value = { ...data };
      if (!proposalId.value && data.id) {
        proposalId.value = data.id;
      }
    } catch (e) {
      console.error("解析提案数据失败", e);
    }
  }
  if (proposalId.value) {
    fetchProposalDetail();
  }
});

const goBack = () => {
  uni.navigateBack();
};
</script>

<style scoped lang="scss">
.background {
  display: flex;
  flex-direction: column;
}
.top-bar {
  position: fixed;
  top: 0;
  background-color: #b70030;
  width: 100vw;
  height: 26vw;
  z-index: 4;
  .go-back {
    position: absolute;
    top: 15vw;
    left: 5vw;
    width: 100vw;
    display: flex;
    flex-direction: row;
    .txt {
      display: flex;
      align-items: center;
      color: #ffffff;
      max-width: 80vw;
      font-size: 4.8vw;
      margin-left: 2vw;
      margin-top: 0.5vw;
      letter-spacing: 0.2vw;
      font-weight: bold;
      white-space: nowrap;
      overflow: scroll;
      text-overflow: ellipsis;
    }
    .icon {
      display: flex;
      align-items: center;
      width: 5vw;
      height: 8.53vw;
    }
  }
}
.ellipse {
  position: fixed;
  top: 22vw;
  background-color: #b70030;
  width: 100vw;
  height: 8vw;
  border-radius: 50%;
  z-index: 2;
}
.information {
  position: relative;
  top: 30vw;
}
.line {
  width: 89vw;
  height: 0.3vw;
  background-color: #e9e9e9;
  margin-top: 35vw;
  margin-left: 5vw;
}
.reject-box {
  margin-top: 5vw;
  margin-left: 5vw;
  width: 89vw;
  background-color: #fff1f0;
  border-radius: 3vw;
  padding: 4vw;

  .reject-title {
    display: flex;
    flex-direction: row;
    align-items: center;
    .icon {
      width: 6vw;
      height: 5vw;
      margin-left: 2vw;
    }
    .title {
      font-size: 4.5vw;
      margin-left: 3vw;
      font-weight: bold;
      letter-spacing: 0.3vw;
      color: #ff4d4f;
    }
  }

  .reject-content {
    margin-top: 3vw;
    margin-left: 5vw;
    font-size: 3.5vw;
    color: #cf1322;
    line-height: 1.6;
  }
}
.reason-box {
  margin-top: 5vw;
  margin-left: 5vw;
  width: 89vw;
  display: flex;
  flex-direction: column;

  .reason-title {
    display: flex;
    flex-direction: row;
    align-items: center;
    .icon {
      width: 8vw;
      height: 7vw;
      margin-left: 32vw;
    }
    .title {
      font-size: 4.5vw;
      margin-left: 3vw;
      font-weight: bold;
      letter-spacing: 0.3vw;
    }
  }

  .reason-content {
    margin-top: 5vw;
    margin-left: 5vw;
    width: 79vw;
    font-size: 3.8vw;
    color: #555;
    line-height: 1.6;
    letter-spacing: 0.2vw;

    &.empty {
      color: #ccc;
      text-align: center;
    }
  }
}
.bottom-spacer {
  height: 10vw;
}
</style>
