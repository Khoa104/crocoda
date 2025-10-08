// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import { login, logout, refreshAccessToken, getAllResources } from "../api/api.js";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permissions, setpermissions] = useState([]);
  const [modules, setmodules] = useState([]);
  const [resources, setresources] = useState([]);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resourcesList, setResourcesList] = useState([]);

  useEffect(() => {
    const loadAuthData = async () => {
      setLoading(true);
      let newAccessToken = null;
      let newUser = null;
      let userPermissions = [];
      let allModules = new Set();
      let allResources = new Set();
      let allResourcesList = [];
      try {
        const refreshResponse = await refreshAccessToken();
        newAccessToken = refreshResponse.accessToken;
        newUser = refreshResponse.user;
        if (newAccessToken && newUser) {
          setUser(newUser);
          setAccessToken(newAccessToken);
          userPermissions = newUser.permissions || "";

          const parts = userPermissions.split(";");
          parts.forEach((part) => {
            const subParts = part.split("_");
            if (subParts.length >= 2) {
              allModules.add(subParts[0]);
              allResources.add(subParts[1]);
            }
          });
          setmodules(Array.from(allModules));
          setresources(Array.from(allResources));
          setpermissions(userPermissions);
        }
      } catch (error) {
        console.error("Failed to refresh token or get user data:", error);
        setAccessToken(null);
        setUser(null);
        setmodules([]);
        setresources([]);
        setpermissions("");
      }

      try {
        const cachedResources = localStorage.getItem("resourcesList");
        if (cachedResources) {
          allResourcesList = JSON.parse(cachedResources);
        } else {
          allResourcesList = await getAllResources();
          localStorage.setItem("resourcesList", JSON.stringify(allResourcesList));
        }
        setResourcesList(allResourcesList || []);
      } catch (err) {
        console.error("Failed to fetch all resources:", err.message);
        setResourcesList([]);
      } finally {
        setLoading(false);
      }
    };
    loadAuthData();
  }, []);

  const loginUser = async (email, password) => {
    setLoading(true);
    try {
      const { accessToken: newAccessToken, user: newUser } = await login(email, password);
      setUser(newUser);
      setAccessToken(newAccessToken);

      const userPermissions = newUser.permissions || "";
      setpermissions(userPermissions);

      const modulesSet = new Set();
      const resourcesSet = new Set();
      const parts = userPermissions.split(";");
      parts.forEach((part) => {
        const subParts = part.split("_");
        if (subParts.length >= 2) {
          modulesSet.add(subParts[0]);
          resourcesSet.add(subParts[1]);
        }
      });
      setmodules(Array.from(modulesSet));
      setresources(Array.from(resourcesSet));

      const cachedResources = localStorage.getItem("resourcesList");
      let allResourcesList = cachedResources ? JSON.parse(cachedResources) : null;
      if (!allResourcesList) {
          allResourcesList = await getAllResources();
          localStorage.setItem("resourcesList", JSON.stringify(allResourcesList));
      }
      setResourcesList(allResourcesList || []);

      return Array.from(modulesSet);
    } catch (error) {
      console.error("Login failed:", error);
      setAccessToken(null);
      setUser(null);
      setmodules([]);
      setresources([]);
      setpermissions("");
      setResourcesList([]);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = async () => {
    // setLoading(true);
    try {
      await logout();
      setUser(null);
      setAccessToken(null);
      setpermissions([]);
      setmodules([]);
      setresources([]);
      // ---------- ĐIỂM THAY ĐỔI QUAN TRỌNG ĐỂ KHẮC PHỤC LOGOUT ----------
      setResourcesList([]); // Đặt resourcesList về mảng rỗng để ProtectedRoute không tìm thấy quyền
      // localStorage.removeItem("resourcesList"); 
      // -----------------------------------------------------------------
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, username, fullName) => {
    // Logic đăng ký
  };

  const value = {
    loading,
    user,
    accessToken,
    permissions,
    modules,
    resources,
    resourcesList,
    signUp,
    loginUser,
    logoutUser,
    isAuthenticated: !!accessToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};