import { ContentType, HttpClient } from "@/api/http-client";
import { Course } from "@/api/Course";
import { Comment } from "@/api/Comment";
import { Teacher } from "@/api/Teacher";
import { Search } from "@/api/Search";
import { Like } from "@/api/Like";
import { Proposal } from "@/api/Proposal";
import { Auth } from "@/api/Auth";
import { Courses } from "@/api/Courses";
import { StorageKeys } from "@/utils/const";
import useTokenStore from "../store/Token";

class HttpRequest<
    SecurityDataType = unknown
> extends HttpClient<SecurityDataType> {
  public CourseController: Course;
  public SearchController: Search;
  public CommentController: Comment;
  public TeacherController: Teacher;
  public ProposalController: Proposal;
  public LikeController: Like;
  public AuthController: Auth;
  public CoursesController: Courses;

  constructor(config: any) {
    super(config);
    // 在构造函数中显式初始化，确保 this 正确传递
    this.CourseController = new Course(this as any);
    this.SearchController = new Search(this as any);
    this.CommentController = new Comment(this as any);
    this.TeacherController = new Teacher(this as any);
    this.ProposalController = new Proposal(this as any);
    this.LikeController = new Like(this as any);
    this.AuthController = new Auth(this as any);
    this.CoursesController = new Courses(this as any);
  }

  async sign_in(data: any) {
    await this.request({
      path: `/api/auth/sign_in`,
      method: "POST",
      body: data,
      type: ContentType.Json
    });
    console.log("[Auth] Sign-in logic done");
  }
}

const api = new HttpRequest({
  baseURL: ""
});

// 设置 API 根地址
(api as any).realBaseUrl = import.meta.env.VITE_SERVER_HOST_PORT || "http://eagle233.top:11451";

// 注册请求拦截器
api.interceptors.request.push(async (config) => {
  const tokenStore = useTokenStore();
  
  let token = (tokenStore.token || "").trim();
  if (!token) {
    const raw = uni.getStorageSync("token-store");
    if (raw) {
      try {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        token = (parsed.token || "").trim();
      } catch(e) {}
    }
  }
  
  const tokenName = import.meta.env.VITE_TOKEN_NAME || "Authorization";
  if (!config.headers) config.headers = {};
  
  if (token) {
    config.headers[tokenName] = `Bearer ${token}`;
  }
  
  const backendEnv = uni.getStorageSync(StorageKeys.BackendEnv);
  if (backendEnv) {
    config.headers["X-Xh-Env"] = backendEnv;
  }
  
  return config;
});

// 注册响应拦截器
api.interceptors.response.push((res) => {
  const resData = res.data;
  if (resData && resData.code === 0 && resData.data) {
    const payload = resData.data;
    const tokenStore = useTokenStore();
    if (payload.userId) tokenStore.setUserId(payload.userId);
    if (payload.accessToken) tokenStore.store(payload.accessToken);
  }
  return res;
});

export default api;
