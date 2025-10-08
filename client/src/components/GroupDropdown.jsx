// src/components/GroupDropdown.jsx
import React, { useState, forwardRef } from 'react';
import * as LucideIcons from "lucide-react";
import "./GroupDropdown.css"
import DropdownPanel from './DropdownPanel';

const GroupDropdown = forwardRef(({ isOpen, onClose, className, availableFields, onChange, groupConfig }, ref) => {

    const handleGroupChange = (field) => {
        const existingGroupIndex = groupConfig.findIndex(item => item.field === field.id);
        let newConfig;

        if (existingGroupIndex > -1) {
            newConfig = groupConfig.filter(item => item.field !== field.id);
        } else {
            newConfig = [...groupConfig, { field: field.id, direction: 'asc', name: field.label }];
        }

        onChange(newConfig.map(({ field }) => ({ field })));
    };

    const handleClearAll = () => {
        onChange([]);
        //onClose(); // Thêm dòng này để đóng dropdown sau khi xóa
    };
    
    return (
        <DropdownPanel 
            isOpen={isOpen} 
            onClose={onClose} 
            className={`group-dropdown${className ? ' ' + className : ''}`}
            ref={ref} // Truyền ref từ cha xuống DropdownPanel
        >
            <div className="dropdown-content" onClick={(e) => e.stopPropagation()}>
                <div className="dropdown-title">
                    <h3>Group</h3>
                    {groupConfig.length > 0 && (
                        <li className="clear-button group" onClick={handleClearAll}>
                            <div className="icon-stack">
                                <LucideIcons.ListCollapse size={16} />
                                <LucideIcons.X size={12} className="icon-x-overlay" />
                            </div>
                        </li>
                    )}
                </div>
                <div className="dropdown-menu-items" >
                    {availableFields.length === 0 && (
                        <div className="dropdown-label">
                            No field to group
                        </div>
                    )}

                    {availableFields.map((field) => {
                        const groupedItem = groupConfig.find(item => item.field === field.id);
                        const isGrouped = !!groupedItem;
                        const priority = isGrouped ? groupConfig.findIndex(item => item.field === field.id) + 1 : null;

                        return (
                            <div
                                key={field.id}
                                onClick={() => handleGroupChange(field)}
                                className="dropdown-item"
                            >
                                <div className="dropdown-item-content">
                                    <span className={`priority-number ${!isGrouped ? 'hidden-priority' : ''}`}>
                                        {priority}
                                    </span>
                                    <span className={isGrouped ? "selected-field-name" : ""}>{field.label}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </DropdownPanel>
    );
});

export default GroupDropdown;