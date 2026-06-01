export default defineStore("theme-store", {
  unistorage: true,
  state() {
    return {
      mode: "light" as "light" | "dark"
    };
  },
  getters: {
    themeClass: (state) => {
      return state.mode === "dark" ? "dark-theme" : "light-theme";
    }
  },
  actions: {
    toggleTheme() {
      this.mode = this.mode === "light" ? "dark" : "light";
    }
  }
});