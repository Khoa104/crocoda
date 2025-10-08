// src/components/Navbar.jsx
import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { useTheme } from '../contexts/ThemeContext'; // Import useTheme hook
import { useSidebar } from "../contexts/SidebarContext";
import { CircleUserRound, PanelLeft, Boxes } from 'lucide-react';

const Navbar = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const { hideSidebar } = useSidebar();
  const themeSwitchId = 'theme-toggle-checkbox';
  const navigate = useNavigate();
  const [expanded_right_dropdownbody, setexpanded_right_dropdownbody] = useState(false);
  const toggleright_dropdownbody = () => {
    setexpanded_right_dropdownbody(prev => !prev);
  };
    const handleLogoutModule = () => {
    // localStorage.removeItem("selectedModule");
    navigate("/modules");
  };

  return (
    <>
      <div className="navHeader">
        <div className="navLeftRegion"><button onClick={handleLogoutModule} id="togglesidebar" title="Switch Module"><Boxes size={18} /></button></div>
        <div className="navCenterRegion" style={{ width: "calc(100% - 96px)" }}>
          <div>
            <span style={{ display: "inline", textWrap: "nowrap" }}>
              {localStorage.getItem("selectedModule") && `${localStorage.getItem("selectedModule")} Module`}
            </span>
          </div>
        </div>
        <div className="navRightRegion">
          <button className="right_dropdownbody_btn" onClick={() => { toggleright_dropdownbody() }}><CircleUserRound /></button>
          <div className={`right_dropdownbody ${expanded_right_dropdownbody ? "expanded" : ""}`} >
            <span>Hello </span>
            <button onClick={logoutUser}>Logout</button>
            <span>
              <div className="theme-switch">
                {/* Checkbox input (hidden) */}
                <h3>Dark Mode</h3>
                <input
                  type="checkbox"
                  id={themeSwitchId}
                  checked={theme === 'dark'} // Checkbox được check khi theme là 'dark'
                  onChange={toggleTheme} // Gọi toggleTheme khi trạng thái checkbox thay đổi
                />
                {/* Label that acts as the visual switch */}
                <label htmlFor={themeSwitchId}>
                  <span className="slider"></span>
                  <span className="slider round"></span>
                </label>
              </div>
            </span>
          </div>
        </div>
      </div>
      <div></div>
      <div className="shyHeader" style={{ visibility: "hidden", display: "none" }} >
        <div></div>
        <div></div>
      </div>
    </>


  );
};

export default Navbar;
