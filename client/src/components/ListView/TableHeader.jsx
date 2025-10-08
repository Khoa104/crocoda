// src/pages/scm/components/TableHeader.jsx
import React, { useCallback, useRef, useState, useEffect } from 'react';
import * as LucideIcons from "lucide-react";
import ColumnDropdown from './ColumnDropdown';
import { useDropdown } from '../../hooks/useDropdown';


/**
 * Component Header của bảng, quản lý logic kéo thả, thay đổi kích thước cột,
 * và hiển thị dropdown tùy chỉnh cột.
 */
function TableHeader({
    orderedVisibleColumns,
    columnWidths,
    onColumnOrderChange,
    onColumnWidthChange,
    onSelectAllChange,
    isAllSelected,
    selectedItemIds,
    appliedSorts,
    onSortChange,
    appliedGroups,
    onGroupChange,
    onToggleColumnVisibility,
    columnDefinitions,
    onShowFilterPanel,
}) {
    // States for Column Drag & Drop Reordering
    const [draggedColId, setDraggedColId] = useState(null);
    const [dragOverColId, setDragOverColId] = useState(null);

    // States for Column Resizing - Các state này được quản lý nội bộ tại đây
    const [resizingColId, setResizingColId] = useState(null);
    const [startResizeX, setStartResizeX] = useState(0);
    const [startColumnWidth, setStartColumnWidth] = useState(0);



    // --- Column Drag & Drop Handlers ---
    const handleDragStart = useCallback((e, colId) => {
        const column = columnDefinitions.find(c => c.id === colId);
        if (column && !column.isDraggable) {
            e.preventDefault();
            return;
        }
        setDraggedColId(colId);
        console.log('draggedColId', colId);
        console.log(orderedVisibleColumns);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', colId);
        e.currentTarget.classList.add('dragging-col');
    }, [columnDefinitions, draggedColId]);

    const handleDragEnter = useCallback((e, colId) => {
        e.preventDefault();
        if (draggedColId === colId || !draggedColId) return;
        const column = columnDefinitions.find(c => c.id === colId);
        if (column && !column.isDraggable) return;
        setDragOverColId(colId);
        console.log('DragOverColId', colId);
    }, [draggedColId, columnDefinitions]);

    const handleDragOver = useCallback((e) => {
        // RẤT QUAN TRỌNG: Gọi preventDefault để cho phép sự kiện onDrop được kích hoạt
        e.preventDefault();
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setDragOverColId(null);
        console.log('leave');
    }, []);

    const handleDrop = useCallback((e, droppedOnColId) => {
        e.preventDefault();
        console.log('drop1');
        if (!draggedColId || draggedColId === droppedOnColId) return;
        console.log('drop2');
        const column = columnDefinitions.find(c => c.id === droppedOnColId);
        if (column && !column.isDraggable) return;

        const newOrder = [...orderedVisibleColumns];
        const draggedIndex = newOrder.findIndex(col => col.id === draggedColId);
        const droppedIndex = newOrder.findIndex(col => col.id === droppedOnColId);

        if (draggedIndex === -1 || droppedIndex === -1) return;

        const [removed] = newOrder.splice(draggedIndex, 1);
        newOrder.splice(droppedIndex, 0, removed);

        onColumnOrderChange(newOrder);
        console.log('drop', newOrder);
        setDraggedColId(null);
        setDragOverColId(null);
    }, [draggedColId, orderedVisibleColumns, onColumnOrderChange, columnDefinitions]);

    const handleDragEnd = useCallback((e) => {
        e.currentTarget.classList.remove('dragging-col');
        setDraggedColId(null);
        setDragOverColId(null);
        console.log('end');
    }, []);

    // --- Column Resizing Handlers ---
    const handleMouseDownResize = useCallback((e, colId, initialWidth) => {
        e.stopPropagation();
        setResizingColId(colId);
        setStartResizeX(e.clientX);
        setStartColumnWidth(initialWidth);
        document.body.style.cursor = 'col-resize';
    }, []);

    const handleMouseMoveResize = useCallback((e) => {
        if (resizingColId) {
            const deltaX = e.clientX - startResizeX;
            const newWidth = Math.max(40, startColumnWidth + deltaX);
            onColumnWidthChange(resizingColId, newWidth);
        }
    }, [resizingColId, startResizeX, startColumnWidth, onColumnWidthChange]);

    const handleMouseUpResize = useCallback(() => {
        setResizingColId(null);
        setStartResizeX(0);
        setStartColumnWidth(0);
        document.body.style.cursor = '';
    }, []);

    useEffect(() => {
        if (resizingColId) {
            document.addEventListener('mousemove', handleMouseMoveResize);
            document.addEventListener('mouseup', handleMouseUpResize);
            return () => {
                document.removeEventListener('mousemove', handleMouseMoveResize);
                document.removeEventListener('mouseup', handleMouseUpResize);
            };
        }
    }, [resizingColId, handleMouseMoveResize, handleMouseUpResize]);

    const handleSortOptionClick = useCallback((colId, direction) => {
        const existingSort = appliedSorts.find(item => item.field === colId);
        if (existingSort) {
            onSortChange([{ field: colId, direction: existingSort.direction === 'asc' ? 'desc' : 'asc' }]);
        } else {
            onSortChange([{ field: colId, direction: 'asc' }]);
        }
    }, [onSortChange, appliedSorts]);


    return (
        <thead className="data-table__header">
            <tr>
                {orderedVisibleColumns.map(col => (
                    <th
                        className={`data-table__th ${col.id === 'select' ? 'select-column' : ''} ${col.isSortable ? 'sortable-header' : ''} ${draggedColId === col.id ? 'dragging-col' : ''} ${dragOverColId === col.id ? 'drag-over' : ''}`}
                        style={{ width: `${columnWidths[col.id]}px` }}
                        key={col.id}
                    >
                        <div
                            className="column-header-content"
                            key={col.id}
                            draggable={!!col.isDraggable}
                            onDragStart={(e) => col.isDraggable && handleDragStart(e, col.id)}
                            onDragEnter={(e) => col.isDraggable && handleDragEnter(e, col.id)}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => col.isDraggable && handleDrop(e, col.id)}
                            onDragEnd={handleDragEnd}
                        >
                            {col.id === 'select' ? (
                                <input
                                    type="checkbox"
                                    onChange={onSelectAllChange}
                                    checked={isAllSelected}
                                    ref={el => {
                                        if (el) {
                                            el.indeterminate = selectedItemIds.size > 0 && !isAllSelected;
                                        }
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            ) : (
                                <>
                                    <ColumnDropdown
                                        col={col}
                                        onSortChange={handleSortOptionClick}
                                        onGroupChange={onGroupChange}
                                        sortArrow={(() => {
                                            const sort = appliedSorts.find(s => s.field === col.id);
                                            if (!sort) return null;
                                            return sort.direction === 'asc' ? <LucideIcons.ArrowUp size={14} /> : <LucideIcons.ArrowDown size={14} />;
                                        })()}
                                        groupCheck={(() => {
                                            const group = appliedGroups.find(g => g.field === col.id);
                                            if (!group) return null;
                                            return <LucideIcons.Check size={14} />;
                                        })()}
                                        groupConfig={appliedGroups}
                                        onHideColumnClick={onToggleColumnVisibility}
                                        onShowFilterPanel ={onShowFilterPanel}
                                    />
                                </>
                            )}
                        </div>
                        {!!col.isResizable && (
                            <div
                                className="resizer"
                                onMouseDown={(e) => handleMouseDownResize(e, col.id, columnWidths[col.id])}
                            />
                        )}
                    </th>
                ))}
            </tr>
        </thead>
    );
}

export default TableHeader;