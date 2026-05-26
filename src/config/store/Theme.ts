import { defineStore } from "pinia";
import PubSub from "../utils/pubsub";

export default defineStore("theme-store", {
  unistorage: true,
  state() {
    return {
      theme: "light" as "light" | "dark" | "system"
    };
  },
  actions: {
    setTheme(t: "light" | "dark" | "system") {
      this.theme = t;
      this.applyTheme(t);
    },
    applyTheme(t: "light" | "dark" | "system") {
      let isDark = false;
      if (t === "dark") {
        isDark = true;
      } else if (t === "system") {
        isDark = uni.getSystemInfoSync().theme === "dark";
      }
      uni.setStorageSync("dark", isDark);
      PubSub.publish("themeChange", { theme: t, isDark });
    }
  }
});