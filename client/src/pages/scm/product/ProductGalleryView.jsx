// src/pages/scm/views/ProductGalleryView.jsx
import React, { useState, useCallback } from 'react'; // Đã thêm useState, useCallback
import * as LucideIcons from "lucide-react"; // ĐÃ THÊM: Import LucideIcons

// Hàm trợ giúp để render nội dung (sản phẩm hoặc nhóm con) trong Gallery View
// Đây là một hàm đệ quy để xử lý các cấp độ nhóm lồng nhau
const renderGalleryContent = ({ itemsOrGroups, level = 0, commonProps }) => {
  // Nếu đây là một mảng sản phẩm (cấp độ cuối cùng của nhóm hoặc không có nhóm)
  if (!commonProps.appliedGroups || commonProps.appliedGroups.length === 0 || level >= commonProps.appliedGroups.length) {
    return (
      <div className="product-gallery-grid">
        {itemsOrGroups.map(product => (
          <div
            key={product.item_id}
            className={`product-card ${commonProps.selectedProductIds.has(product.item_id) ? 'selected-card' : ''}`}
            onClick={(event) => commonProps.onProductSelectChange(product.item_id, event)} // Nhấp đơn để chọn/bỏ chọn
            onDoubleClick={() => commonProps.onOpenNewStack(product.item_id)} // Nhấp đúp để mở chi tiết
            style={{ cursor: 'pointer' }}
          >
            <div className="product-card-header">
              <input
                type="checkbox"
                checked={commonProps.selectedProductIds.has(product.item_id)}
                onChange={(event) => commonProps.onProductSelectChange(product.item_id, event)}
                onClick={(e) => e.stopPropagation()} // Ngăn chặn click lan truyền từ checkbox
                className="product-checkbox"
              />
              <span className={`status-badge ${product.is_active === 1 ? 'status-badge--active' : 'status-badge--inactive'}`}>
                {product.is_active === 1 ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="product-image-placeholder">
              {/* Placeholder for product image */}
              <img src={`https://placehold.co/100x100/ADD8E6/000000?text=${product.wrin}`} alt={product.description} className="rounded-md" />
            </div>
            <div className="product-details">
              <h3 className="product-name">{product.description}</h3>
              <p className="product-wrin">{product.wrin}</p>
              <p className="product-vendor">Vendor: {product.vendor.vendor_name}</p>
              <p className="product-supplier">Supplier: {product.supplier}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Nếu đây là một mảng các nhóm
  return (
    <div className={`gallery-group-container group-level-${level}`}>
      {itemsOrGroups.map(group => {
        // Lấy nhãn hiển thị cho trường nhóm từ groupableFields
        const groupFieldDefinition = commonProps.groupableFields?.find(f => f.id === group.field);
        const groupLabel = groupFieldDefinition ? groupFieldDefinition.label : group.field;

        // Tạo một khóa duy nhất cho nhóm để quản lý trạng thái mở rộng
        const groupKey = `${group.field}-${group.groupValue}`;
        const isExpanded = commonProps.expandedGroups.has(groupKey);

        return (
          <div key={groupKey} className="gallery-group">
            <h4 className="gallery-group-header" onClick={() => commonProps.toggleGroupExpansion(groupKey)} style={{ cursor: 'pointer' }}>
              {isExpanded ? <LucideIcons.ChevronDown size={20} /> : <LucideIcons.ChevronRight size={20} />}
              {groupLabel}: {group.groupValue === null || group.groupValue === undefined || group.groupValue === '' ? '[Empty]' : String(group.groupValue)} ({group.items ? group.items.length : group.subgroups.length} items)
            </h4>
            {/* Chỉ render nội dung nhóm nếu nó được mở rộng */}
            {isExpanded && (
              group.items && group.items.length > 0 && renderGalleryContent({ itemsOrGroups: group.items, level: level + 1, commonProps })
            )}
            {isExpanded && (
              group.subgroups && group.subgroups.length > 0 && renderGalleryContent({ itemsOrGroups: group.subgroups, level: level + 1, commonProps })
            )}
          </div>
        );
      })}
    </div>
  );
};


function ProductGalleryView({ products, loading, selectedProductIds, onProductSelectChange, onSelectAllChange, onOpenNewStack, appliedGroups, groupableFields }) {
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

  // Tạo một đối tượng commonProps để truyền xuống hàm renderGalleryContent
  const commonProps = {
    selectedProductIds,
    onProductSelectChange,
    onOpenNewStack,
    appliedGroups, // Truyền appliedGroups để hàm đệ quy biết cấu trúc nhóm
    groupableFields, // Truyền groupableFields để lấy nhãn hiển thị
    expandedGroups, // ĐÃ THÊM: Truyền state expandedGroups
    toggleGroupExpansion // ĐÃ THÊM: Truyền hàm toggleGroupExpansion
  };

  return (
    <div className="product-gallery-view-container">
      {loading ? (
        <div className="loading-state">Loading...</div>
      ) : (
        products.length > 0 ? (
          // Gọi hàm đệ quy để render nội dung
          renderGalleryContent({ itemsOrGroups: products, commonProps })
        ) : (
          <div className="empty-state">No items were found.</div>
        )
      )}
    </div>
  );
}

export default ProductGalleryView;
