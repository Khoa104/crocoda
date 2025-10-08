// src/components/MainLayout.jsx

import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

import StackedViewContainer from "./StackedViewContainer";
import { useSidebar } from "../contexts/SidebarContext";

const MainLayout = () => {
  const { isExpanded } = useSidebar();
  const { isHided } = useSidebar();
  return (
    <div className="app-layout">
      <Sidebar />
      <div className={`main-content ${!isExpanded ? "sidebar-collapsed" : "sidebar-expanded"} ${isHided ? "hided" : ""}`} >
        {/* <div className={`suiteNav ${"a" === "a" ? "nav-collapsed" : "nav-collapsed"}`}>
          <Navbar />
        </div> */}
        <div className="page-content">
          <StackedViewContainer />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
