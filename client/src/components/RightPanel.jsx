// src/components/RightPanel.jsx
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import * as LucideIcons from "lucide-react";

const RightPanel = ({ isOpen, onClose, children, title, style, className, container, onCancel, onClear, onApply }) => {
    if (!isOpen) return null;
    const [internalContainer, setInternalContainer] = useState(null);
    const defaultStyle = {

    };
    const defaultContainerRef = useRef(null);
    useEffect(() => {
        if (!container && defaultContainerRef.current) {
            setInternalContainer(defaultContainerRef.current.parentNode);
        }
    }, [container]);


    const portalTarget = container || internalContainer || document.body;

    const combinedStyle = style ? { ...defaultStyle, ...style } : defaultStyle;
    return createPortal(
        <div className={`right-panel${className ? ' ' + className : ''}`} style={combinedStyle}>
            <div className="panel-header">
                <h3>{title}</h3>
                <button onClick={onClose} className="close-panel-button">
                    <LucideIcons.X size={20} />
                </button>
            </div>
            <div className="panel-content">
                {children}
            </div>
            <div className="panel-footer">
                {onCancel && (
                    <button onClick={onCancel} className="panel-button Cancel-button">
                        Cancel
                    </button>
                )}
                {onClear && (
                    <button onClick={onClear} className="panel-button clear-button">
                        Clear
                    </button>
                )}
                {onApply && (
                    <button onClick={onApply} className="panel-button apply-button">
                        Apply
                    </button>
                )}
            </div>
        </div>
        , portalTarget
    );
};


export default RightPanel;