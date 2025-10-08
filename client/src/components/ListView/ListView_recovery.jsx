// src/pages/scm/views/ListView.jsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import * as LucideIcons from "lucide-react";
import { extractAllItemIds, formatDate, highlightText } from '../../utils/filterUtils';
import { useDropdown } from '../../hooks/useDropdown';
import DropdownPanel from '../DropdownPanel';
import ColumnDropdown from '../ColumnDropdown';

/**
 * Component ListView hiển thị dữ liệu dưới dạng bảng,
 * hỗ trợ lọc, sắp xếp, nhóm, và tùy chỉnh cột (kéo thả, thay đổi kích thước, ẩn/hiện)
 * một cách tổng quát.
 *
 * @param {object} props - Các props của component.
 * @param {Array<object>} props.data - Mảng các đối tượng dữ liệu (sản phẩm, đơn hàng, v.v.).
 * @param {boolean} props.loading - Trạng thái tải dữ liệu.
 * @param {Set<string>} props.selectedItemIds - Tập hợp các ID của các mục đã chọn.
 * @param {function} props.onItemSelectChange - Hàm callback khi trạng thái chọn mục thay đổi (itemId, event).
 * @param {function} props.onSelectAllChange - Hàm callback khi trạng thái chọn tất cả mục thay đổi.
 * @param {function} props.onOpenDetailView - Hàm callback để mở chi tiết mục trong StackedView (itemId, itemData).
 * @param {Array<object>} props.appliedGroups - Cấu hình các trường nhóm đang được áp dụng.
 * @param {Array<object>} props.groupableFields - Định nghĩa các trường có thể nhóm (để lấy nhãn hiển thị).
 * @param {Array<object>} props.columnDefinitions - Định nghĩa TẤT CẢ các cột có thể có (bao gồm isDraggable, isResizable).
 * @param {object} props.columnWidths - Đối tượng map ID cột với chiều rộng (px).
 * @param {function} props.onSortChange - Hàm callback để yêu cầu sắp xếp.
 * @param {object} props.appliedSorts - Cấu hình sắp xếp đang được áp dụng { field, direction }.
 * @param {function} props.onColumnOrderChange - Callback để thông báo thay đổi thứ tự cột (cho ProductsList).
 * @param {function} props.onColumnWidthChange - Callback để thông báo thay đổi chiều rộng cột (cho ProductsList).
 * @param {function} props.onToggleColumnVisibility - Callback để thông báo thay đổi hiển thị cột (cho ProductsList).
 * @param {string} props.idField - Tên trường ID duy nhất trong mỗi đối tượng dữ liệu (ví dụ: 'item_id', 'poId').
 * @param {function} props.getFieldValue - Hàm trợ giúp để lấy giá trị trường, bao gồm các trường lồng nhau.
 */
function ListView({
  data,
  loading,
  selectedItemIds,
  onItemSelectChange,
  onSelectAllChange,
  onOpenDetailView,
  appliedGroups,
  groupableFields,
  columnDefinitions,
  columnWidths,
  onSortChange,
  onGroupChange,
  appliedSorts,
  onColumnOrderChange,
  onColumnWidthChange,
  onToggleColumnVisibility,
  getFieldValue,
  idField,
  searchTerm,
}) {

  const allSelectableProductIds = extractAllItemIds(data, 'item_id');
  const isAllSelected = allSelectableProductIds.length > 0 &&
    allSelectableProductIds.every(item => selectedItemIds.has(item));
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  // States for Column Drag & Drop Reordering
  const [draggedColId, setDraggedColId] = useState(null);
  const [dragOverColId, setDragOverColId] = useState(null);
  const tableRef = useRef(null); // Ref to the table for cursor changes

  // States for Column Resizing
  const [resizingColId, setResizingColId] = useState(null);
  const [startResizeX, setStartResizeX] = useState(0);
  const [startColumnWidth, setStartColumnWidth] = useState(0);

  // State for Column Header Dropdown
  const [showColumnDropdownId, setShowColumnDropdownId] = useState(null);
  const dropdownRefs = useRef({}); // Ref to store dropdown elements for click-outside

  // Local state for the current display order of columns.
  const [orderedVisibleColumns, setOrderedVisibleColumns] = useState([]);

  // useDropdown
  const useDropdown_Column = useDropdown();

  // Effect to update local orderedVisibleColumns when columnDefinitions or columnWidths change
  useEffect(() => {
    // Filter columns based on visibility (implicit from columnWidths having a width for them)
    // and use the order provided by the parent via columnDefinitions (which is already ordered)
    const orderedAndFiltered = columnDefinitions
      .filter(col => columnWidths[col.id] !== undefined); // Assuming width exists means visible
    setOrderedVisibleColumns(orderedAndFiltered);
  }, [columnDefinitions, columnWidths]);


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

  // Hàm xử lý khi nhấp vào tiêu đề cột để sắp xếp
  const handleSortChange = useCallback((columnId, isSortable) => {
    if (!isSortable) return;
    // setShowColumnDropdownId(null);
    const existingSort = appliedSorts.find(item => item.field === columnId);
    if (existingSort) {
      onSortChange([{ field: columnId, direction: existingSort.direction === 'asc' ? 'desc' : 'asc' }]);
    } else {
      onSortChange([{ field: columnId, direction: 'asc' }]);
    }
  }, [appliedSorts, onSortChange]);


  // --- Column Drag & Drop Handlers ---
  const handleDragStart = useCallback((e, colId) => {
    const column = columnDefinitions.find(c => c.id === colId);
    if (column && !column.isDraggable) {
      e.preventDefault();
      return;
    }
    setDraggedColId(colId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', colId);
    e.currentTarget.classList.add('dragging-col');
  }, [columnDefinitions]);

  const handleDragEnter = useCallback((e, colId) => {
    e.preventDefault();
    if (draggedColId === colId || !draggedColId) return;
    const column = columnDefinitions.find(c => c.id === colId);
    if (column && !column.isDraggable) return;

    setDragOverColId(colId);
  }, [draggedColId, columnDefinitions]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOverColId(null);
  }, []);

  const handleDrop = useCallback((e, droppedOnColId) => {
    e.preventDefault();
    if (!draggedColId || draggedColId === droppedOnColId) return;

    const column = columnDefinitions.find(c => c.id === droppedOnColId);
    if (column && !column.isDraggable) return;

    const newOrder = [...orderedVisibleColumns];
    const draggedIndex = newOrder.findIndex(col => col.id === draggedColId);
    const droppedIndex = newOrder.findIndex(col => col.id === droppedOnColId);

    if (draggedIndex === -1 || droppedIndex === -1) return;

    const [removed] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(droppedIndex, 0, removed);

    setOrderedVisibleColumns(newOrder);
    onColumnOrderChange(newOrder.map(col => col.id));
    setDraggedColId(null);
    setDragOverColId(null);
  }, [draggedColId, orderedVisibleColumns, onColumnOrderChange, columnDefinitions]);

  const handleDragEnd = useCallback((e) => {
    e.currentTarget.classList.remove('dragging-col');
    setDraggedColId(null);
    setDragOverColId(null);
  }, []);


  // --- Column Resizing Handlers ---
  const handleMouseDownResize = useCallback((e, colId, initialWidth) => {
    e.stopPropagation();
    console.log('resize');
    setResizingColId(colId);
    setStartResizeX(e.clientX);
    setStartColumnWidth(initialWidth);

    document.body.style.cursor = 'col-resize';
    if (tableRef.current) {
      tableRef.current.style.userSelect = 'none';
    }

    document.addEventListener('mousemove', handleMouseMoveResize);
    document.addEventListener('mouseup', handleMouseUpResize);
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
    if (tableRef.current) {
      tableRef.current.style.userSelect = '';
    }
    document.removeEventListener('mousemove', handleMouseMoveResize);
    document.removeEventListener('mouseup', handleMouseUpResize);
  }, []);


  // --- Column Header Dropdown Handlers ---
  const handleToggleColumnDropdown = useCallback((colId, event) => {
    event.stopPropagation();
    if (showColumnDropdownId === colId) {
      setShowColumnDropdownId(null);
    } else {
      setShowColumnDropdownId(colId);
    }
  }, [showColumnDropdownId]);

  // Handle click outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showColumnDropdownId && dropdownRefs.current[showColumnDropdownId] &&
        !dropdownRefs.current[showColumnDropdownId].contains(event.target)) {
        setShowColumnDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColumnDropdownId]);

  const handleSortOptionClick = useCallback((colId, direction) => {
    onSortChange([{ field: colId, direction: direction }]);
    setShowColumnDropdownId(null);
  }, [onSortChange]);

  const handleHideColumnClick = useCallback((colId) => {
    onToggleColumnVisibility(colId);
    setShowColumnDropdownId(null);
  }, [onToggleColumnVisibility]);


  // Tạo một đối tượng commonProps để truyền xuống hàm đệ quy renderGroupedContent
  const commonProps = {
    selectedItemIds,
    onItemSelectChange,
    onOpenDetailView,
    appliedGroups,
    groupableFields,
    expandedGroups,
    columnDefinitions,
    toggleGroupExpansion,
    orderedVisibleColumns,
    columnWidths,
    getFieldValue,
    idField,
  };


  const renderGroupedContent = ({ itemsOrGroups, level = 0, commonProps }) => {
    // If this is an array of items (final grouping level or no grouping)
    if (!commonProps.appliedGroups || commonProps.appliedGroups.length === 0 || level >= commonProps.appliedGroups.length) {
      return itemsOrGroups.map(item => (
        <tr
          key={commonProps.getFieldValue(item, commonProps.idField)}
          className={`data-table__row ${commonProps.selectedItemIds.has(commonProps.getFieldValue(item, commonProps.idField)) ? 'selected-row' : ''}`}
          onClick={(event) => commonProps.onItemSelectChange(commonProps.getFieldValue(item, commonProps.idField), event)} // Nhấp đơn để chọn/bỏ chọn
          // onClick={(event) => commonProps.onOpenDetailView(commonProps.getFieldValue(item, commonProps.idField), item)}
          onDoubleClick={(event) => commonProps.onOpenDetailView(commonProps.getFieldValue(item, commonProps.idField), item)}
          style={{ cursor: 'pointer' }}
        >
          {commonProps.orderedVisibleColumns.map(col => {
            const fieldValue = commonProps.getFieldValue(item, col.id);
            if (col.id === 'select') {
              return (
                <td key={col.id} className="data-table__td select-column" style={{ width: `${commonProps.columnWidths[col.id]}px` }}>
                  <input
                    type="checkbox"
                    checked={commonProps.selectedItemIds.has(commonProps.getFieldValue(item, commonProps.idField))}
                    onChange={(event) => commonProps.onItemSelectChange(commonProps.getFieldValue(item, commonProps.idField), event)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
              );
            }
            if (col.type === 'status') {
              const isActive = fieldValue === 1 || fieldValue === 'active' || fieldValue === 'Active' || fieldValue === true;
              return (
                <td key={col.id} className="data-table__td" style={{ width: `${commonProps.columnWidths[col.id]}px` }}>
                  <span className={`status-badge ${isActive ? 'status-badge--active' : 'status-badge--inactive'}`}>
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
              );
            }
            if (col.type === 'date') { // NEW: Handle date type formatting
              return (
                <td key={col.id} className="data-table__td" style={{ width: `${commonProps.columnWidths[col.id]}px` }}>
                  {formatDate(fieldValue)}
                </td>
              );
            }
            return (
              <td key={col.id} className="data-table__td" style={{ width: `${commonProps.columnWidths[col.id]}px` }}>
                {highlightText(fieldValue, searchTerm)}
              </td>
            );
          })}
        </tr>
      ));
    }

    // If this is an array of groups
    return itemsOrGroups.map(group => {
      // Lấy nhãn hiển thị cho trường nhóm từ groupableFields
      const groupFieldDefinition = commonProps.groupableFields?.find(f => f.id === group.field);
      const groupLabel = groupFieldDefinition ? groupFieldDefinition.label : group.field; // Sử dụng label nếu có, ngược lại dùng id
      let displayGroupValue = group.groupValue === null || group.groupValue === undefined || group.groupValue === '' ? '[Empty]' : String(group.groupValue);

      // NEW: Format group value if it's a date field

      const colDefForGroup = commonProps.columnDefinitions.find(c => c.id === group.field);
      if (colDefForGroup && colDefForGroup.type === 'date') {
        displayGroupValue = formatDate(group.groupValue);
      }

      const groupKey = `${group.field}-${group.groupValue}`;
      const isExpanded = commonProps.expandedGroups.has(groupKey);

      return (
        <React.Fragment key={groupKey}>
          <tr className="group-header-row" onClick={() => commonProps.toggleGroupExpansion(groupKey)}>
            <td colSpan={commonProps.orderedVisibleColumns.length} style={{ '--group-level': level }}>
              <h4 className="group-header-title">
                {isExpanded ? <LucideIcons.ChevronDown size={16} /> : <LucideIcons.ChevronRight size={16} />}
                {groupLabel}: <span>{highlightText(displayGroupValue, searchTerm)}</span> ({group.items ? group.items.length : (group.subgroups ? group.subgroups.length : 0)} items)
              </h4>
            </td>
          </tr>
          {isExpanded && (
            group.items && group.items.length > 0 && renderGroupedContent({ itemsOrGroups: group.items, level: level + 1, commonProps })
          )}
          {isExpanded && (
            group.subgroups && group.subgroups.length > 0 && renderGroupedContent({ itemsOrGroups: group.subgroups, level: level + 1, commonProps })
          )}
        </React.Fragment>
      );
    });
  };


  return (
    <div className="product-table-responsive">
      <table className="product-data-table" ref={tableRef}>
        <thead className="data-table__header">
          <tr>
            {orderedVisibleColumns.map(col => (
              <th
                key={col.id}
                className={`data-table__th ${col.id === 'select' ? 'select-column' : ''} ${col.isSortable ? 'sortable-header' : ''} ${draggedColId === col.id ? 'dragging-col' : ''} ${dragOverColId === col.id ? 'drag-over' : ''}`}
                style={{ width: `${columnWidths[col.id]}px` }}
                draggable={!!col.isDraggable}
                onDragStart={(e) => col.isDraggable && handleDragStart(e, col.id)}
                onDragEnter={(e) => col.isDraggable && handleDragEnter(e, col.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => col.isDraggable && handleDrop(e, col.id)}
                onDragEnd={handleDragEnd}
              >
                <div className="column-header-content">
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
                        onSortChange={handleSortChange}
                        onGroupChange={onGroupChange}
                        sortArrow={(() => {
                          const sort = appliedSorts.find(s => s.field === col.id);
                          if (!sort) {
                            return null
                            // <LucideIcons.ArrowUpDown size={14} className="text-gray-400" />;
                          }
                          return sort.direction === 'asc' ? (
                            <LucideIcons.ArrowUp size={14} />
                          ) : (
                            <LucideIcons.ArrowDown size={14} />
                          );
                        })()}
                        groupCheck={(() => {
                          const group = appliedGroups.find(g => g.field === col.id);
                          if (!group) {
                            return null
                            // <LucideIcons.ArrowUpDown size={14} className="text-gray-400" />;
                          } else
                            return (
                              <LucideIcons.Check size={14} />
                            )
                        })()}
                        groupConfig={appliedGroups}

                      />
                      {/* <button
                        className="column-dropdown-trigger"
                        ref={useDropdown_Column.triggerRef}
                        onClick={useDropdown_Column.toggle}
                        // onClick={(e) => handleToggleColumnDropdown(col.id, e)}
                        title="Tùy chọn cột"
                      >
                        <LucideIcons.ChevronDown size={14} />
                      </button>
                      {useDropdown_Column.isOpen && (
                        <DropdownPanel className="selected-actions-dropdown" isOpen={useDropdown_Column.isOpen}
                          onClose={useDropdown_Column.close}
                          ref={useDropdown_Column.panelRef}
                        >
                          <div className="column-header-dropdown" ref={el => dropdownRefs.current[col.id] = el}>
                            {col.isSortable && (
                              <>
                                <button onClick={() => handleSortOptionClick(col.id, 'asc')} className="dropdown-item">
                                  <LucideIcons.SortAsc size={16} className="mr-2" /> Sắp xếp A-Z
                                </button>
                                <button onClick={() => handleSortOptionClick(col.id, 'desc')} className="dropdown-item">
                                  <LucideIcons.SortDesc size={16} className="mr-2" /> Sắp xếp Z-A
                                </button>
                                <div className="dropdown-divider"></div>
                              </>
                            )}
                            {!col.isAlwaysVisible && (
                              <button onClick={() => handleHideColumnClick(col.id)} className="dropdown-item">
                                <LucideIcons.EyeOff size={16} className="mr-2" /> Ẩn cột
                              </button>
                            )}
                          </div>
                        </DropdownPanel>
                      )} */}
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
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={orderedVisibleColumns.length} className="data-table__empty-state">Loading...</td>
            </tr>
          ) : (
            data.length > 0 ? (
              renderGroupedContent({ itemsOrGroups: data, commonProps })
            ) : (
              <tr>
                <td colSpan={orderedVisibleColumns.length} className="data-table__empty-state">No items were found.</td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ListView;
