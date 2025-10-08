import { useEffect, useLayoutEffect, useRef, useState, useCallback, useContext, useMemo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useSidebar } from "../contexts/SidebarContext";
import { AuthContext } from "../contexts/AuthContext";
import SettingsModal from "./SettingModal"
import * as LucideIcons from "lucide-react";
import { getAllResources } from "../api/api";
import { Box, ShieldCheck, Users, BarChart2, Boxes, Settings, CircleUserRound, ChevronRight } from "lucide-react";

const Sidebar = () => {
  const { isExpanded, toggleSidebar, isHided } = useSidebar();
  const [activeModule, setActiveModule] = useState("SCM");
  const [currentpage, setCurrentPage] = useState(0);
  const [resources, setResources] = useState([]);
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const sidebarRef = useRef(null);
  const buttonRefs = useRef([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { logoutUser, resources: allowedresources, modules: allowedmodules } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  // const filteredItems = resources.filter((item) =>
  //   item.module_key === activeModule &&
  //   allowedresources?.includes(item.resource_name) &&
  //   allowedmodules?.includes(item.module_key)
  // );
  const filteredItems = useMemo(() =>
    resources.filter((item) =>
      item.module_key === activeModule &&
      allowedresources?.includes(item.resource_name) &&
      allowedmodules?.includes(item.module_key)
    ), [resources, activeModule, allowedresources, allowedmodules]
  );
  // Tự động update currentpage theo route
  useEffect(() => {
    if (location.pathname == "no-permission") { return }
    const currentIndex = filteredItems.findIndex(item =>
      // item.path === location.pathname
      location.pathname.startsWith(item.path)
    );
    if (currentIndex !== -1) {
      setCurrentPage(currentIndex);
    }
  }, [location.pathname, filteredItems]);

  useEffect(() => {
    const selectedModule = localStorage.getItem("selectedModule");
    if (selectedModule) {
      setActiveModule(selectedModule);
    }
    const fetchData = async () => {
      try {
        const res = await getAllResources();
        setResources(res);
        localStorage.setItem("resourcesList", JSON.stringify(res));
      } catch (error) {
        console.error("Failed to fetch data:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useLayoutEffect(() => {
    const currentButton = buttonRefs.current[currentpage];
    const sidebarNode = sidebarRef.current;
    if (!currentButton || !sidebarNode) return;

    const offsetTop = currentButton.offsetTop; // vị trí so với sidebar container
    const height = currentButton.offsetHeight;
    const offset = (height * (1 - 0.7)) / 2;

    setIndicatorStyle({
      transform: `translateY(${offsetTop + offset}px)`,
      height: `${height * 0.7}px`,
    });
  }, [currentpage, isExpanded, filteredItems]);

  const setButtonRef = useCallback((el, index) => {
    if (el) buttonRefs.current[index] = el;
  }, []);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const handleOpenSettingsModal = () => {
    setIsSettingsModalOpen(true);
  };

  const handleCloseSettingsModal = () => {
    setIsSettingsModalOpen(false);
  };

  const handleLogoutModule = () => {
    // localStorage.removeItem("selectedModule");
    navigate("/modules");
  };
  return (
    <nav
      id="left-nav"
      className={`sidebar ${!isExpanded ? "collapsed" : "expanded"} ${isHided ? "hided" : ""}`}
    >
      <div className="toggle-btn ">
        <div style={{ textAlign: "center" }}>
          <p className="menu-title">Menu</p>
        </div>
        <button
          className={`toggle-icon`}
          onClick={toggleSidebar}
          title={`${!isExpanded ? "Expand sidebar" : "Collapse sidebar"}`}
          aria-label="Toggle Sidebar"
        >
          <img src="/croco.svg" alt="Logo" style={{ width: "24px" }} />
        </button>

      </div>
      <div className="sidebarContainer " ref={sidebarRef}>
        <div className="indicator" style={indicatorStyle} />
        <ul>
          {filteredItems.map((item, index) => {
            const Icon = LucideIcons[item.icon] || LucideIcons.Box;
            return (
              <li key={item.path} ref={el => setButtonRef(el, index)}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `menuselect${isActive ? " selected" : ""}`}
                  title={item.label}
                >
                  <span className="icon"><Icon size={20} /></span>
                  {isExpanded && <span className="label">{item.label}</span>}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="sidebarContainer bottomsidebarContainer">
        <ul>
          <li
            className={`menuselect logout-module-btn`}
            onClick={handleLogoutModule}
            title="Switch module"
          >
            <span className="icon"><Boxes size={18} /></span>
            {isExpanded && <span className="label">Switch module</span>}
          </li>
          <li key="settings-modal-trigger"
            onClick={handleOpenSettingsModal}
            className={`menuselect ${isSettingsModalOpen ? "selected" : ""}`} // Có thể thêm class selected nếu muốn highlight khi modal mở
            title="Settings"
            aria-label="Open Settings"> {/* Sử dụng key khác để tránh trùng lặp */}
            <span className="icon"><Settings size={18} /></span>
            {isExpanded && <span className="label">Settings</span>}
          </li>
          <li key="user"
            onClick={logoutUser}
            className={`menuselect ${isSettingsModalOpen ? "selected" : ""}`} // Có thể thêm class selected nếu muốn highlight khi modal mở
            title="Account"
            aria-label="Account"
          > {/* Sử dụng key khác để tránh trùng lặp */}
            <span className="icon"><CircleUserRound size={18} /></span>
            {isExpanded && <span className="label">Account Setting</span>}
          </li>
        </ul>
      </div>
      {isSettingsModalOpen && <SettingsModal onClose={handleCloseSettingsModal} />}
    </nav>
  );
};

export default Sidebar;
