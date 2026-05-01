import { ref, watch } from 'vue';

interface FuzzySearchReturn {
  keyword: typeof keyword;
  filteredOptions: typeof filteredOptions;
  isVisible: typeof isVisible;
  setKeyword: (value: string) => void;
  toggleVisible: () => void;
  hide: () => void;
  updateOptions: (newOptions: string[]) => void;
}

export function useFuzzySearch(options: string[] = []): FuzzySearchReturn {
  const keyword = ref('');
  const filteredOptions = ref<string[]>([...options]);
  const isVisible = ref(false);

  const filterOptions = () => {
    if (!keyword.value) {
      filteredOptions.value = [...options];
      return;
    }

    const lowerKeyword = keyword.value.toLowerCase();
    filteredOptions.value = options.filter(option =>
      option.toLowerCase().includes(lowerKeyword)
    );
  };

  watch(keyword, () => {
    filterOptions();
    isVisible.value = !!keyword.value;
  });

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