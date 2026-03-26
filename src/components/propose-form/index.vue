<template>
  <view class="form-item">
    <text class="label">{{ label }}</text>
    <template v-if="mode === 'dropdown-multi'">
      <view class="campus-multi-selector">
        <view class="picker" @click="togglePanel">
          <view class="picker-view campus-tags-container">
            <view 
              v-for="(campus, index) in selectedItems" 
              :key="index"
              class="teacher-tag existing-tag"
            >
              {{ campus }}
              <text class="teacher-tag-remove" @click.stop="removeItem(campus)">×</text>
            </view>
            <view v-if="selectedItems.length === 0" class="campus-placeholder">{{ placeholder }}</view>
            <image 
              src="../../images/arrow-down.png" 
              class="arrow-icon" 
              :class="{ 'rotate': isVisible }"
            />
          </view>
        </view>
        <view class="campus-panel" v-if="isVisible">
          <view 
            class="campus-item" 
            v-for="(item, index) in options" 
            :key="index"
            @click="handleSelect(item)"
          >
            <view class="checkbox-container">
              <view class="checkbox" :class="{ 'checked': selectedItems.includes(item) }"></view>
              <text>{{ item }}</text>
            </view>
          </view>
        </view>
      </view>
    </template>
    <template v-else-if="mode === 'multi'">
      <view class="teacher-multi-selector">
        <view class="teacher-tags-container">
          <view 
            v-for="(teacher, index) in displayTags" 
            :key="index"
            :class="['teacher-tag', options.includes(teacher) ? 'existing-tag' : 'new-tag']"
          >
            {{ teacher }}
            <text class="teacher-tag-remove" @click.stop="removeTag(teacher)">×</text>
          </view>
          <input
            type="text"
            class="teacher-input"
            :placeholder="displayTags.length > 0 ? '' : placeholder"
            v-model="inputValue"
            @input="handleInput"
            @focus="handleFocus"
            @blur="handleBlur"
            style="min-width: 35vw;"
          />
          <image 
            src="../../images/arrow-down.png" 
            class="arrow-icon" 
            :class="{ 'rotate': isVisible }"
            @click="togglePanel"
          />
        </view>
        <view class="teacher-panel" v-if="isVisible">
          <view 
            class="teacher-item" 
            v-for="(teacher, index) in filteredOptions" 
            :key="index"
            @click="handleSelect(teacher)"
          >
            {{ teacher }}
          </view>
          <view class="teacher-add-new" @click="addNew">
            <text class="add-icon">+</text>
            <text>新增：{{ inputValue }}</text>
          </view>
        </view>
      </view>
    </template>
    <template v-else>
      <view class="tag-selector">
        <view class="tags-container">
          <view 
            v-for="(tag, index) in displayTags" 
            :key="index"
            :class="['tag', options.includes(tag) ? 'existing-tag' : 'new-tag']"
          >
            {{ tag }}
            <text class="tag-remove" @click.stop="removeTag(tag)">×</text>
          </view>
          <input
            type="text"
            class="tag-input"
            :placeholder="displayTags.length > 0 ? '' : placeholder"
            v-model="inputValue"
            @input="handleInput"
            @focus="handleFocus"
            @blur="handleBlur"
            style="min-width: 35vw;"
          />
          <image 
            src="../../images/arrow-down.png" 
            class="arrow-icon" 
            :class="{ 'rotate': isVisible }"
            @click="togglePanel"
          />
        </view>
        <view class="tag-panel" v-if="isVisible">
          <view 
            class="tag-item" 
            v-for="(item, index) in filteredOptions" 
            :key="index"
            @click="handleSelect(item)"
          >
            {{ item }}
          </view>
          <view class="tag-add-new" @click="addNew">
            <text class="add-icon">+</text>
            <text>新增：{{ inputValue }}</text>
          </view>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const props = withDefaults(defineProps<{
  label: string;
  modelValue: string;
  options: string[];
  placeholder?: string;
  mode?: 'single' | 'multi' | 'dropdown-multi';
}>(), {
  mode: 'single'
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const inputValue = ref('');
const isVisible = ref(false);
const filteredOptions = ref<string[]>([...props.options]);

const displayTags = computed(() => {
  if (props.mode === 'single') {
    return props.modelValue ? [props.modelValue] : [];
  }
  if (props.mode === 'multi') {
    return props.modelValue.split(',').filter(v => v.trim()).map(v => v.trim());
  }
  return [];
});

const selectedItems = computed(() => {
  return props.modelValue.split(',').filter(v => v.trim()).map(v => v.trim());
});

const handleInput = () => {
  if (inputValue.value.trim()) {
    filteredOptions.value = props.options.filter(opt => 
      opt.toLowerCase().includes(inputValue.value.toLowerCase())
    );
  } else {
    filteredOptions.value = [...props.options];
  }
  isVisible.value = true;
};

const handleFocus = () => {
  isVisible.value = true;
};

const handleBlur = () => {
  setTimeout(() => {
    isVisible.value = false;
  }, 200);
};

const togglePanel = () => {
  isVisible.value = !isVisible.value;
};

const handleSelect = (item: string) => {
  if (props.mode === 'single') {
    emit('update:modelValue', item);
    inputValue.value = '';
    filteredOptions.value = [...props.options];
    isVisible.value = false;
  } else if (props.mode === 'multi') {
    const currentItems = props.modelValue.split(',').filter(v => v.trim()).map(v => v.trim());
    if (!currentItems.includes(item)) {
      const newItems = [...currentItems, item];
      emit('update:modelValue', newItems.join(', '));
    }
    inputValue.value = '';
    filteredOptions.value = [...props.options];
    isVisible.value = false;
  } else if (props.mode === 'dropdown-multi') {
    const currentItems = props.modelValue.split(',').filter(v => v.trim()).map(v => v.trim());
    const index = currentItems.indexOf(item);
    if (index > -1) {
      currentItems.splice(index, 1);
    } else {
      currentItems.push(item);
    }
    emit('update:modelValue', currentItems.join(','));
  }
};

const addNew = () => {
  if (inputValue.value.trim()) {
    const newItem = inputValue.value.trim();
    if (props.mode === 'single') {
      emit('update:modelValue', newItem);
    } else if (props.mode === 'multi') {
      const currentItems = props.modelValue.split(',').filter(v => v.trim()).map(v => v.trim());
      if (!currentItems.includes(newItem)) {
        const newItems = [...currentItems, newItem];
        emit('update:modelValue', newItems.join(', '));
      }
    }
    inputValue.value = '';
    filteredOptions.value = [...props.options];
    isVisible.value = false;
  }
};

const removeTag = (tag: string) => {
  if (props.mode === 'single') {
    emit('update:modelValue', '');
  } else if (props.mode === 'multi') {
    const currentItems = props.modelValue.split(',').filter(v => v.trim()).map(v => v.trim());
    const newItems = currentItems.filter(t => t !== tag);
    emit('update:modelValue', newItems.join(', '));
  }
};

const removeItem = (item: string) => {
  const currentItems = props.modelValue.split(',').filter(v => v.trim()).map(v => v.trim());
  const newItems = currentItems.filter(t => t !== item);
  emit('update:modelValue', newItems.join(','));
};

watch(() => props.options, (newOptions) => {
  filteredOptions.value = [...newOptions];
}, { deep: true });
</script>

<style scoped lang="scss">
.form-item {
  display: flex;
  flex-direction: column;
  gap: 1vw;
  height: 100%;

  .label {
    font-size: 3.5vw;
    color: #333333;
    line-height: 1.5;
  }

  .tag-selector,
  .teacher-multi-selector,
  .campus-multi-selector {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  // 教师多选样式
  .teacher-multi-selector {
    position: relative;
    width: 100%;
  }

  .teacher-tags-container {
    position: relative;
    width: 100%;
    min-height: 10vw;
    border: 1px solid #e5e5e5;
    border-radius: 2vw;
    padding: 1vw;
    box-sizing: border-box;
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 1vw;
    background-color: #ffffff;
  }

  .teacher-tags-container .teacher-tag,
  .campus-tags-container .teacher-tag {
    display: inline-flex;
    align-items: center;
    padding: 1vw 2vw;
    border-radius: 2vw;
    font-size: 3vw;
    min-height: 6vw;
    line-height: 1.5;
    white-space: normal;
    max-width: 100%;
    word-wrap: break-word;
  }
  
  .teacher-tag.existing-tag {
    background-color: #b70030;
    color: white;
  }
  
  .teacher-tag.new-tag {
    background-color: #f0f0f0;
    color: #333;
  }
  
  /* 校区标签强制使用红色背景 */
  .campus-tags-container .teacher-tag {
    background-color: #b70030 !important;
    color: white !important;
  }

  .teacher-tag-remove {
    margin-left: 1vw;
    cursor: pointer;
    font-size: 4vw;
    line-height: 1;
  }

  .teacher-input {
    flex: 0 1 auto;
    border: none;
    outline: none;
    font-size: 3.5vw;
    min-width: 35vw;
    height: 6vw;
    box-sizing: border-box;
    line-height: 6vw;
    text-align: left;
    direction: ltr;
    padding: 0.5vw 1vw;
  }
  
  .teacher-input:focus {
    outline: none;
  }
  
  /* 统一输入框样式 */
  .tag-selector {
    position: relative;
    width: 100%;
  }
  
  .tag-selector .arrow-icon,
  .teacher-multi-selector .arrow-icon {
    position: absolute;
    right: 3vw;
    top: 50%;
    transform: translateY(-50%);
    width: 4vw;
    height: 4vw;
    transition: transform 0.3s ease;
    z-index: 1;
  }
  
  .tag-selector .arrow-icon.rotate,
  .teacher-multi-selector .arrow-icon.rotate {
    transform: translateY(-50%) rotate(180deg);
  }
  
  .tags-container {
    position: relative;
    width: 100%;
    min-height: 10vw;
    border: 1px solid #e5e5e5;
    border-radius: 2vw;
    padding: 1vw;
    box-sizing: border-box;
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 1vw;
    background-color: #ffffff;
  }
  
  .tags-container .tag {
    display: inline-flex;
    align-items: center;
    padding: 1vw 2vw;
    border-radius: 2vw;
    font-size: 3vw;
    min-height: 6vw;
    line-height: 1.5;
    white-space: normal;
    max-width: 100%;
    word-wrap: break-word;
  }
  
  .tag.existing-tag {
    background-color: #b70030;
    color: white;
  }
  
  .tag.new-tag {
    background-color: #f0f0f0;
    color: #333;
  }
  
  .tag-remove {
    margin-left: 1vw;
    cursor: pointer;
    font-size: 4vw;
    line-height: 1;
  }
  
  .tag-input {
    flex: 0 1 auto;
    border: none;
    outline: none;
    font-size: 3.5vw;
    min-width: 35vw;
    height: 6vw;
    box-sizing: border-box;
    line-height: 6vw;
    text-align: left;
    direction: ltr;
    padding: 0.5vw 1vw;
  }
  
  .tag-input:focus {
    outline: none;
  }
  
  .tag-panel {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background-color: #fff;
    border: 1px solid #e5e5e5;
    border-radius: 2vw;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    z-index: 10;
    padding: 2vw 0;
    max-height: 50vw;
    overflow-y: auto;
    margin-top: 1vw;
  }
  
  .tag-item {
    padding: 2vw 3vw;
    font-size: 3.5vw;
    cursor: pointer;
    
    &:hover {
      background-color: #f5f5f5;
    }
  }
  
  .tag-add-new {
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

  .teacher-panel {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background-color: #fff;
    border: 1px solid #e5e5e5;
    border-radius: 2vw;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    z-index: 10;
    padding: 2vw 0;
    max-height: 50vw;
    overflow-y: auto;
    margin-top: 1vw;
  }

  .teacher-item {
    padding: 2vw 3vw;
    font-size: 3.5vw;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: #f5f5f5;
    }
  }

  .teacher-add-new {
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

  .campus-multi-selector {
    position: relative;
    width: 100%;
  }

  .picker {
    position: relative;
    width: 100%;
    min-height: 10vw;
    border: 1px solid #e5e5e5;
    border-radius: 2vw;
    padding: 1vw 3vw;
    box-sizing: border-box;
    align-items: center;
    background-color: #ffffff;
  }
  
  .picker-view {
    width: 100%;
    min-height: 8vw;
    display: flex;
    align-items: flex-start;
    font-size: 3.5vw;
    color: #333;
    flex-wrap: wrap;
    gap: 1vw;
  }
  
  .campus-tags-container {
    width: 100%;
    display: flex;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 1vw;
  }
  
  .campus-placeholder {
    color: #999;
  }
  
  .campus-tags-container .teacher-tag {
    margin-right: 1vw;
  }

  .campus-panel {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background-color: #fff;
    border: 1px solid #e5e5e5;
    border-radius: 2vw;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    z-index: 10;
    padding: 2vw 0;
    max-height: 50vw;
    overflow-y: auto;
    margin-top: 1vw;
  }

  .campus-item {
    padding: 2vw 3vw;
    font-size: 3.5vw;
    cursor: pointer;
    
    &:hover {
      background-color: #f5f5f5;
    }
    
    .checkbox-container {
      display: flex;
      align-items: center;
    }
    
    .checkbox {
      width: 4vw;
      height: 4vw;
      border: 1px solid #ccc;
      border-radius: 0.5vw;
      margin-right: 2vw;
      position: relative;
    }
    
    .checkbox.checked::after {
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

  .arrow-icon {
    position: absolute;
    right: 3vw;
    top: 50%;
    transform: translateY(-50%);
    width: 4vw;
    height: 4vw;
    transition: transform 0.3s ease;
  }

  .rotate {
    transform: translateY(-50%) rotate(180deg);
  }
}
</style>