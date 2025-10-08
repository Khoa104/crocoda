// src/pages/scm/components/AddCustomViewModal.jsx
import React, { useState } from 'react';
import Portal from './Portal'; // Đảm bảo đường dẫn đúng đến component Modal của bạn
import { allViewTypeOptions, iconOptions } from './../utils/config';
import * as LucideIcons from "lucide-react";

function AddCustomViewModal({ isOpen, onClose, onSave, supportedViewTypes, availableColumns }) {
  const [viewName, setViewName] = useState('');
  const [selectedViewType, setSelectedViewType] = useState(supportedViewTypes[0] || 'list');
  const [selectedIcon, setSelectedIcon] = useState('Star'); // Icon cho custom view
  const [filters, setFilters] = useState([]); // [{ field: 'status', operator: 'equals', value: 'Active' }]
  const [sort, setSort] = useState({ field: '', direction: 'asc' }); // { field: 'wrin', direction: 'asc' }

  const handleSave = () => {
    if (!viewName.trim()) {
      alert('Tên View không được để trống!');
      return;
    }
    const chosenViewTypeOption = allViewTypeOptions.find(opt => opt.viewtype === selectedViewType);
    const iconToSave = chosenViewTypeOption ? chosenViewTypeOption.icon : 'Star'; // Mặc định là 'Star' nếu không tìm thấy
    const newViewConfig = {
      name: viewName,
      viewType: selectedViewType,
      icon: iconToSave,
      filters: filters.filter(f => f.field && f.value), // Chỉ lưu filter có đủ thông tin
      sort: sort.field ? sort : [], // Chỉ lưu sort nếu có field
    };
    onSave(newViewConfig);
    onClose();
  };

  // Các tùy chọn kiểu view để hiển thị trong dropdown (lấy từ props supportedViewTypes)
  const renderViewTypeOptions = supportedViewTypes.map(type => {
    const option = allViewTypeOptions.find(o => o.viewtype === type) || { label: type, icon: 'Box' };
    return { value: type, label: option.label };
  });

  return (
    <Portal isOpen={isOpen} onClose={onClose} title='Create View' className='new-product-view'
    // container={document.getElementById('custom-root')}
    >
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', overflow: 'auto' }}>
        {/* Tên View */}
        <label>
          View name *
          <input
            type="text"
            value={viewName}
            onChange={(e) => setViewName(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
            required
          />
        </label>

        {/* Kiểu View */}
        <label>
          View type
          <select
            value={selectedViewType}
            onChange={(e) => setSelectedViewType(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            {renderViewTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {/* Chọn Icon */}
        {/* <label>
          Icon
          <select
            value={selectedIcon}
            onChange={(e) => setSelectedIcon(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            {iconOptions.map(option => {
              const IconComponent = LucideIcons[option.value];
              return (
                <option key={option.value} value={option.value}>
                  {IconComponent && <IconComponent size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} />}
                  {option.label}
                </option>
              );
            })}
          </select>
        </label> */}

        {/* Cài đặt Bộ lọc */}
        {/* <h3>Filter</h3>
        {filters.map((filter, index) => (
          <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select
              value={filter.field}
              onChange={(e) => handleFilterChange(index, 'field', e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="">-- Chọn cột --</option>
              {availableColumns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
            <select
              value={filter.operator}
              onChange={(e) => handleFilterChange(index, 'operator', e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="equals">Bằng</option>
              <option value="contains">Chứa</option>
              <option value="startsWith">Bắt đầu với</option>

            </select>
            <input
              type="text"
              value={filter.value}
              onChange={(e) => handleFilterChange(index, 'value', e.target.value)}
              placeholder="Giá trị"
              style={{ flexGrow: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <button onClick={() => handleRemoveFilter(index)} style={{ background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', padding: '8px', cursor: 'pointer' }}>Xóa</button>
          </div>
        ))}
        <button onClick={handleAddFilter} style={{ background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', padding: '10px', cursor: 'pointer' }}>Thêm Bộ lọc</button> */}

        {/* Cài đặt Sắp xếp */}
        {/* <h3>Sort</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            value={sort.field}
            onChange={(e) => setSort({ ...sort, field: e.target.value })}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="">--Select field--</option>
            {availableColumns.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
          <select
            value={sort.direction}
            onChange={(e) => setSort({ ...sort, direction: e.target.value })}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="asc">Ascending (A-Z, 0-9)</option>
            <option value="desc">Descending (Z-A, 9-0)</option>
          </select>
        </div> */}

        {/* Nút lưu */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSave} style={{ padding: '10px 20px', background: 'var(--primary-color)', color: 'var(--text-inverted)', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Create View</button>
        </div>
      </div>
    </Portal>
  );
}

export default AddCustomViewModal;
