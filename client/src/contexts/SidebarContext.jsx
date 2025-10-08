// src/contexts/SidebarContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHided, setIsHided] = useState(false);

  useEffect(() => {
    const exp = localStorage.getItem("sidebarExpanded");
    const hide = localStorage.getItem("sidebarHided");
    if (exp !== null) {
      setIsExpanded(exp === "true");
    }
    if (hide !== null) {
      setIsHided(hide === "true");
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    localStorage.setItem("sidebarExpanded", newState);
  };

  const hideSidebar = () => {
    const newState = !isHided;
    setIsHided(newState);
    localStorage.setItem("sidebarHided", newState);
  };

  return (
    <SidebarContext.Provider value={{ isExpanded, isHided, toggleSidebar ,hideSidebar}}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => useContext(SidebarContext);
