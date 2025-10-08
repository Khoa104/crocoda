// src/components/Portal.jsx

import React from 'react';
import { createPortal } from 'react-dom';
// import { Undo2 } from 'lucide-react';

const Portal = ({ isOpen, onClose, children, title, style, className, container }) => {
    if (!isOpen) return null;

    const defaultStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    };
    const combinedStyle = style ? { ...defaultStyle, ...style } : defaultStyle;
    const portalTarget = container || document.body;
    return createPortal(
        <div className={className} style={combinedStyle}>
            <div style={{
                backgroundColor: 'var(--bg-body)',
                padding: '20px',
                borderRadius: '8px',
                width: 'clamp(300px, 80%, 700px)', // Kích thước responsive
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5em' }}>{title}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#555' }}>
                        &times;
                    </button>
                </div>
                {children}
            </div>
        </div>
        , portalTarget
    );
};

export default Portal;