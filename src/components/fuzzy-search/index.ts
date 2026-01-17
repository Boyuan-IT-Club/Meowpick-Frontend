import { ref, computed, watch } from 'vue';

export function useFuzzySearch(options: string[] = []) {
  const keyword = ref('');
  const filteredOptions = ref<string[]>([]);
  const isVisible = ref(false);

  // 过滤选项
  const filterOptions = () => {
    if (!keyword.value) {
      filteredOptions.value = options;
      return;
    }
    
    const lowerKeyword = keyword.value.toLowerCase();
    filteredOptions.value = options.filter(option => 
      option.toLowerCase().includes(lowerKeyword)
    );
  };

  // 监听关键词变化
  watch(keyword, () => {
    filterOptions();
    if (keyword.value) {
      isVisible.value = true;
    } else {
      isVisible.value = false;
    }
  });

  // 初始化过滤
  filterOptions();

  return {
    keyword,
    filteredOptions,
    isVisible,
    setKeyword: (value: string) => {
      keyword.value = value;
    },
    toggleVisible: () => {
      isVisible.value = !isVisible.value;
    },
    hide: () => {
      isVisible.value = false;
    },
    updateOptions: (newOptions: string[]) => {
      options = newOptions;
      filterOptions();
    }
  };
}