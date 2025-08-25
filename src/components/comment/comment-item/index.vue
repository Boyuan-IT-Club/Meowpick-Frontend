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
        <div class="avatar">
          <image :src="data.user?.avatar" />
        </div>
        <div class="name">
          {{ data.user?.name }}
        </div>
      </div>
      <div class="time">
        {{ caculateTimeago(data.crateAt) }}
      </div>
    </div>
    <div class="text">
      {{ data.text }}
    </div>
    <div class="operations">
      <div class="actions">
        <div
          class="item like"
          :class="{ active: data.relation?.like }"
          @click="like"
        >
          <span>{{ data.relation?.like_cnt }}</span>
          <div class="icon">❤</div>
        </div>
      </div>
      <div />
    </div>
  </div>
</template>

<style scoped lang="scss" src="./style.scss" />
