// src/components/StackedViewModal.jsx

// import React from 'react';
// import { createPortal } from 'react-dom';
// import { Undo2 } from 'lucide-react';

const StackedViewModal = ({ isOpen, onClose, children, title, style, className }) => {
  if (!isOpen) return null;

  return ( //createPortal()
    <div className= {className}
      style={ style}
    >
      {children}
    </div>
    //,document.body 
  );
};

export default StackedViewModal;