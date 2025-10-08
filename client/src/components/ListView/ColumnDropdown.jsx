// components/ ColumnDropdown.jsx
import React from 'react';
import { useDropdown } from '../../hooks/useDropdown';
import DropdownPanel from '../DropdownPanel';


const ColumnDropdown = ({ children, col, onSortChange, onGroupChange, sortArrow, groupCheck, sortConfig, groupConfig, onShowFilterPanel }) => {
    const { isOpen, toggle, close, triggerRef, panelRef } = useDropdown();
    const handleGroupChange = (field) => {
        const existingGroupIndex = groupConfig.findIndex(item => item.field === field.id);
        let newConfig;

        if (existingGroupIndex > -1) {
            newConfig = groupConfig.filter(item => item.field !== field.id);
        } else {
            // newConfig = [...groupConfig, { field: field.id, direction: 'asc', name: field.label }];
            newConfig = [{ field: field.id }];
        }

        onGroupChange(newConfig.map(({ field }) => ({ field })));
    };
    return (
        <div className='column-head' style={{ position: 'relative', display: 'block' }}>

            <div ref={triggerRef} onClick={toggle}
                style={{  display: 'flex', alignItems: 'center', gap: '12px' }}
            >
                <span className="column-label-text">
                    {col.label}
                </span>
                {col.isSortable && (sortArrow)}
            </div>
            {isOpen && (
                <DropdownPanel
                    className="selected-actions-dropdown"
                    isOpen={isOpen}
                    onClose={close}
                    ref={panelRef}
                >
                    <div className="dropdown-content" onClick={(e) => e.stopPropagation()}>
                        <div className="dropdown-menu-items" >
                            <div className='dropdown-item' onClick={(e) => onSortChange(col.id, col.isSortable)}>
                                <span className={`priority-number`}>
                                    {sortArrow}
                                </span>
                                <div className="dropdown-item-content">
                                    <span>Sort</span>
                                </div>
                                <div className="sort-direction">

                                </div>
                            </div>
                            <div className='dropdown-item' onClick={() => handleGroupChange(col)}>
                                <span className={`priority-number`}>
                                    {groupCheck}
                                </span>
                                <div className="dropdown-item-content">
                                    <span>Group by {col.label}</span>
                                </div>
                                <div className="sort-direction">

                                </div>
                            </div>
                            <div className='dropdown-item' onClick={onShowFilterPanel}>
                                <span className={`priority-number`}>
                                    {/* {sortArrow} */}
                                </span>
                                <div className="dropdown-item-content">
                                    <span>Filter by</span>
                                </div>
                                <div className="sort-direction">

                                </div>
                            </div>

                        </div>
                    </div>



                    {children}
                </DropdownPanel>
            )}

            
        </div>
        
    );
};

export default ColumnDropdown;
