// src/pages/scm/views/ProductListView.jsx
import React, { useState, useCallback } from 'react'; // Đã thêm useState, useCallback
import * as LucideIcons from "lucide-react"; // ĐÃ THÊM: Import LucideIcons
import {  extractAllItemIds } from '../../../utils/filterUtils';

// Hàm trợ giúp để render các hàng sản phẩm hoặc các nhóm con
// Đây là một hàm đệ quy để xử lý các cấp độ nhóm lồng nhau
const renderGroupedContent = ({ itemsOrGroups, level = 0, commonProps }) => {
  // Nếu đây là một mảng sản phẩm (cấp độ cuối cùng của nhóm hoặc không có nhóm)
  if (!commonProps.appliedGroups || commonProps.appliedGroups.length === 0 || level >= commonProps.appliedGroups.length) {
    return itemsOrGroups.map(product => (
      <tr
        key={product.item_id}
        className={`data-table__row ${commonProps.selectedItemIds.has(product.item_id) ? 'selected-row' : ''}`}
        onClick={(event) => commonProps.onItemSelectChange(product.item_id, event)} // Nhấp đơn để chọn/bỏ chọn
        onDoubleClick={() => commonProps.onOpenDetailView(product.item_id)} // Nhấp đúp để mở chi tiết
        style={{ cursor: 'pointer' }}
      >
        <td className="data-table__td select-column">
          <input
            type="checkbox"
            checked={commonProps.selectedItemIds.has(product.item_id)}
            onChange={(event) => commonProps.onItemSelectChange(product.item_id, event)}
            onClick={(e) => e.stopPropagation()} // Ngăn chặn click lan truyền từ checkbox
          />
        </td>
        <td className="data-table__td">{product.item_id}</td>
        <td className="data-table__td">{product.wrin}</td>
        <td className="data-table__td">{product.description}</td>
        <td className="data-table__td">{product.vendor.vendor_name}</td>
        <td className="data-table__td">{product.supplier}</td>
        <td className="data-table__td">
          <span className={`status-badge ${product.is_active === 1 ? 'status-badge--active' : 'status-badge--inactive'}`}>
            {product.is_active === 1 ? 'Active' : 'Inactive'}
          </span>
        </td>
      </tr>
    ));
  }

  // Nếu đây là một mảng các nhóm
  return itemsOrGroups.map(group => {
    // Lấy nhãn hiển thị cho trường nhóm từ groupableFields
    const groupFieldDefinition = commonProps.groupableFields?.find(f => f.id === group.field);
    const groupLabel = groupFieldDefinition ? groupFieldDefinition.label : group.label; // Sử dụng label nếu có, ngược lại dùng id
    

    // Tạo một khóa duy nhất cho nhóm để quản lý trạng thái mở rộng
    const groupKey = `${group.field}-${group.groupValue}`;
    const isExpanded = commonProps.expandedGroups.has(groupKey);

    return (
      <React.Fragment key={groupKey}>
        <tr className="group-header-row" onClick={() => commonProps.toggleGroupExpansion(groupKey)}>
          {/* ĐÃ SỬA: Truyền biến CSS --group-level vào style của td */}
          <td colSpan="7" style={{ '--group-level': level }}>
            <h4 className="group-header-title">
              {isExpanded ? <LucideIcons.ChevronDown size={16} /> : <LucideIcons.ChevronRight size={16} />}
              {groupLabel}: {group.groupValue === null || group.groupValue === undefined || group.groupValue === '' ? '[Empty]' : String(group.groupValue)} ({group.items ? group.items.length : group.subgroups.length} items)
            </h4>
          </td>
        </tr>
        {/* Chỉ render nội dung nhóm nếu nó được mở rộng */}
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


function ProductListView({ data, loading, selectedItemIds, onItemSelectChange, onSelectAllChange, onOpenDetailView, appliedGroups, groupableFields }) {
  const allSelectableProductIds = extractAllItemIds(data, 'item_id'); 
  const isAllSelected = allSelectableProductIds.length > 0 &&
    allSelectableProductIds.every(item => selectedItemIds.has(item));

  // State để quản lý các nhóm đang mở rộng/thu gọn
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  // Hàm để bật/tắt trạng thái mở rộng của một nhóm
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

  // Tạo một đối tượng commonProps để truyền xuống hàm renderGroupedContent
  const commonProps = {
    selectedItemIds,
    onItemSelectChange,
    onOpenDetailView,
    appliedGroups, // Truyền appliedGroups để hàm đệ quy biết cấu trúc nhóm
    groupableFields, // Truyền groupableFields để lấy nhãn hiển thị
    expandedGroups, // ĐÃ THÊM: Truyền state expandedGroups
    toggleGroupExpansion // ĐÃ THÊM: Truyền hàm toggleGroupExpansion
  };

  
  return (
    <div className="product-table-responsive">
      <table className="product-data-table">
        <thead className="data-table__header">
          <tr>
            <th className="data-table__th select-column">
              <input
                type="checkbox"
                onChange={onSelectAllChange}
                checked={isAllSelected}
                ref={el => {
                  if (el) {
                    el.indeterminate = selectedItemIds.size > 0 && !isAllSelected;
                  }
                }}
                onClick={(e) => e.stopPropagation()} // Ngăn chặn click lan truyền từ checkbox header
              />
            </th>
            <th className="data-table__th">ID</th>
            <th className="data-table__th">WRIN</th>
            <th className="data-table__th">Description</th>
            <th className="data-table__th">Vendor</th>
            <th className="data-table__th">Supplier</th>
            <th className="data-table__th">Status</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="7" className="data-table__empty-state">Loading...</td>
            </tr>
          ) : (
            data.length > 0 ? (
              // Gọi hàm đệ quy để render nội dung
              renderGroupedContent({ itemsOrGroups: data, commonProps })
            ) : (
              <tr>
                <td colSpan="7" className="data-table__empty-state">No items were found.</td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ProductListView;
