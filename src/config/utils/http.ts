import { ContentType } from "@/api/http-client";
import { Course } from "@/api/Course";
import { Courses } from "@/api/Courses";
import { Search } from "@/api/Search";
import { Comment } from "@/api/Comment";
import { Like } from "@/api/Like";
import { Proposal } from "@/api/Proposal";
import { Teacher } from "@/api/Teacher";
import { Auth } from "@/api/Auth";
import { waitForLogin } from "@/utils/init";
import { useTokenStore } from "@/config";
import axios, { AxiosAdapter, AxiosRequestConfig, AxiosResponse } from "axios";

const buildQueryString = (params?: Record<string, any>): string => {
  if (!params || Object.keys(params).length === 0) return '';
  const parts: string[] = [];
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value !== undefined && value !== null) {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  });
  return parts.join('&');
};

const uniRequestAdapter: AxiosAdapter = (config: AxiosRequestConfig): Promise<AxiosResponse> => {
  return new Promise((resolve, reject) => {
    const { baseURL = '', url = '', method = 'GET', headers = {}, data, params } = config;

    let fullUrl = baseURL + url;
    const queryString = buildQueryString(params as Record<string, any>);
    if (queryString) {
      fullUrl += '?' + queryString;
    }

    const tokenStore = useTokenStore();
    const token = tokenStore.token || uni.getStorageSync('token') || '';
    const backendEnv = uni.getStorageSync('backendEnv') || 'test';
    const tokenHeader = import.meta.env.VITE_TOKEN_NAME || 'Authorization';

    const uniConfig: any = {
      url: fullUrl,
      method: method,
      header: {
        ...headers,
        [tokenHeader]: `Bearer ${token}`,
        "X-Xh-Env": backendEnv,
      },
      success: (res: any) => {
        const response: AxiosResponse = {
          data: res.data,
          status: res.statusCode,
          statusText: res.errMsg,
          headers: res.header || {},
          config: config,
          request: null,
        };
        resolve(response);
      },
      fail: (res: any) => {
        const error: any = new Error(res.errMsg || 'Request failed');
        error.response = {
          data: res.data,
          status: res.statusCode,
          statusText: res.errMsg,
          headers: res.header || {},
          config: config,
          request: null,
        };
        reject(error);
      }
    };

    if (data && method.toUpperCase() !== 'GET') {
      uniConfig.data = data;
    }

    uni.request(uniConfig);
  });
};

class HttpRequest<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  public CourseController = new Course(this);
  public CoursesController = new Courses(this);
  public SearchController = new Search(this);
  public CommentController = new Comment(this);
  public ActionController = new Like(this);
  public ProposalController = new Proposal(this);
  public TeacherController = new Teacher(this);
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
  }
}

const api = new HttpRequest({
  baseURL: import.meta.env.VITE_SERVER_HOST_PORT,
  adapter: uniRequestAdapter,
  timeout: 30000
});

export default api;