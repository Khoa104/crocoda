// src/pages/ModuleSelectPage
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import "../../styles/ModuleSelectPage.css";
import { AuthContext } from "../../contexts/AuthContext";
import { getAllModules } from "../../api/api";
import NProgress from 'nprogress';

const ModuleSelectPage = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const { modules: allowedmodules } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const handleSelect = (modKey) => {
    localStorage.setItem("selectedModule", modKey);
    navigate(`/${modKey.toLowerCase()}/${modKey.toLowerCase()}-home`);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      NProgress.start();
      try {
        const res = await getAllModules();
        setModules(res);
      } catch (error) {
        console.error("Failed to fetch data:", error.message);
      } finally {
        setLoading(false);
         NProgress.done();
      }
    };
    fetchData();
  }, [])

  return (
    <div className="module-select-page">
      <h2>Select Module</h2>
        <div className="card-container">
          {modules.map((mod) => {
            const Icon = LucideIcons[mod.icon] || LucideIcons.Box
            return (
              <div
                key={mod.module_key}
                className={`module-card ${!allowedmodules.includes(mod.module_key) ? "disabled" : ""}`}
                onClick={() => {
                  if (allowedmodules.includes(mod.module_key)) {
                    handleSelect(mod.module_key);
                  }
                }}
              >
                <div className="icon"><Icon size={40} /></div>
                <h3>{mod.module_label}</h3>

              </div>
            )
          })}
        </div>

    </div>
  );
};

export default ModuleSelectPage;
