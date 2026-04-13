<script setup lang="ts">
import type { CommentVO } from "@/api/data-contracts";
import { caculateTimeago } from "./index";

type Props = {
  data: CommentVO;
};
const props = defineProps<Props>();

const emit = defineEmits<{
  like: (id: string) => void;
}>();

function like() {
  emit("like", props.data.id);
}
</script>
<template>
  <div class="index">
    <div class="header">
      <div class="user">
        <!-- 如果没有头像和用户名，这里可以根据实际后端返回的数据调整 -->
        <div class="name">
          {{ data.name || '匿名用户' }}
        </div>
      </div>
      <div class="time">
        {{ caculateTimeago(data.createdAt) }}
      </div>
    </div>
    <div class="text">
      {{ data.content }}
    </div>
    <div class="operations">
      <div class="actions">
        <div
          class="item like"
          :class="{ active: data.like }"
          @click="like"
        >
          <span>{{ data.likeCnt }}</span>
          <div class="icon">❤</div>
        </div>
      </div>
      <div />
    </div>
  </div>
</template>

<style scoped lang="scss" src="./style.scss" />
