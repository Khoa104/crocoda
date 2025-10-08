// client/src/contexts/ThemeContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

export const ThemeContext = createContext(); // Giữ lại export này nếu muốn dùng Lựa chọn 1

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    // Xóa class cũ trước khi thêm class mới để tránh lỗi
    document.body.classList.remove('light', 'dark-mode');
    // Thêm class phù hợp
    document.body.classList.add(theme === 'dark' ? 'dark-mode' : 'light');
    // Đặt attribute data-theme trên thẻ html để có thể sử dụng trong CSS
    document.documentElement.setAttribute('data-theme', theme);
    // Lưu theme hiện tại vào localStorage
    localStorage.setItem('theme', theme);
  }, [theme]); // Chạy lại effect khi biến theme thay đổi

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};