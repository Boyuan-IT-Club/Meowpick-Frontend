<template>
  <view class="comment-publish-container" :class="themeStore.themeClass">
    <!-- 导航栏 -->
    <view class="nav-bar" :style="navBarStyle">
      <view class="nav-content" :style="navContentStyle">
        <view class="nav-left" :style="navLeftStyle">
          <BackBtn />
        </view>
        <view class="nav-title-container">
          <text class="nav-title">发表吐槽</text>
        </view>
      </view>
    </view>

    <!-- 内容区域 -->
    <view class="content-body" :style="{ paddingTop: (NAVBAR_HEIGHT + 8) + 'px' }">
      <!-- 标签选择 -->
      <view class="section-card" :class="{ 'disabled': isClicked }">
        <view class="section-header">
          <text class="title">选择标签</text>
          <text class="subtitle">最多选4个</text>
        </view>
        <view class="tags-grid">
          <view
            v-for="(item, index) in TotalTags"
            :key="index"
            class="tag-item"
            :class="{ 'active': item.isSelected }"
            @click="toggleTag(item)"
          >
            <image :src="item.icon" class="tag-icon" mode="aspectFit" />
            <text class="tag-text">{{ item.text }}</text>
          </view>
        </view>
      </view>

      <!-- 吐槽输入 -->
      <view class="section-card" :class="{ 'disabled': isClicked }">
        <view class="section-header">
          <text class="title">吐槽内容</text>
        </view>
        <view class="input-box">
          <textarea
            v-model="text"
            class="comment-input"
            placeholder="请输入您的吐槽内容 (200字以内)..."
            maxlength="200"
            :disabled="isClicked"
          />
          <view class="word-count">{{ text.length }}/200</view>
        </view>
      </view>

      <!-- 发布按钮 -->
      <button class="publish-btn" @click="commit" :disabled="isClicked">发布</button>
    </view>

    <!-- 发布中遮罩 -->
    <view v-if="isClicked" class="loading-overlay">
      <view class="loading-spinner"></view>
      <text class="loading-text">发布中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/config';
const themeStore = useThemeStore();
import { ref, onMounted, computed } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import BackBtn from "@/components/common/BackBtn.vue";
import { Tags, TotalTags, InitTags } from "@/utils/tags";
import { http } from "@/config/index";
import { TOAST_DURATION_MS } from "@/utils/constants";

// 胶囊按钮信息
const sysInfo = uni.getSystemInfoSync();
let menuButtonTop = sysInfo.statusBarHeight ? sysInfo.statusBarHeight + 4 : 48;
let menuButtonHeight = 32;
try {
  const rect = uni.getMenuButtonBoundingClientRect();
  if (rect && rect.top) {
    menuButtonTop = rect.top;
    menuButtonHeight = rect.height;
  }
} catch (e) {}

// 导航栏高度 = 胶囊底部 + 间距
const NAVBAR_HEIGHT = menuButtonTop + menuButtonHeight + 12;

const navBarStyle = computed(() => ({
  height: NAVBAR_HEIGHT + 'px',
  paddingTop: menuButtonTop + 'px',
  paddingLeft: '32rpx',
  paddingRight: '32rpx',
  boxSizing: 'border-box'
}));

const navContentStyle = computed(() => ({
  height: menuButtonHeight + 'px',
  display: 'flex',
  alignItems: 'center',
  width: '100%'
}));

const navLeftStyle = computed(() => ({
  height: menuButtonHeight + 'px',
  width: menuButtonHeight + 'px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}));

const text = ref('');
const isClicked = ref(false);
const SelectedTags = ref<Tags[]>([]);
let course_id = '';

onLoad((options: any) => {
  if (options.id) {
    course_id = options.id;
  }
  if (options.data) {
    try {
      const data = JSON.parse(decodeURIComponent(options.data));
      course_id = data.id;
    } catch (e) {
      console.error('[comment] parse data error:', e);
    }
  }
});

onMounted(() => {
  InitTags();
});

const toggleTag = (tag: Tags) => {
  if (tag.isSelected) {
    tag.isSelected = false;
    SelectedTags.value = SelectedTags.value.filter(t => t.text !== tag.text);
  } else {
    if (SelectedTags.value.length >= 4) {
      uni.showToast({ title: "最多选择4个标签", icon: "none" });
      return;
    }
    tag.isSelected = true;
    SelectedTags.value.push(tag);
  }
};

const commit = async () => {
  if (isClicked.value) return;

  if (!text.value.trim() && SelectedTags.value.length === 0) {
    uni.showToast({ title: "请选择标签或填写内容", icon: "none" });
    return;
  }

  isClicked.value = true;
  try {
    const tagTexts = SelectedTags.value.map(t => t.text);
    await http.CommentController.commentAddCreate({
      courseId: course_id,
      content: text.value,
      tags: tagTexts
    });

    uni.showToast({ title: "发布成功", icon: "success" });
    setTimeout(() => {
      uni.navigateBack();
    }, TOAST_DURATION_MS);
  } catch (e) {
    console.error('[course/comment] publish error:', e);
    uni.showToast({ title: "发布失败", icon: "none" });
    isClicked.value = false;
  }
};
</script>

<style scoped lang="scss">
.comment-publish-container {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  background-color: #f7f8fa;
}

.nav-content {
  height: 100%;
  display: flex;
  align-items: center;
  width: 100%;
}

.nav-left {
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-title-container {
  margin-left: 32rpx;
  display: flex;
  align-items: center;

  .nav-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }
}

.content-body {
  padding: 32rpx;
}

.section-card {
  background: var(--bg-card);
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.03);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;

  .title {
    font-size: 30rpx;
    font-weight: 600;
    color: #333;
  }

  .subtitle {
    font-size: 24rpx;
    color: #999;
  }
}

.tags-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.tag-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 140rpx;
  height: 140rpx;
  background: #fafafa;
  border-radius: 16rpx;
  border: 2rpx solid transparent;
  transition: all 0.12s;

  .tag-icon {
    width: 64rpx;
    height: 64rpx;
    margin-bottom: 12rpx;
  }

  .tag-text {
    font-size: 24rpx;
    color: #666;
  }

  &.active {
    background: #fff0f5;
    border-color: #ffb6c1;

    .tag-text {
      color: #d32f2f;
      font-weight: 500;
    }
  }
}

.input-box {
  position: relative;
  background: #fafafa;
  border-radius: 16rpx;
  padding: 20rpx;
}

.comment-input {
  width: 100%;
  height: 240rpx;
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
}

.word-count {
  text-align: right;
  font-size: 22rpx;
  color: #ccc;
  margin-top: 10rpx;
}

.publish-btn {
  margin-top: 20rpx;
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  border-radius: 45rpx;
  background: linear-gradient(135deg, #b20035, #ff4d6a);
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  box-shadow: 0 8rpx 24rpx rgba(183, 0, 48, 0.25);

  &:active {
    transform: scale(0.96);
  }

  &[disabled] {
    background: #ccc;
    color: #fff;
    box-shadow: none;
  }
}

.disabled {
  pointer-events: none;
  opacity: 0.6;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 999;

  .loading-spinner {
    width: 80rpx;
    height: 80rpx;
    border: 6rpx solid rgba(255, 255, 255, 0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-bottom: 24rpx;
  }

  .loading-text {
    color: #fff;
    font-size: 30rpx;
    font-weight: 500;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
