import { ref } from "vue";
import EasyCat from "@/images/cat-emoji/cat_face.png";
import HardcoreCat from "@/images/cat-emoji/hardcore-cat.png";
import TerribleCat from "@/images/cat-emoji/weary_cat.png";
import NiceCat from "@/images/cat-emoji/heart-eyes-cat.png";
import SeriousCat from "@/images/cat-emoji/pouting_cat.png";
import HumorCat from "@/images/cat-emoji/cat_with_tears_of_joy.png";       
import BoringCat from "@/images/cat-emoji/crying_cat.png";

export type Tags = {
  text: string;
  icon: string;
  isSelected: boolean;
};

export const TotalTags = ref<Tags[]>([
  { text: "容易", icon: EasyCat, isSelected: false },
  { text: "硬核", icon: HardcoreCat, isSelected: false },
  { text: "避雷", icon: TerribleCat, isSelected: false },
  { text: "推荐", icon: NiceCat, isSelected: false },
  { text: "严谨", icon: SeriousCat, isSelected: false },
  { text: "枯燥", icon: BoringCat, isSelected: false },
  { text: "幽默", icon: HumorCat, isSelected: false },
  { text: "好评", icon: NiceCat, isSelected: false }
]);
export function InitTags() {
  TotalTags.value.forEach((tag) => {
    tag.isSelected = false;
  });
}

// 同义词映射：当 mock 数据使用了不同写法时，可以映射到标准标签
const synonyms: Record<string, string> = {
  easy: "容易",
  recommend: "推荐",
  recommended: "推荐",
  hard: "硬核",
  hardcore: "硬核",
  boring: "枯燥",
  funny: "幽默",
  humor: "幽默",
  avoid: "避雷",
  "bad": "避雷",
  "good": "好评",
  "great": "好评",
  "strict": "严谨"
};

export function Emoji(text: string) {
  if (!text) return "";
  const normalized = String(text).trim();
  // 首先精确匹配
  for (const tag of TotalTags.value) {
    if (tag.text === normalized) {
      return tag.icon;
    }
  }

  // 再尝试大小写/半角转换匹配（英文或小写）
  const lower = normalized.toLowerCase();
  if (synonyms[lower]) {
    const mapped = synonyms[lower];
    const found = TotalTags.value.find((t) => t.text === mapped);
    if (found) return found.icon;
  }

  // 再尝试按子串匹配（中文/英文混杂场景）
  for (const tag of TotalTags.value) {
    if (normalized.includes(tag.text) || tag.text.includes(normalized)) {
      return tag.icon;
    }
  }

  // 最后再尝试把英文词（如 hard-core）拆分并映射
  const words = normalized.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]+/g, " ").split(" ").filter(Boolean);
  for (const w of words) {
    const lw = w.toLowerCase();
    if (synonyms[lw]) {
      const mapped = synonyms[lw];
      const found = TotalTags.value.find((t) => t.text === mapped);
      if (found) return found.icon;
    }
  }

  // 默认回退成一个通用表情，保证总有图
  return EasyCat;
}

const allowedTags = TotalTags.value.map((tag) => tag.text);
export const limitedTags = (tags: string[]) => {
  // 保留原来的限制逻辑，但对不认识的标签也返回（最多4个）
  if (!tags) return [];
  return tags.slice(0, 4);
};

export function getTop3List(tags: Record<string, number>) {
  const tagsArray = Object.entries(tags).map(([tag, count]) => ({
    tag,
    count
  }));
  tagsArray.sort((a, b) => b.count - a.count);
  // 不再强制过滤到 allowedTags，使得 mock 数据中任意标签都能显示；
  // 前端展示由 Emoji() 做兜底映射
  return tagsArray.slice(0, 3);
}
