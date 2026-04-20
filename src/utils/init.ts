import { useTokenStore } from "@/config";

let isInitializing = false;
let loginComplete = false;

export function Init() {
  if (isInitializing) {
    return;
  }
  isInitializing = true;
  loginComplete = false;

  const tokenStore = useTokenStore();
  const storedToken = uni.getStorageSync('token') || tokenStore.token;
  if (storedToken) {
    if (!tokenStore.token) {
      tokenStore.store(storedToken);
    }
    loginComplete = true;
    isInitializing = false;
    return;
  }

  uni.login({
    provider: 'weixin',
    success: (loginRes) => {
      handleLogin(loginRes.code);
    },
    fail: (err) => {
      console.error('uni.login fail:', err);
      loginComplete = true;
      isInitializing = false;
    }
  });
}

async function handleLogin(code: string) {
  if (!code) {
    loginComplete = true;
    isInitializing = false;
    return;
  }

  try {
    const res: any = await uni.request({
      url: import.meta.env.VITE_SERVER_HOST_PORT + '/api/auth/sign_in',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'X-Xh-Env': 'test'
      },
      data: {
        authType: 'wechat',
        authId: 'miniapp_user',
        verifyCode: code
      }
    });

    const responseData = res.data;
    const accessToken = responseData?.data?.accessToken;

    if (accessToken) {
      const tokenStore = useTokenStore();
      tokenStore.store(accessToken);
      uni.setStorageSync('token', accessToken);
      if (responseData.data.userId) {
        tokenStore.setUserId(responseData.data.userId);
      }
    }
  } catch (err: any) {
    console.error('[handleLogin] Login request failed:', err);
  } finally {
    loginComplete = true;
    isInitializing = false;
  }
}

export function waitForLogin(): Promise<void> {
  return new Promise((resolve) => {
    if (loginComplete) {
      resolve();
      return;
    }
    let waited = 0;
    const check = () => {
      if (loginComplete) {
        resolve();
      } else {
        waited += 100;
        if (waited > 30000) {
          resolve();
        } else {
          setTimeout(check, 100);
        }
      }
    };
    check();
  });
}