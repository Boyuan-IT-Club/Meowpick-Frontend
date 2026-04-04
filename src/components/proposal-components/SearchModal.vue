<template>
  <view class="modal-mask" v-if="visible" @click="handleClose">
    <view class="modal-content" @click.stop>
      <view class="modal-header">
        <view class="modal-title">{{ title }}</view>
        <view class="close-btn" @click="handleClose">×</view>
      </view>
      <view class="search-container">
        <input 
          class="search-input" 
          v-model="searchKeyword" 
          :placeholder="placeholder"
          @input="handleSearch"
        />
        <view class="add-btn" @click="handleAddNew">
          <text class="add-icon">+</text>
          <text class="add-text">新增</text>
        </view>
      </view>
      <scroll-view class="search-results" scroll-y>
        <view 
          class="result-item" 
          v-for="(item, index) in searchResults" 
          :key="index"
          @click="handleSelect(item)"
        >
          {{ item }}
        </view>
        <view class="no-result" v-if="searchResults.length === 0 && searchKeyword">
          未找到匹配项，请点击"新增"按钮添加
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';

interface Props {
  visible: boolean;
  title: string;
  placeholder: string;
  dataSource: string[];
  multiple?: boolean;
  selectedItems?: string[];
}

export default defineComponent({
  name: 'SearchModal',
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    placeholder: {
      type: String,
      required: true
    },
    dataSource: {
      type: Array as () => string[],
      required: true
    },
    multiple: {
      type: Boolean,
      default: false
    },
    selectedItems: {
      type: Array as () => string[],
      default: () => []
    }
  },
  emits: ['update:visible', 'select', 'close'],
  setup(props, { emit }) {
    const searchKeyword = ref('');
    const searchResults = ref<string[]>([]);

    watch(() => props.visible, (newVal) => {
      if (newVal) {
        searchKeyword.value = '';
        searchResults.value = [];
      }
    });

    const handleSearch = () => {
      const keyword = searchKeyword.value.trim().toLowerCase();
      if (!keyword) {
        searchResults.value = [];
        return;
      }

      searchResults.value = props.dataSource.filter(item => 
        item.toLowerCase().includes(keyword)
      );
    };

    const handleSelect = (item: string) => {
      emit('select', item);
      emit('update:visible', false);
    };

    const handleAddNew = () => {
      const value = searchKeyword.value.trim();
      if (!value) {
        uni.showToast({ title: '请输入内容', icon: 'none' });
        return;
      }
      handleSelect(value);
    };

    const handleClose = () => {
      emit('close');
      emit('update:visible', false);
    };

    return {
      searchKeyword,
      searchResults,
      handleSearch,
      handleSelect,
      handleAddNew,
      handleClose
    };
  }
});
</script>

<style lang="scss" scoped>
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.modal-content {
  width: 100%;
  height: 85vh;
  background: #fff;
  border-radius: 40rpx 40rpx 0 0;
  padding: 40rpx;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30rpx;
  flex-shrink: 0;
}

.modal-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.close-btn {
  font-size: 60rpx;
  color: #999;
  line-height: 1;
  padding: 0 20rpx;
}

.search-container {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 30rpx;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  height: 80rpx;
  padding: 0 30rpx;
  background: #F5F5F5;
  border-radius: 40rpx;
  font-size: 28rpx;
  color: #333;
}

.add-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
  padding: 10rpx 20rpx;
  background: #FFF0F6;
  border-radius: 12rpx;
  min-width: 80rpx;
}

.add-icon {
  font-size: 40rpx;
  color: #b70030;
  line-height: 1;
}

.add-text {
  font-size: 20rpx;
  color: #b70030;
}

.search-results {
  flex: 1;
  overflow-y: auto;
}

.result-item {
  padding: 30rpx;
  border-bottom: 1rpx solid #F5F5F5;
  font-size: 28rpx;
  color: #333;
  
  &:active {
    background: #F5F5F5;
  }
}

.no-result {
  padding: 60rpx;
  text-align: center;
  font-size: 28rpx;
  color: #999;
}
</style>
