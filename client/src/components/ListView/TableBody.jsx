// src/pages/scm/components/TableBody.jsx
import React, { forwardRef, useState, useCallback } from 'react';
import * as LucideIcons from "lucide-react";
import { highlightText, formatDate } from '../../utils/filterUtils';

/**
 * Component thân bảng, xử lý việc hiển thị dữ liệu đã được nhóm.
 */
const TableBody = forwardRef(({
    data,
    loading,
    selectedItemIds,
    onItemSelectChange,
    onOpenDetailView,
    appliedGroups,
    groupableFields,
    orderedVisibleColumns,
    columnWidths,
    getFieldValue,
    idField,
    searchTerm,
}, ref) => {
    const [expandedGroups, setExpandedGroups] = useState(new Set());

    const toggleGroupExpansion = useCallback((groupKey) => {
        setExpandedGroups(prev => {
            const newSet = new Set(prev);
            if (newSet.has(groupKey)) {
                newSet.delete(groupKey);
            } else {
                newSet.add(groupKey);
            }
            return newSet;
        });
    }, []);

    const renderGroupedContent = ({ itemsOrGroups, level = 0 }) => {
        // If this is an array of items (final grouping level or no grouping)
        if (!appliedGroups || appliedGroups.length === 0 || level >= appliedGroups.length) {
            return itemsOrGroups.map(item => (
                <tr
                    key={getFieldValue(item, idField)}
                    className={`data-table__row ${selectedItemIds.has(getFieldValue(item, idField)) ? 'selected-row' : ''}`}
                    onClick={(event) => onItemSelectChange(getFieldValue(item, idField), event)}
                    onDoubleClick={() => onOpenDetailView(getFieldValue(item, idField), item)}
                    style={{ cursor: 'pointer' }}
                >
                    {orderedVisibleColumns.map(col => {
                        const fieldValue = getFieldValue(item, col.id);
                        if (col.id === 'select') {
                            return (
                                <td key={col.id} className="data-table__td select-column" style={{ width: `${columnWidths[col.id]}px` }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedItemIds.has(getFieldValue(item, idField))}
                                        onChange={(event) => onItemSelectChange(getFieldValue(item, idField), event)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </td>
                            );
                        }
                        if (col.type === 'status') {
                            const isActive = fieldValue === 1 || fieldValue === 'active' || fieldValue === 'Active' || fieldValue === true;
                            return (
                                <td key={col.id} className="data-table__td" style={{ width: `${columnWidths[col.id]}px` }}>
                                    <span className={`status-badge ${isActive ? 'status-badge--active' : 'status-badge--inactive'}`}>
                                        {isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                            );
                        }
                        if (col.type === 'date') {
                            return (
                                <td key={col.id} className="data-table__td" style={{ width: `${columnWidths[col.id]}px` }}>
                                    {formatDate(fieldValue)}
                                </td>
                            );
                        }
                        return (
                            <td key={col.id} className="data-table__td" style={{ width: `${columnWidths[col.id]}px` }}>
                                {highlightText(fieldValue, searchTerm)}
                            </td>
                        );
                    })}
                </tr>
            ));
        }

        // If this is an array of groups
        return itemsOrGroups.map(group => {
            const groupFieldDefinition = groupableFields?.find(f => f.id === group.field);
            const groupLabel = groupFieldDefinition ? groupFieldDefinition.label : group.field;
            let displayGroupValue = group.groupValue === null || group.groupValue === undefined || group.groupValue === '' ? '[Empty]' : String(group.groupValue);
            
            const colDefForGroup = orderedVisibleColumns.find(c => c.id === group.field);
            if (colDefForGroup && colDefForGroup.type === 'date') {
                displayGroupValue = formatDate(group.groupValue);
            }

            const groupKey = `${group.field}-${group.groupValue}`;
            const isExpanded = expandedGroups.has(groupKey);

            return (
                <React.Fragment key={groupKey}>
                    <tr className="group-header-row" onClick={() => toggleGroupExpansion(groupKey)}>
                        <td colSpan={orderedVisibleColumns.length} style={{ '--group-level': level }}>
                            <h4 className="group-header-title">
                                {isExpanded ? <LucideIcons.ChevronDown size={16} /> : <LucideIcons.ChevronRight size={16} />}
                                {groupLabel}: <span>{highlightText(displayGroupValue, searchTerm)}</span> ({group.items ? group.items.length : (group.subgroups ? group.subgroups.length : 0)} items)
                            </h4>
                        </td>
                    </tr>
                    {isExpanded && (
                        group.items && group.items.length > 0 && renderGroupedContent({ itemsOrGroups: group.items, level: level + 1 })
                    )}
                    {isExpanded && (
                        group.subgroups && group.subgroups.length > 0 && renderGroupedContent({ itemsOrGroups: group.subgroups, level: level + 1 })
                    )}
                </React.Fragment>
            );
        });
    };

    return (
        <tbody ref={ref}>
            {loading ? (
                <tr>
                    <td colSpan={orderedVisibleColumns.length} className="data-table__empty-state">Loading...</td>
                </tr>
            ) : (
                data.length > 0 ? (
                    renderGroupedContent({ itemsOrGroups: data })
                ) : (
                    <tr>
                        <td colSpan={orderedVisibleColumns.length} className="data-table__empty-state">No items were found.</td>
                    </tr>
                )
            )}
        </tbody>
    );
});

export default TableBody;
