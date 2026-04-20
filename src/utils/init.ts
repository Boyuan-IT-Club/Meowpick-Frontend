import { useTokenStore } from "@/config";

let isInitializing = false;
let loginComplete = false;

export function Init() {
  if (isInitializing) {
    console.log('[Init] Already initializing, returning');
    return;
  }
  isInitializing = true;
  loginComplete = false;

  console.log('[Init] Starting initialization');

  const tokenStore = useTokenStore();
  const storedToken = uni.getStorageSync('token') || tokenStore.token;
  if (storedToken) {
    console.log('[Init] Token exists, restoring to store');
    if (!tokenStore.token) {
      tokenStore.store(storedToken);
    }
    loginComplete = true;
    isInitializing = false;
    return;
  }

  console.log('[Init] No token found, starting login flow');

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
    console.error('[handleLogin] no code from uni.login');
    loginComplete = true;
    isInitializing = false;
    return;
  }

  console.log('[handleLogin] Calling login API with code:', code);

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

    console.log('[handleLogin] Login API response:', JSON.stringify(res.data));

    const responseData = res.data;
    const accessToken = responseData?.data?.accessToken;

    if (accessToken) {
      const tokenStore = useTokenStore();
      tokenStore.store(accessToken);
      uni.setStorageSync('token', accessToken);
      if (responseData.data.userId) {
        tokenStore.setUserId(responseData.data.userId);
      }
      console.log('[handleLogin] Token stored successfully');
    } else {
      console.error('[handleLogin] Login failed - no accessToken in response');
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
          console.warn('[waitForLogin] Timeout after 30s, proceeding anyway');
          resolve();
        } else {
          setTimeout(check, 100);
        }
      }
    };
    check();
  });
}