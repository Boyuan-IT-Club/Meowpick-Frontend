<template>
  <view class="background">
    <view class="top-bar">
      <view class="go-back" @click="goBack">
        <image src="@/images/go-back.png" class="icon" />
        <view class="title-names">
          <view class="txt original-title" :class="{ changed: hasCourseNameChanged }">{{ originalTitle }}</view>
          <view v-if="hasCourseNameChanged" class="txt final-title">{{ finalCourse.name }}</view>
        </view>
      </view>
    </view>
    <view class="ellipse" />

    <course-header
      :data="courseData"
      :contributor="contributor"
      :statusType="proposalData.status"
      :statusText="statusText"
      :statusDate="statusDate"
      :finalCourse="hasFinalCourse ? finalCourse : undefined"
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

    <button v-if="isAdmin && finalCourse.id" class="go-course-btn" @click="goToFinalCourse">
      前往课程详情
    </button>

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
const isAdmin = ref(false);
const contributor = ref('/');

const originalCourse = computed(() => proposalData.value.course || {});
const finalCourse = computed(() => proposalData.value.finalCourse || proposalData.value.final_course || {});
const hasFinalCourse = computed(() => proposalData.value.status === 'approved' && Boolean(finalCourse.value?.id || finalCourse.value?.name));
const originalTitle = computed(() => originalCourse.value.name || proposalData.value.title || '提案详情');
const hasCourseNameChanged = computed(() => Boolean(
  hasFinalCourse.value
    && finalCourse.value.name
    && finalCourse.value.name !== originalTitle.value
));

const courseData = computed(() => ({
  category: originalCourse.value.category || '',
  department: originalCourse.value.department || '',
  teachers: Array.isArray(originalCourse.value.teachers) ? originalCourse.value.teachers : [],
  campuses: Array.isArray(originalCourse.value.campuses) ? originalCourse.value.campuses : [],
  link: null,
  name: originalCourse.value.name || proposalData.value.title || ''
}));

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

const fetchContributor = async (proposal: any) => {
  contributor.value = '/';
  if (proposal?.showUsername !== true || !proposal?.userId) return;

  try {
    const res = await http.UserController.userUsernameDetail(String(proposal.userId));
    if (res.data?.code === 0) {
      const responseData: any = res.data.data || res.data;
      contributor.value = String(responseData?.username || '').trim() || '默认用户';
    }
  } catch (err) {
    console.error('[API] 获取贡献者昵称失败:', err);
  }
};

const fetchProposalDetail = async () => {
  if (!proposalId.value) return;
  try {
    const res = await http.ProposalController.proposalDetail(proposalId.value);
    if (res.data?.code === 0) {
      const responseData: any = res.data;
      const proposal = responseData.proposal || responseData.data?.proposal;
      if (proposal) {
        proposalData.value = {
          ...proposal,
          finalCourse: proposal.finalCourse || proposal.final_course
        };
        await fetchContributor(proposalData.value);
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
      if (!proposalId.value) {
        fetchContributor(proposalData.value);
      }
    } catch (e) {
      console.error("解析提案数据失败", e);
    }
  }
  if (proposalId.value) {
    fetchProposalDetail();
  }
  http.AuthController.authIsAdminList().then((res) => {
    if (res.data?.code === 0) {
      const result = res.data.data || res.data;
      isAdmin.value = result?.isAdmin ?? false;
    }
  }).catch(() => {
    isAdmin.value = false;
  });
});

const goToFinalCourse = () => {
  if (!finalCourse.value?.id) return;
  uni.navigateTo({ url: `/pages/course/index/index?id=${finalCourse.value.id}` });
};

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
    .title-names {
      display: flex;
      flex-direction: row;
      align-items: center;
      max-width: 73vw;
      margin-left: 2vw;
      white-space: nowrap;

      .txt {
        // Override the global .go-back .txt { width: 100vw }, otherwise the
        // original name consumes a full row and pushes the final name away.
        width: auto;
        margin-left: 0;
        max-width: 35vw;
        overflow: hidden;
        text-overflow: ellipsis;
        flex: 0 1 auto;
      }
      .original-title.changed {
        color: #ffd6df;
        text-decoration: line-through;
        text-decoration-color: #ffffff;
        text-decoration-thickness: 2rpx;
      }
      .final-title {
        margin-top: 0;
        margin-left: 2vw;
        color: #ffffff;
      }
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
.go-course-btn {
  width: 84vw;
  margin: 7vw auto 2vw;
  border-radius: 5vw;
  background: #b70030;
  color: #fff;
  font-size: 3.8vw;
}
</style>
