export default defineStore("theme-store", {
  unistorage: true,
    getters: {
    themeClass: (state) => {
      if (state.mode === "system") {
        const sysInfo = uni.getSystemInfoSync();
        return sysInfo.theme === "dark" ? "dark-theme" : "";
      }
      return state.mode === "dark" ? "dark-theme" : "";
    }
  },
  state() {
    return {
      mode: "system" as "light" | "dark" | "system"
    };
  },
  actions: {
    setTheme(mode: "light" | "dark" | "system") {
      this.mode = mode;
    },
    toggleTheme() {
      if (this.mode === "light") {
        this.mode = "dark";
      } else if (this.mode === "dark") {
        this.mode = "system";
      } else {
        this.mode = "light";
      }
    }
  }
});
