// src/pages/scm/views/ProductGalleryView.jsx
import React from 'react';
import * as LucideIcons from "lucide-react";

// Helper function for date formatting (copied from ListView, might be useful for dates on cards)
const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Invalid date
    return date.toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }); // YYYY-MM-DD
  } catch (e) {
    return dateString; // Fallback
  }
};

/**
 * Component ProductGalleryView hiển thị dữ liệu sản phẩm dưới dạng lưới thẻ (gallery).
 * Hỗ trợ chọn mục và mở chế độ xem chi tiết.
 *
 * @param {object} props - Các props của component.
 * @param {Array<object>} props.data - Mảng các đối tượng dữ liệu sản phẩm.
 * @param {boolean} props.loading - Trạng thái tải dữ liệu.
 * @param {Set<string>} props.selectedItemIds - Tập hợp các ID của các mục đã chọn.
 * @param {function} props.onItemSelectChange - Hàm callback khi trạng thái chọn mục thay đổi (itemId, event).
 * @param {function} props.onOpenDetailView - Hàm callback để mở chi tiết mục (itemId, itemData).
 * @param {string} props.idField - Tên trường ID duy nhất trong mỗi đối tượng dữ liệu (ví dụ: 'item_id').
 * @param {function} props.getFieldValue - Hàm trợ giúp để lấy giá trị trường, bao gồm các trường lồng nhau.
 */
function ProductGalleryView({
  data,
  loading,
  selectedItemIds,
  onItemSelectChange,
  onOpenDetailView,
  idField,
  getFieldValue,
}) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full text-gray-500">
        Đang tải dữ liệu sản phẩm...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex justify-center items-center h-full text-gray-500">
        Không tìm thấy sản phẩm nào.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4 min-h-full">
      {data.map(item => {
        const itemId = getFieldValue(item, idField);
        const isSelected = selectedItemIds.has(itemId);
        
        // Lấy các trường dữ liệu quan trọng để hiển thị trên thẻ
        const description = getFieldValue(item, 'description') || 'No Description';
        const wrin = getFieldValue(item, 'wrin') || 'N/A';
        const price = getFieldValue(item, 'price');
        const isActive = getFieldValue(item, 'is_active');
        const createdDate = getFieldValue(item, 'created_date'); // Lấy trường ngày tạo

        return (
          <div
            key={itemId}
            className={`
              relative flex flex-col bg-white rounded-lg shadow-md border
              hover:shadow-lg transition-shadow duration-200 cursor-pointer
              ${isSelected ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200'}
            `}
            onClick={(e) => onItemSelectChange(itemId, e)} // Chọn/bỏ chọn khi nhấp vào thẻ
            onDoubleClick={() => onOpenDetailView(itemId, item)} // Mở chi tiết khi nhấp đúp
          >
            {/* Checkbox để chọn mục */}
            <div className="absolute top-2 left-2 z-10">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => onItemSelectChange(itemId, e)}
                onClick={(e) => e.stopPropagation()} // Ngăn chặn sự kiện click lan ra thẻ cha
                className="rounded text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>

            {/* Hình ảnh sản phẩm (placeholder) */}
            <div className="flex-shrink-0 w-full h-36 bg-gray-100 flex items-center justify-center rounded-t-lg overflow-hidden">
              <img
                src={`https://placehold.co/150x150/e2e8f0/64748b?text=${encodeURIComponent(wrin)}`}
                alt={description}
                className="object-cover w-full h-full"
                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/150x150/e2e8f0/64748b?text=No+Image"; }}
              />
            </div>

            {/* Thông tin sản phẩm */}
            <div className="p-4 flex flex-col flex-grow">
              <h3 className="text-lg font-semibold text-gray-800 mb-1 leading-tight">
                {description}
              </h3>
              <p className="text-sm text-gray-600 mb-2">WRIN: <span className="font-medium">{wrin}</span></p>

              {price !== undefined && price !== null && (
                <p className="text-md font-bold text-green-600 mb-1">
                  Giá: ${price.toFixed(2)}
                </p>
              )}
              
              {/* Trạng thái sản phẩm */}
              <div className="flex items-center text-sm text-gray-700 mt-auto pt-2 border-t border-gray-100">
                <span className={`status-badge ${isActive === 1 || isActive === 'active' || isActive === 'Active' || isActive === true ? 'status-badge--active' : 'status-badge--inactive'} mr-2`}>
                  {isActive === 1 || isActive === 'active' || isActive === 'Active' || isActive === true ? 'Active' : 'Inactive'}
                </span>
                {createdDate && (
                    <span className="text-xs text-gray-500 ml-auto">
                        Ngày tạo: {formatDate(createdDate)}
                    </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ProductGalleryView;
