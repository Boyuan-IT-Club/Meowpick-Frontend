export function Init() {
  uni.showLoading({
    title: "初始化中"
  });
  uni.login({
    success: (res) => {
      http
        .sign_in({
          authId: "wxdffc445bde3313aa",
          authType: "wechat",
          verifyCode: res.code,
          appId: 100
        })
        .then((rse) => {
          uni.hideLoading();
          uni.reLaunch({
            url: "/pages/home/home"
          });
        });
      console.log("login:", res);
    }
  });
}
