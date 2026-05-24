<template>
  <view class="comment-publish-container">
    <view class="nav-bar" :style="navBarStyle">
      <view class="nav-content" :style="navContentStyle">
        <!-- Left aligned Back Button -->
        <view class="nav-left" :style="navLeftStyle">
            <BackBtn />
        </view>
        <!-- Title following Back Button with specific gap -->
        <view class="nav-title-container">
            <text class="nav-title">发表吐槽</text>
        </view>
      </view>
    </view>

    <!-- Content Area -->
    <view class="content-body" :style="{ paddingTop: (menuButtonInfo.bottom + 12) + 'px' }">
        
        <!-- Section 1: Tags Selection (Emoji Tags) -->
        <view class="section-card">
            <view class="section-header">
                <text class="title">选择标签</text>
                <text class="subtitle">最多选4个</text>
            </view>
            <view class="tags-grid">
                <view 
                    class="tag-item" 
                    v-for="(item, index) in TotalTags" 
                    :key="index"
                    :class="{ 'active': item.isSelected }"
                    @click="toggleTag(item)"
                >
                   <image :src="item.icon" class="tag-icon" mode="aspectFit" />
                   <text class="tag-text">{{ item.text }}</text>
                </view>
            </view>
        </view>

        <!-- Section 2: Comment Input -->
        <view class="section-card">
            <view class="section-header">
                <text class="title">吐槽内容</text>
            </view>
            <view class="input-box">
                <textarea 
                    v-model="text" 
                    class="comment-input"
                    placeholder="请输入您的吐槽内容 (200字以内)..." 
                    maxlength="200"
                />
                <view class="word-count">{{ text.length }}/200</view>
            </view>
        </view>

        <!-- Submit Button -->
        <button class="publish-btn" @click="commit" :disabled="isClicked">发布</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import BackBtn from "@/components/common/BackBtn.vue";
import { useCourse } from "@/pages/course/index/index";
import { Tags, TotalTags, InitTags } from "@/utils/tags";
import { http } from "@/config/index";
import { TOAST_DURATION_MS } from "@/utils/constants";

// Menu Button Info for Custom Navbar
const sysInfo = uni.getSystemInfoSync();
let menuButtonInfo = { 
    width: 87, 
    height: 32, 
    left: sysInfo.windowWidth - 87 - 10, 
    top: sysInfo.statusBarHeight ? sysInfo.statusBarHeight + 4 : 48, 
    bottom: (sysInfo.statusBarHeight ? sysInfo.statusBarHeight + 4 : 48) + 32, 
    right: sysInfo.windowWidth - 10 
};
try {
    const res = uni.getMenuButtonBoundingClientRect();
    if (res && res.width) {
        menuButtonInfo = {
            width: res.width,
            height: res.height,
            left: res.left,
            top: res.top,
            bottom: res.bottom,
            right: res.right
        };
    }
} catch (e) {}

const navBarStyle = computed(() => {
    const headerHeight = menuButtonInfo.bottom + 12;
    return {
        height: headerHeight + 'px',
        paddingTop: menuButtonInfo.top + 'px',
        paddingLeft: '32rpx', // Match search page
        paddingRight: '32rpx',
        boxSizing: 'border-box'
    };
});

const navContentStyle = computed(() => {
    return {
        height: menuButtonInfo.height + 'px',
        display: 'flex',
        alignItems: 'center',
        width: '100%'
    };
});

const navLeftStyle = computed(() => {
    return {
        height: menuButtonInfo.height + 'px',
        width: menuButtonInfo.height + 'px', // Square layout
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // No margin right here, handled by gap or title margin
    };
});

const navMiddleStyle = computed(() => {
    // 标题区域，占据剩余空间，但文字需要居中
    // 如果想要在整个屏幕居中，可能需要 absolute 定位
    // 这里采用 flex 布局，标题靠左跟随返回键，或者绝对定位居中
    // 用户反馈标题偏上，通常是因为 line-height没设置好
    return {
        height: menuButtonInfo.height + 'px',
        display: 'flex',
        alignItems: 'center',
    };
});

// State
let course_id = "";
const { fetch, id } = useCourse();
const text = ref("");
const isClicked = ref(false);
const SelectedTags = ref<Tags[]>([]);

onLoad((options: any) => {
  course_id = options.id;
});

onShow(() => {
  if(course_id) fetch(course_id);
});

onMounted(() => {
  InitTags();
});

// Removed goBack function as it's no longer used in template active areas

const toggleTag = (tag: Tags) => {
    if (tag.isSelected) {
        // Deselect
        tag.isSelected = false;
        SelectedTags.value = SelectedTags.value.filter(t => t.text !== tag.text);
    } else {
        // Select
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
      await http.CommentController.add({
          courseId: course_id || id.value,
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
    background-color: #F5F7FA;
    display: flex;
    flex-direction: column;
}

/* Custom Navigation Bar */
.nav-bar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 100;
    background-color: #F5F7FA;
    /* padding styles handled by inline style */
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

/* Updated Title Container for Left Alignment */
.nav-title-container {
    margin-left: 32rpx; /* Gap = padding-left of navbar */
    display: flex;
    align-items: center;

    .nav-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
    }
}

/* Content Body */
.content-body {
    padding: 30rpx;
    padding-bottom: 60rpx;
}

.section-card {
    background: #fff;
    border-radius: 24rpx;
    padding: 30rpx;
    margin-bottom: 30rpx;
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

/* Tags Grid */
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
    background: #FAFAFA;
    border-radius: 16rpx;
    border: 2rpx solid transparent;
    transition: all 0.3s;
    
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
        background: #FFF0F5; /* Brand Light Pink */
        border-color: #FFB6C1;
        
        .tag-text {
            color: #D32F2F;
            font-weight: 500;
        }
    }
}

/* Comment Input */
.input-box {
    position: relative;
    background: #FAFAFA;
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
    color: #CCCCCC;
    margin-top: 10rpx;
}

/* Publish Button */
.publish-btn {
    margin-top: 20rpx;
    width: 100%;
    height: 90rpx;
    line-height: 90rpx;
    border-radius: 45rpx;
    /* Restore Theme Color Gradient */
    background: linear-gradient(135deg, #b20035, #ff4d6a);
    color: #fff;
    font-size: 32rpx;
    font-weight: bold;
    box-shadow: 0 8rpx 24rpx rgba(183, 0, 48, 0.25);
    
    &:active {
        transform: scale(0.98);
        box-shadow: 0 4rpx 12rpx rgba(183, 0, 48, 0.2);
    }
    
    &[disabled] {
        background: #ccc;
        color: #fff;
        box-shadow: none;
    }
}
</style>
