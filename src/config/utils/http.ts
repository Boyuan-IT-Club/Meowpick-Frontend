import { ContentType, HttpClient } from "@/api/http-client";
import { Course } from "@/api/Course";
import { Comment } from "@/api/Comment";
import { Teacher } from "@/api/Teacher";
import { Search } from "@/api/Search";
import { Like } from "@/api/Like";
import { Proposal } from "@/api/Proposal";
import { Auth } from "@/api/Auth";
import { StorageKeys } from "@/utils/const";
import { UniAdapter } from "uniapp-axios-adapter";
import { useTokenStore } from "@/config";
import { ref } from "vue";

class HttpRequest<
    SecurityDataType = unknown
> extends HttpClient<SecurityDataType> {
  public CourseController = new Course(this);
  public SearchController = new Search(this);
  public CommentController = new Comment(this);
  public TeacherController = new Teacher(this);
  public ProposalController = new Proposal(this);
  public LikeController = new Like(this);
  public AuthController = new Auth(this);

  async sign_in(data: any) {
    const resp = await this.request({
      path: `/api/auth/sign_in`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      baseURL: import.meta.env.VITE_SERVER_HOST_PORT
    });
    useTokenStore().store(resp.data.data.accessToken);
    console.log(resp.data.data.accessToken);
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
      config.headers![process.env.VITE_TOKEN_NAME] = `Bearer ${
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
      // 安全检查：确保 res.data 和 res.data.data 存在
      if (res.data && res.data.data && res.data.data.userId != undefined) {
        useTokenStore().setUserId(res.data.data.userId);
        console.log("存储userId", res.data.data.userId);
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
