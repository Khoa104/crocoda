import React, { forwardRef } from 'react';
import * as LucideIcons from "lucide-react"; // Giữ nguyên icon nếu bạn dùng

// Sử dụng forwardRef để component có thể nhận và gán ref
const DropdownPanel = forwardRef(({ className, style, children, onClose, isOpen }, ref) => {

    if (!isOpen) return null;
    
    return (
        <div 
            className={`dropdown-panel${className ? ' ' + className : ''}`}
            style={style}
            ref={ref} // Gán ref từ props vào đây
        >
            {children}
        </div>
    );
});

export default DropdownPanel;