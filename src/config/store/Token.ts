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
      console.log('[Token store] Token set to:', token?.substring(0, 20) + '...');
    },
    setUserId(userId: string) {
      this.userId = userId;
      console.log('[Token store] UserId set to:', userId);
    }
  },
  getters: {
    isLoggedIn: (state) => !!state.token
  }
});
