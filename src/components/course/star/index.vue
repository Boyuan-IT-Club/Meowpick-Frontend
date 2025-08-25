<script setup lang="ts">
import type { Score } from "@/api/data-contracts";

const props = defineProps<{
  score: Score;
}>();
</script>
<template>
  <div class="star-box">
    <div class="star">
      <div class="number">{{ parseFloat(score.score!.toFixed(1)) }}</div>
      <div class="rate">
        <nut-rate
          v-model="score.avg"
          size="10px"
          spacing="0"
          active-color="orange"
          allow-half
          readonly
        />
      </div>
    </div>
    <div class="rank">
      <div v-for="i in 5" class="star-item">
        <div>
          <icon-star :star="6 - i" />
        </div>
        <div>
          <star-progress :percent="score.percent![6 - i]" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss" src="./style.scss" />
