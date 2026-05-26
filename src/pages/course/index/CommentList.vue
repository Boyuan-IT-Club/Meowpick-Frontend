<template>
  <view class="comment" :class="{ 'dark-mode': isDark }">
    <view v-for="item of list" :key="item.id" class="item">
      <CommentBox :data="item" @like="like" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { useCourseComment } from "@/pages/course/index/utils";
import CommentBox from "@/pages/course/index/CommentBox.vue";
import { onUnmounted, computed } from "vue";
import { useThemeStore } from "@/config";
const themeStore = useThemeStore();
const isDark = computed(() => { if (themeStore.theme === 'dark') return true; if (themeStore.theme === 'system') return uni.getSystemInfoSync().theme === 'dark'; return false; });

const props = defineProps<{
  id: string;
}>();
const { list, like, next, fetch, page } = useCourseComment(props);
const subToken = PubSub.subscribe("comment-next", () => {
  next();
});
onUnmounted(() => {
  PubSub.unsubscribe(subToken);
});
</script>

<style scoped lang="scss">
.comment {
  display: flex;
  flex-direction: column;
  .item {
    margin-top: auto;
  }
}
</style>
