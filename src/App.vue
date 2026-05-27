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

/* ======== 主题变量定义 ======== */
:root {
  /* 1. 背景色 */
  --bg-page: #f7f8fa;          /* 页面底层灰 */
  --bg-card: #ffffff;          /* 卡片纯白 */
  --bg-sub: #f8f9fa;           /* 卡片内次级区块 */
  --bg-blur: rgba(247, 248, 250, 0.85); /* 顶部吸顶栏模糊背景 */

  /* 2. 文本色 */
  --text-title: #1a1a1a;       /* 标题 */
  --text-main: #333333;        /* 正文 */
  --text-sub: #666666;         /* 次要文本/图标 */
  --text-muted: #999999;       /* 弱化文本/时间 */

  /* 3. 边框与阴影 */
  --border-color: #f0f0f0;     /* 浅色边框 */
  --border-color-dashed: rgba(0,0,0,0.05); /* 虚线/弱边框 */
  --shadow-color: rgba(0, 0, 0, 0.05);     /* 卡片常规阴影 */
  --shadow-color-sm: rgba(0, 0, 0, 0.03);  /* 点击状态小阴影 */
  --shadow-color-lg: rgba(0, 0, 0, 0.06);  /* filter bar大阴影 */

  /* 4. 品牌色/强调色 (选课猫红) */
  --brand-primary: #b20035;
  --brand-gradient: linear-gradient(135deg, #b20035, #ff4d6a);
  --brand-shadow: rgba(178, 0, 53, 0.3);

  /* 5. 特殊场景: Proposal(提议) 相关卡片色 */
  --bg-proposal-card: linear-gradient(135deg, #fff5f6 0%, #ffffff 100%);
  --bg-proposal-sub: rgba(255, 255, 255, 0.8);
  --border-proposal: rgba(178, 0, 53, 0.15);
  --border-proposal-sub: rgba(178, 0, 53, 0.08);
  
  --bg-vote-box: linear-gradient(90deg, #fff0f2, #fff5f6);
  --border-vote-box: rgba(178, 0, 53, 0.05);
}

[data-theme="dark"], .dark-theme {
  /* 1. 背景色 */
  --bg-page: #121212;
  --bg-card: #1e1e1e;
  --bg-sub: #2c2c2c;
  --bg-blur: rgba(18, 18, 18, 0.85);

  /* 2. 文本色 */
  --text-title: #e0e0e0;
  --text-main: #cccccc;
  --text-sub: #a0a0a0;
  --text-muted: #666666;

  /* 3. 边框与阴影 */
  --border-color: #333333;
  --border-color-dashed: rgba(255,255,255,0.1);
  --shadow-color: rgba(0, 0, 0, 0.5);
  --shadow-color-sm: rgba(0, 0, 0, 0.3);
  --shadow-color-lg: rgba(0, 0, 0, 0.8);

  /* 4. 品牌色/强调色 (选课猫红) - 保持不变 */
  --brand-primary: #b20035;
  --brand-gradient: linear-gradient(135deg, #b20035, #ff4d6a);
  --brand-shadow: rgba(178, 0, 53, 0.3);

  /* 5. 特殊场景: Proposal(提议) 相关卡片色 */
  --bg-proposal-card: linear-gradient(135deg, #2a161a 0%, #1e1e1e 100%);
  --bg-proposal-sub: rgba(40, 20, 25, 0.8);
  --border-proposal: rgba(178, 0, 53, 0.3);
  --border-proposal-sub: rgba(178, 0, 53, 0.15);
  
  --bg-vote-box: linear-gradient(90deg, #2a161a, #231215);
  --border-vote-box: rgba(178, 0, 53, 0.15);
}
</style>

