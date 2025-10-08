// src/components/Modal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import * as LucideIcons from "lucide-react";
import "./Modal.css"

const Modal = ({ isOpen, onClose, children, title, style, className, container, onCancel, onClear, onApply }) => {
    if (!isOpen) return null;

    const defaultStyle = {
    };

    const portalTarget = container || document.body;

    const combinedStyle = style ? { ...defaultStyle, ...style } : defaultStyle;
    return createPortal(
        <div className="modal-overlay">
            <div className={`modal-content${className ? ' ' + className : ''}`} style={combinedStyle}>
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button className="modal-close-button" onClick={onClose} aria-label="Close">
                        <LucideIcons.X size={20} />
                    </button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
                <div className="modal-footer">
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
        </div>
        , portalTarget
    );
};


export default Modal;