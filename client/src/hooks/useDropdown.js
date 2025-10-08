// src/hooks/useDropdown.js
// Why was it created? To allow set trigger ref for buttons which on/off the dropdown
import { useState, useRef, useEffect } from 'react';

export const useDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef(null);
    const panelRef = useRef(null);

    const toggle = () => setIsOpen(prev => !prev);
    const close = () => setIsOpen(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Đóng dropdown nếu click ra ngoài cả nút trigger và panel
            // panelRef.current giờ đây sẽ trỏ đến div của DropdownPanel
            if (
                triggerRef.current && !triggerRef.current.contains(event.target) &&
                panelRef.current && !panelRef.current.contains(event.target)
            ) {
                close();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]); // Phụ thuộc vào isOpen để chỉ lắng nghe khi dropdown mở

    return {
        isOpen,
        toggle,
        close,
        triggerRef,
        panelRef
    };
};