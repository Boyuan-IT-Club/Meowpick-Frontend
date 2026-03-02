export default defineStore("token-store", {
  unistorage: true,
  state() {
    return {
      token: "mock_token_for_bypass_login", // 这里默认给一个 mock string
      userId: "mock_user_id_123456" // 默认给一个 mock ID
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
