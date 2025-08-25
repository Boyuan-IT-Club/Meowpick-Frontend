export default defineStore("route-index-listener", {
  state() {
    return {
      url: ""
    };
  },
  actions: {
    setUrl(url: string) {
      const indexOfQuestionMark = url.indexOf("?");
      this.url =
        indexOfQuestionMark !== -1
          ? url.substring(0, indexOfQuestionMark)
          : url;
    }
  }
});
