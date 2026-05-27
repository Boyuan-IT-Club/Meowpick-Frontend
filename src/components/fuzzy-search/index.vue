<template>
  <view class="fuzzy-search">
    <view class="input-wrapper">
      <input
        type="text"
        class="search-input"
        :placeholder="placeholder"
        v-model="localKeyword"
        @input="handleInput"
        @focus="handleFocus"
        @click="handleClick"
      />
      <image
        src="/static/images/arrow-down.png"
        class="arrow-icon"
        :class="{ 'rotate': isVisible }"
        @click="togglePanel"
      />
    </view>
    
    <!-- 模糊搜索结果面板 -->
    <view v-if="isVisible && filteredOptions.length > 0" class="suggestions-panel">
      <view
        v-for="(option, index) in filteredOptions"
        :key="index"
        class="suggestion-item"
        @click="handleSelect(option)"
      >
        {{ option }}
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useFuzzySearch } from './index';

// 组件属性
const props = defineProps<{
  modelValue: string;
  options: string[];
  placeholder?: string;
}>();

// 组件事件
const emit = defineEmits<{
  'update:modelValue': [value: string];
  'select': [value: string];
}>();

// 使用模糊搜索逻辑
const { keyword, filteredOptions, isVisible, toggleVisible, hide, updateOptions } = useFuzzySearch(props.options);

// 本地关键词状态，用于处理输入延迟等情况
const localKeyword = ref(props.modelValue);

// 监听属性变化
watch(() => props.modelValue, (newValue) => {
  localKeyword.value = newValue;
  keyword.value = newValue;
});

watch(() => props.options, (newOptions) => {
  updateOptions(newOptions);
}, { deep: true });

// 处理输入事件
const handleInput = () => {
  keyword.value = localKeyword.value;
  emit('update:modelValue', localKeyword.value);
};

// 处理焦点事件
const handleFocus = () => {
  if (localKeyword.value) {
    toggleVisible();
  }
};

// 处理点击事件
const handleClick = () => {
  toggleVisible();
};

// 切换面板显示/隐藏
const togglePanel = () => {
  toggleVisible();
};

// 处理选项选择
const handleSelect = (option: string) => {
  localKeyword.value = option;
  keyword.value = option;
  emit('update:modelValue', option);
  emit('select', option);
  hide();
};
</script>

<style scoped lang="scss">
.fuzzy-search {
  position: relative;
  width: 100%;
}

.input-wrapper {
  position: relative;
  width: 100%;
}

.search-input {
  width: 100%;
  height: 10vw;
  border: 1px solid var(--border-color);
  border-radius: 2vw;
  padding: 0 10vw 0 3vw;
  box-sizing: border-box;
  font-size: 3.5vw;
  outline: none;
}

.arrow-icon {
  position: absolute;
  right: 3vw;
  top: 50%;
  transform: translateY(-50%);
  width: 4vw;
  height: 4vw;
  transition: transform 0.12s ease;
}

.arrow-icon.rotate {
  transform: translateY(-50%) rotate(180deg);
}

.suggestions-panel {
  position: absolute;
  top: 11vw;
  left: 0;
  width: 100%;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 2vw;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
  padding: 2vw 0;
  max-height: 50vw;
  overflow-y: auto;
}

.suggestion-item {
  padding: 2vw 3vw;
  font-size: 3.5vw;
  cursor: pointer;
  transition: background-color 0.1s ease;

  &:hover {
    background-color: var(--bg-page);
  }
}
</style>
