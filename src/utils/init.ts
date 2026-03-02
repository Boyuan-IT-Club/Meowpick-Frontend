export function Init() {
  uni.showLoading({
    title: "初始化中"
  });
  
  // 临时：绕过真实登录，直接进入首页
  // 这种方式在没有后端支持时允许前端查看页面
  setTimeout(() => {
     uni.hideLoading();
     
     const pages = getCurrentPages();
     if (pages.length > 0 && pages[pages.length-1].route === 'pages/home/home') {
         return;
     }
      // 避免引用未定义的 res
      uni.reLaunch({
         url: '/pages/home/home'
      });
  }, 1000);
}
