// src/pages/scm/ListView/ListView.jsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { extractAllItemIds } from '../../utils/filterUtils';
import TableHeader from './TableHeader';
import TableBody from './TableBody';
import './ListView.css';
import RightPanel from '../RightPanel';
import ColumnFilterPanel from '../ColumnFilterPanel';
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
  // Local state for the current display order of columns.
  const [orderedVisibleColumns, setOrderedVisibleColumns] = useState(() => {
    return columnDefinitions.filter(col => columnWidths[col.id] !== undefined);
  });

  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const handleColumnOrderChange = useCallback((newOrder) => {
    setOrderedVisibleColumns(newOrder);
    onColumnOrderChange(newOrder.map(col => col.id));
  }, [onColumnOrderChange]);

  const handleColumnWidthChange = useCallback((colId, newWidth) => {
    onColumnWidthChange(colId, newWidth);
  }, [onColumnWidthChange]);

  const allSelectableItemIds = extractAllItemIds(data, idField);
  const isAllSelected = allSelectableItemIds.length > 0 &&
    allSelectableItemIds.every(item => selectedItemIds.has(item));

  return (
    <div className="table-responsive" id='nextto-right-panel'>
      <table className="data-table">
        <TableHeader
          orderedVisibleColumns={orderedVisibleColumns}
          columnWidths={columnWidths}
          onColumnOrderChange={handleColumnOrderChange}
          onColumnWidthChange={handleColumnWidthChange}
          onSelectAllChange={onSelectAllChange}
          isAllSelected={isAllSelected}
          selectedItemIds={selectedItemIds}
          appliedSorts={appliedSorts}
          onSortChange={onSortChange}
          appliedGroups={appliedGroups}
          onGroupChange={onGroupChange}
          onToggleColumnVisibility={onToggleColumnVisibility}
          columnDefinitions={columnDefinitions}
          onShowFilterPanel={() => setShowFilterPanel(true)}
        />
        <TableBody
          data={data}
          loading={loading}
          selectedItemIds={selectedItemIds}
          onItemSelectChange={onItemSelectChange}
          onOpenDetailView={onOpenDetailView}
          appliedGroups={appliedGroups}
          groupableFields={groupableFields}
          orderedVisibleColumns={orderedVisibleColumns}
          columnWidths={columnWidths}
          getFieldValue={getFieldValue}
          idField={idField}
          searchTerm={searchTerm}
        />
      </table>

      <RightPanel
        isOpen={showFilterPanel}
        onClose={() => setShowFilterPanel(false)}
        title='Filters'
        className='ri-panel'
        // onApply={handleApplyFilters}
        // onClear={handleClearAllFilters}
        container={document.getElementById('nextto-right-panel')?.parentElement}>
        <h3>Fitler Rows</h3>
        <p>Apply one or more filter conditions to the rows in this list.</p>
      </RightPanel>

    </div>
  );
}

export default ListView;
