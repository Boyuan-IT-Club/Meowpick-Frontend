export default defineStore("token-store", {
  unistorage: true,
  state() {
    return {
      token: "",
      userId: ""
    };
  },
  actions: {
    store(token: string) {
      this.token = token;
    },
    setUserId(userId: string) {
      this.userId = userId;
    }
  }
});
