<template>
  <view class="fuzzy-search">
    <view class="input-wrapper">
      <template v-if="props.multiple">
        <!-- 多选模式：显示标签样式 -->
        <view class="tags-container">
          <view 
            v-for="(tag, index) in localKeyword.value.split(', ').filter(v => v)" 
            :key="index"
            class="tag"
            :class="{ 'existing-tag': props.options.includes(tag) }"
          >
            {{ tag }}
            <view class="tag-remove" @click.stop="removeTag(tag)">×</view>
          </view>
          <input
            type="text"
            class="tag-input"
            :placeholder="localKeyword.value ? '' : placeholder"
            v-model="tagInput"
            @input="handleTagInput"
            @focus="handleFocus"
            @click="handleClick"
            @keydown.enter.prevent="addTag"
          />
        </view>
      </template>
      <template v-else>
        <!-- 单选模式：显示普通输入框 -->
        <input
          type="text"
          class="search-input"
          :class="{ 'no-arrow': !props.showArrow, 'existing-tag': isExistingTag }"
          :placeholder="placeholder"
          v-model="localKeyword"
          @input="handleInput"
          @focus="handleFocus"
          @click="handleClick"
        />
      </template>
      <image
        v-if="props.showArrow"
        src="../../images/arrow-down.png"
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
        :class="{ 'existing-tag': true }"
        @click="handleSelect(option)"
      >
        <template v-if="props.multiple">
          <view class="checkbox" :class="{ 'checked': selectedValues.includes(option) }"></view>
        </template>
        {{ option }}
      </view>
      <!-- 新增按钮 -->
      <view class="add-button" @click="handleAddNew">
        <text class="add-icon">+</text>
        <text>新增：{{ localKeyword }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useFuzzySearch } from './index';

// 组件属性
const props = withDefaults(defineProps<{
  modelValue: string;
  options: string[];
  placeholder?: string;
  multiple?: boolean;
  showArrow?: boolean; // 控制是否显示展开按钮
}>(), {
  showArrow: true
});

// 组件事件
const emit = defineEmits<{
  'update:modelValue': [value: string];
  'select': [value: string];
  'update:multipleValues'?: [values: string[]];
}>();

// 使用模糊搜索逻辑
const { keyword, filteredOptions, isVisible, toggleVisible, hide, updateOptions } = useFuzzySearch(props.options);

// 本地关键词状态，用于处理输入延迟等情况
const localKeyword = ref(props.modelValue);

// 标签输入状态（用于多选模式）
const tagInput = ref('');

// 监听localKeyword变化，更新tagInput
watch(() => localKeyword.value, (newValue) => {
  // 只有在单选模式下更新tagInput
  if (!props.multiple) {
    tagInput.value = newValue;
  }
});

// 多选值存储
const selectedValues = ref<string[]>(props.modelValue ? props.modelValue.split(', ').filter(v => v) : []);

// 判断当前值是否为已有标签
const isExistingTag = computed(() => {
  return props.options.includes(localKeyword.value);
});

// 监听属性变化
watch(() => props.modelValue, (newValue) => {
  localKeyword.value = newValue;
  keyword.value = newValue;
  if (props.multiple) {
    selectedValues.value = newValue ? newValue.split(', ').filter(v => v) : [];
  }
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
  if (props.multiple) {
    // 多选逻辑
    const tags = localKeyword.value.split(', ').filter(v => v);
    if (!tags.includes(option)) {
      tags.push(option);
      localKeyword.value = tags.join(', ');
      selectedValues.value = tags;
      emit('update:modelValue', localKeyword.value);
      emit('update:multipleValues', selectedValues.value);
      emit('select', option);
      tagInput.value = '';
      keyword.value = '';
    }
  } else {
    // 单选逻辑
    localKeyword.value = option;
    keyword.value = option;
    emit('update:modelValue', option);
    emit('select', option);
    hide();
  }
};

// 处理新增按钮点击
const handleAddNew = () => {
  if (keyword.value.trim()) {
    // 直接使用搜索值作为新标签
    const newTag = keyword.value.trim();
    if (props.multiple) {
      // 多选逻辑
      const tags = localKeyword.value.split(', ').filter(v => v);
      if (!tags.includes(newTag)) {
        tags.push(newTag);
        localKeyword.value = tags.join(', ');
        selectedValues.value = tags;
        emit('update:modelValue', localKeyword.value);
        emit('update:multipleValues', selectedValues.value);
        emit('select', newTag);
        tagInput.value = '';
        keyword.value = '';
      }
    } else {
      // 单选逻辑 - 新增的标签即使与选项重名也显示默认背景
      localKeyword.value = newTag;
      keyword.value = newTag;
      emit('update:modelValue', newTag);
      emit('select', newTag);
    }
    hide();
  }
};

// 处理标签输入事件
const handleTagInput = () => {
  keyword.value = tagInput.value;
};

// 移除标签
const removeTag = (tag: string) => {
  const tags = localKeyword.value.split(', ').filter(v => v && v !== tag);
  localKeyword.value = tags.join(', ');
  selectedValues.value = tags;
  emit('update:modelValue', localKeyword.value);
  emit('update:multipleValues', selectedValues.value);
};

// 添加标签
const addTag = () => {
  if (tagInput.value.trim()) {
    const newTag = tagInput.value.trim();
    const tags = localKeyword.value.split(', ').filter(v => v);
    if (!tags.includes(newTag)) {
      tags.push(newTag);
      localKeyword.value = tags.join(', ');
      selectedValues.value = tags;
      emit('update:modelValue', localKeyword.value);
      emit('update:multipleValues', selectedValues.value);
      emit('select', newTag);
    }
    tagInput.value = '';
    keyword.value = '';
  }
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
  border: 1px solid #e5e5e5;
  border-radius: 2vw;
  padding: 0 10vw 0 3vw;
  box-sizing: border-box;
  font-size: 3.5vw;
  outline: none;
  background-color: #ffffff;
  color: #333333;
}

.search-input::placeholder {
  color: #999999;
}

.search-input.no-arrow {
  padding-right: 3vw;
}

.search-input.existing-tag {
  background-color: #ffe6e6;
  border: 1px solid #ffcccc;
}

/* 新增的标签即使与选项重名也显示默认背景 */
.search-input.newly-added {
  background-color: #ffffff;
  border: 1px solid #e5e5e5;
}

.arrow-icon {
  position: absolute;
  right: 3vw;
  top: 50%;
  transform: translateY(-50%);
  width: 4vw;
  height: 4vw;
  transition: transform 0.3s ease;
  z-index: 5;
}

.arrow-icon.rotate {
  transform: translateY(-50%) rotate(180deg);
}

/* 确保箭头图标在标签容器中正确显示 */
.tags-container {
  position: relative;
  padding-right: 8vw; /* 为箭头图标留出空间 */
}

.tags-container + .arrow-icon {
  top: 3vw;
}

.suggestions-panel {
  position: absolute;
  top: 11vw;
  left: 0;
  width: 100%;
  background-color: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 2vw;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 20;
  padding: 2vw 0;
  max-height: 50vw;
  overflow-y: auto;
}

.suggestion-item {
  padding: 2vw 3vw;
  font-size: 3.5vw;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;

  &:hover {
    background-color: #f5f5f5;
  }
  
  .checkbox {
    width: 4vw;
    height: 4vw;
    border: 1px solid #ccc;
    border-radius: 0.5vw;
    margin-right: 2vw;
    position: relative;
    
    &.checked::after {
      content: '';
      position: absolute;
      width: 2vw;
      height: 4vw;
      top: -1vw;
      left: 1vw;
      border: solid #b70030;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
  }
}

.add-button {
  margin-top: 2vw;
  padding: 2vw 3vw;
  font-size: 3.5vw;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  border-top: 1px solid #e5e5e5;
  
  &:hover {
    background-color: #f5f5f5;
  }
  
  .add-icon {
    width: 4vw;
    height: 4vw;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #b70030;
    color: white;
    border-radius: 50%;
    margin-right: 2vw;
    font-size: 3vw;
  }
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 1vw 2vw;
  border-radius: 2vw;
  font-size: 3vw;
  background-color: #f0f0f0;
}

.tag.existing-tag {
  background-color: #b70030;
  color: white;
}

/* 新增标签默认背景色 */
.tag:not(.existing-tag) {
  background-color: #f0f0f0;
}

.tag-remove {
  margin-left: 1vw;
  cursor: pointer;
  font-size: 4vw;
  line-height: 1;
}

.tag-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 3.5vw;
  padding: 1vw 0;
  min-width: 20vw;
}

/* 为多选模式的标签容器添加边框 */
.tags-container {
  border: 1px solid #e5e5e5;
}
</style>
