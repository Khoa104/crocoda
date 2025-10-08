// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SidebarProvider } from "./contexts/SidebarContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Dashboard from "./pages/scm/Dashboard";
import Products from "./pages/scm/Products";
import POManage from "./pages/scm/POManage";
import UserManage from "./pages/user/user/UserManage";
// import GroupUserManage from "./pages/GroupRolesManager";
import GroupUser from "./pages/user/GroupUser";
import RolesManagement from "./pages/user/RolesManagement";
import MainLayout from "./components/MainLayout";
import NotFound from "./pages/auth/NotFound";
import NoPermission from "./pages/auth/NoPermission";
import ModuleSelectPage from "./pages/auth/ModuleSelectPage";

function App() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/modules" element={<ModuleSelectPage />} />
              <Route path="/*" element={<MainLayout />}>  
                {/* <Route path="scm" element={<Dashboard />} />
                <Route path="user" element={<UserManage />} /> */}
              </Route>
            </Route>
          </Routes>
        </Router>
      </SidebarProvider>
    </AuthProvider>
  );
}

export default App;
{/* <Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/signup" element={<Signup />} />

  <Route element={<ProtectedRoute />}>
    <Route path="/modules" element={<ModuleSelectPage />} />
    <Route path="/no-permission" element={<NoPermission />} />
    <Route path="*" element={<MainLayout />} />
  </Route>
</Routes> */}
{/* <Route index element={<Dashboard />} />
                <Route path="/scm/home" element={<Dashboard />} />
                <Route path="scm/products" element={<Products />} />
                <Route path="scm/po" element={<POManage />} />
                <Route path="/user/home" element={<UserManage />} />
                <Route path="/user/groupuser" element={<GroupUser />} />
                <Route path="/user/rolemanage" element={<RolesManagement />} />
                <Route path="/no-permission" element={<NoPermission />} />
                <Route path="*" element={<NotFound />} /> */}