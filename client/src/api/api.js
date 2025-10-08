// src/api/api.js
import api from "./axiosInstance";
// Auth
export const login = (email, password) =>
  api.post("/auth/login", { email, password }).then(res => res.data);
export const logout = () =>
  api.post("/auth/logout");
export const getMe = () =>
  api.get("/auth/me").then(res => res.data);
export const refreshAccessToken = async () => {
  const response = await api.post("/auth/refresh-token");
  return response.data;
};

//module&resource
export const getAllModules = () =>
  api.get("user/allmodules").then(res => res.data);
export const getAllResources = () =>
  api.get("user/allresources").then(res => res.data);

// User
export const getUsers = () =>
  api.get("/user/users").then(res => res.data);
export const getAllRoles = () =>
  api.get("/user/allRoles").then(res => res.data);
export const getDepartments = () =>
  api.get("/user/departments").then(res => res.data);
export const getTitles = () =>
  api.get("/user/titles").then(res => res.data);
export const createOrUpdateUser = (userData) =>
  api.post("/user/saveUser", userData);
export const deleteUser = (user_id) =>
  api.post("/user/deleteUser", { user_id });
export const getGroups = () =>
  api.get("/user/groups").then(res => res.data);
export const createOrUpdateGroup = (userData) =>
  api.post("/user/saveGroup", userData);
export const deleteGroup = (group_id) =>
  api.post("/user/deleteGroup", { group_id });
export const createOrUpdateRole = (userData) =>
  api.post("/user/saveRole", userData);
export const deleteRole = (role_id) =>
  api.post("/user/deleteRole", { role_id });

// SCM
export const getPOs = () =>
  api.get("/scm/pos").then(res => res.data);
export const getVendors = () =>
  api.get("/scm/vendors").then(res => res.data);
export const getVendorItems = () =>
  api.get("/scm/vendoritems").then(res => res.data);
export const getSenders = () =>
  api.get("/scm/senders").then(res => res.data);
export const getWHs = () =>
  api.get("/scm/whs").then(res => res.data);
export const getProducts = () =>
  api.get("/scm/products").then(res => res.data);