import axios from "axios";
const API_URL = import.meta.env.API_URL;
console.log(API_URL);
// Cấu hình axios (tự động gửi cookie)
const api = axios.create({
  baseURL: `${API_URL}`,
  withCredentials: true,
});

// Đăng nhập người dùng
export const login = async (email, password) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};

// Làm mới Access Token
export const refreshAccessToken = async () => {
  const response = await api.post("/auth/refresh-token");
  return response.data;
};

// Đăng xuất người dùng
export const logout = async () => {
  await api.post("/auth/logout");
};
