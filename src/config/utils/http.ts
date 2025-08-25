import { ContentType } from "@/api/http-client";
import { StorageKeys } from "@/utils/const";
import { UniAdapter } from "uniapp-axios-adapter";

class HttpRequest<
    SecurityDataType = unknown
> extends HttpClient<SecurityDataType> {
  public CourseController = new CourseApi(this);
  public SearchController = new SearchController(this);
  public UserController = new UserApi(this);
  public CommentController = new CommentApi(this);
  public TeacherController = new TeacherApi(this);
  public ActionController = new ActionApi(this);
  public PopularityApi = new PopularityApi(this);

  async sign_in(data: any) {
    const resp = await this.request({
      path: `/sign_in`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      baseURL: "https://meowchat.xhpolaris.com/auth"
    });
    useTokenStore().store(resp.data.accessToken);
    console.log(resp.data.accessToken);
  }
}

const api = new HttpRequest({
  // paramsSerializer: (params) => qs.stringify(params, { indices: false }),
  baseURL: import.meta.env.VITE_SERVER_HOST_PORT,
  adapter: UniAdapter, // 指定适配器
  timeout: 3000
});

api.instance.interceptors.request.use(
    (config) => {
      const backendEnv = ref(uni.getStorageSync(StorageKeys.BackendEnv));
      config.headers![process.env.VITE_TOKEN_NAME] = `Berry ${
          useTokenStore().token
      }`;
      config.headers!["X-Xh-Env"] = backendEnv.value;
      console.log(config);
      return config;
    },
    (error) => {
      console.log(error);
      Promise.reject(error);
    }
);

api.instance.interceptors.response.use(
    (res) => {
      console.log(res.data);
      if (res.data.userId != undefined) {
        useTokenStore().setUserId(res.data.userId);
        console.log("存储userId", res.data.userId);
      }
      // const code = res.data.state.code;
      // const msg = res.data.state.errMsg || '系统未知错误，请反馈给管理员';
      // if (code === 1403) {
      //     PubSub.publish('un_login');
      //     return Promise.reject(new Error(msg));
      // }
      //
      // if (code !== 0) {
      //     console.error(msg);
      //     return Promise.reject(new Error(msg));
      // }
      // if (code === undefined) {
      //     console.error(msg);
      //     return Promise.reject(new Error(msg));
      // }

      return res;
    },
    (error) => {
      let { errMsg: msg } = error;
      if (msg === "Network Error") {
        msg = "后端接口连接异常";
      } else if (msg.includes("timeout")) {
        msg = "系统接口请求超时";
      } else if (msg.includes("Request failed with status code")) {
        // 获得异常http状态码
        const statusCode = +msg.substr(msg.length - 3);
        if (statusCode === 401) {
          return Promise.reject(
              new Error("无效的会话，或者会话已过期，请重新登录。")
          );
        }
        msg = "系统接口" + statusCode + "异常";
      }
      console.error(msg);
      return Promise.reject(error);
    }
);
export default api;
