<script setup lang="ts">
import { computed } from "vue";
import { useRouteStore } from "@/config";

let bottomHeight = computed(() =>
  [
    "",
    "/pages/index/index/index",
    "/pages/group/index/index",
    "/pages/find/index/index",
    "/pages/message/index/index",
    "/pages/user/index/index"
  ].includes(useRouteStore().url.trim())
);

const props = defineProps({
  color: { type: String, default: "#fff" }
});
const emits = defineEmits(["onBottom"]);

function bottom() {
  console.log('[Layout] Forwarding bottom event to Page');
  emits("onBottom");
}
</script>
<template>
  <view
    class="layout-root"
    :style="{
      background: color,
    }"
  >
    <!-- Fixed Layer: Top bars, ellipses, etc. -->
    <view class="fixed-layer">
      <slot name="fixed" />
    </view>

    <!-- Scroll Layer: Absolute filled -->
    <view class="scroll-layer">
      <scroll @bottom="bottom">
        <view class="content-wrapper">
          <slot />
        </view>
      </scroll>
    </view>
  </view>
</template>
<style scoped lang="scss" src="./style.scss" />
