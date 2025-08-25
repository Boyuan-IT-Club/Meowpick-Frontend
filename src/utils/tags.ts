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
  { text: "严格", icon: SeriousCat, isSelected: false },
  { text: "快跑", icon: TerribleCat, isSelected: false },
  { text: "幽默", icon: HumorCat, isSelected: false },
  { text: "枯燥", icon: BoringCat, isSelected: false }
]);
export function InitTags() {
  TotalTags.value.forEach((tag) => {
    tag.isSelected = false;
  });
}

export function Emoji(text: string) {
  const emojiUrl = ref("");
  for (const tag of TotalTags.value) {
    if (tag.text === text) {
      emojiUrl.value = tag.icon;
    }
  }
  return emojiUrl.value;
}

const allowedTags = TotalTags.value.map((tag) => tag.text);
export const limitedTags = (tags: string[]) => {
  return tags.filter((item) => allowedTags.includes(item)).slice(0, 4);
};

export function getTop3List(tags: Record<string, number>) {
  const tagsArray = Object.entries(tags).map(([tag, count]) => ({
    tag,
    count
  }));
  tagsArray.sort((a, b) => b.count - a.count);
  return tagsArray.filter((item) => allowedTags.includes(item.tag)).slice(0, 3);
}
