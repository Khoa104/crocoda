// SettingModal.jsx
import React from 'react';
import { useTheme } from '../contexts/ThemeContext'; // <-- Chỉ import hook này
import { X } from 'lucide-react';
import ReactDOM from 'react-dom';
import "../styles/SettingModal.css";

const SettingsModal = ({ onClose }) => {
  const { theme, toggleTheme } = useTheme(); // <-- Sử dụng hook đã export

  return ReactDOM.createPortal(
    <div className="setting-modal-overlay" onClick={onClose}>
      <div className="setting-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="setting-modal-header">
          <h2>Settings</h2>
          <button className="modal-close-button" onClick={onClose} aria-label="Close settings">
            <X size={20} />
          </button>
        </div>
        <div className="setting-modal-body">
          <div className="setting-item">
            <label htmlFor="darkModeToggle">Dark Mode</label>
            <input
              type="checkbox"
              id="darkModeToggle"
              checked={theme === 'dark'}
              onChange={toggleTheme}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SettingsModal;