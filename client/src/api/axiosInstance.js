// src/utils/axiosInstance.js
import axios from "axios";

// URL
const API_BASE_URL = import.meta.env.VITE_API_URL;
const API_BASE_URL_LOCAL = import.meta.env.VITE_API_URL_local;

// Kiểm tra hostname hiện tại
const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

const api = axios.create({
  baseURL: isLocalhost ? API_BASE_URL_LOCAL : API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const res = error.response;

    // Nếu lỗi là do không kết nối được (network error)
    // if (!res && error.message === "Network Error" && currentBaseURL !== API_BASE_URL_2) {
    //   console.warn("⚠️ API_URL không phản hồi, thử chuyển sang API_URL_2");
    //   currentBaseURL = API_BASE_URL_2;
    //   api.defaults.baseURL = currentBaseURL;
    //   return api.request(error.config); // thử lại request với URL mới
    // }

    // Nếu lỗi là do token hết hạn
    if (res?.status === 401 && res?.data?.code === "TOKEN_EXPIRED") {
      try {
        const refreshRes = await api.post("/auth/refresh-token", {}, { withCredentials: true });
        // api.defaults.headers.common["Authorization"] = `Bearer ${res.data.accessToken}`;
        // error.config.headers["Authorization"] = `Bearer ${res.data.accessToken}`;
        console.log('a')
        return api.request(error.config);
      } catch {
        window.location = "/login";
      }
    }
    // Nếu không có token
    else if (res?.status === 401 && res?.data?.code === "NO_TOKEN") {
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;

