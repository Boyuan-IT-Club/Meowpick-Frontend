<script setup lang="ts">
import { Init } from "@/utils/init";

onLaunch(() => {
  Init()
});
onShow(() => {});
onHide(() => {});
</script>
<style lang="scss">
@import "nutui-uniapp/styles/index";

page {
  width: 100%;
  height: 100%;
}

view {
  box-sizing: border-box;
}

input {
  box-sizing: border-box;
}

:root {
  --bg-primary: #f7f8fa;
  --bg-secondary: #ffffff;
  --bg-tertiary: #f0f0f0;
  --text-primary: #1f1f1f;
  --text-secondary: #666666;
  --text-muted: #999999;
  --border-color: #f0f0f0;
  --card-bg: #ffffff;
  --shadow-color: rgba(0, 0, 0, 0.06);
}

.dark-mode {
  --bg-primary: #1a1a1a;
  --bg-secondary: #2a2a2a;
  --bg-tertiary: #333333;
  --text-primary: #f0f0f0;
  --text-secondary: #aaaaaa;
  --text-muted: #666666;
  --border-color: #333333;
  --card-bg: #222222;
  --shadow-color: rgba(0, 0, 0, 0.4);
}

image {
  filter: brightness(0.9) saturate(0.9);
}

.dark-mode image {
  filter: brightness(0.6) saturate(1.3) contrast(1.1);
}
</style>
