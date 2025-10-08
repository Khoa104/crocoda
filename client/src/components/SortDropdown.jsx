// src/components/SortDropdown.jsx
import React, { useState, forwardRef } from 'react';
import * as LucideIcons from "lucide-react";
import "./SortDropdown.css"
import DropdownPanel from './DropdownPanel';

const SortDropdown = forwardRef(({ isOpen, onClose, className, availableFields, onChange, sortConfig=[] }, ref) => {

    const handleSortChange = (field) => {
        const existingSortIndex = sortConfig.findIndex(item => item.field === field.id);
        let newConfig;

        if (existingSortIndex > -1) {
            newConfig = sortConfig.filter(item => item.field !== field.id);
        } else {
            newConfig = [...sortConfig, { field: field.id, direction: 'asc', name: field.label }];
        }

        onChange(newConfig.map(({ field, direction }) => ({ field, direction })));
    };

    const toggleDirection = (fieldId) => {
        const newConfig = sortConfig.map(item =>
            item.field === fieldId
                ? { ...item, direction: item.direction === 'asc' ? 'desc' : 'asc' }
                : item
        );

        onChange(newConfig.map(({ field, direction }) => ({ field, direction })));
    };

    const handleClearAll = () => {
        onChange([]);
        //onClose(); // Thêm dòng này để đóng dropdown sau khi xóa
    };

    return (
        <DropdownPanel
            isOpen={isOpen}
            onClose={onClose}
            className={`sort-dropdown${className ? ' ' + className : ''}`}
            ref={ref} // Truyền ref từ cha xuống DropdownPanel
        >
            <div className="dropdown-content" onClick={(e) => e.stopPropagation()}>
                <div className="dropdown-title">
                    <h3>Sort</h3>
                    {sortConfig.length > 0 && (
                        <li className="clear-button sort" onClick={handleClearAll}>
                            <div className="icon-stack">
                                <LucideIcons.ArrowDownWideNarrow size={16} />
                                <LucideIcons.X size={12} className="icon-x-overlay" />
                            </div>
                        </li>
                    )}
                </div>
                <div className="dropdown-menu-items" >
                    {availableFields.length === 0 && (
                        <div className="dropdown-label">
                            No field to sort
                        </div>
                    )}

                    {availableFields.map((field) => {
                        const sortedItem = sortConfig.find(item => item.field === field.id);
                        const isSorted = !!sortedItem;
                        const priority = isSorted ? sortConfig.findIndex(item => item.field === field.id) + 1 : null;

                        return (
                            <div
                                key={field.id}
                                onClick={() => handleSortChange(field)}
                                className="dropdown-item"
                            >
                                <div className="dropdown-item-content">
                                    <span className={`priority-number ${!isSorted ? 'hidden-priority' : ''}`}>
                                        {priority}
                                    </span>
                                    <span className={isSorted ? "selected-field-name" : ""}>{field.label}</span>
                                </div>
                                {isSorted && (
                                    <li
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleDirection(field.id);
                                        }}
                                        className="sort-direction-toggle"
                                        aria-label={`Toggle sort direction for ${field.label}`}
                                    >
                                        {sortedItem.direction === 'asc' ?  <LucideIcons.ArrowBigUp size={12} /> : <LucideIcons.ArrowBigDown size={12} /> }
                                    </li>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </DropdownPanel>
    );
});

export default SortDropdown;