// src/components/FilterRightPanel.jsx
import React, { useState, useEffect } from 'react';
import * as LucideIcons from "lucide-react";
// import "./FilterRightPanel.css"
import RightPanel from './RightPanel';
import FilterGroup from './FilterGroup';

import { initialFilterState, generateUniqueId } from '../utils/filterUtils';
import { filtercolumns } from '../utils/ProductConfig';

/**
 * Component ColumnFilterPanel cho phép người dùng áp dụng các bộ lọc cho 1 trường được chọn.
 *
 * @param {object} props - Các props của component.
 * @param {boolean} props.isOpen - Trạng thái hiển thị của panel.
 * @param {function} props.onClose - Hàm gọi khi panel đóng.
 * @param {function} props.onApplyFilters - Hàm gọi khi người dùng áp dụng bộ lọc. Nhận đối tượng filters.
 * @param {function} props.onClearFilters - Hàm gọi khi người dùng xóa tất cả bộ lọc.
 * @param {object} props.initialFilters - Các bộ lọc ban đầu để điền vào form.
 * @param {Array<object>} props.filterableFields - Mảng các đối tượng định nghĩa các trường có thể lọc.
 * Ví dụ: [{ id: 'description', label: 'Description', type: 'text' }, ...]
 */
function ColumnFilterPanel({ isOpen, onClose, onApplyFilters, onClearFilters, initialFilters, filterableFields, container,
    colId,
    columnDefinitions,
    data,
    getFieldValue,
    appliedColumnFilters, // { columnId: Set<value> }
    onApplyFilter,       // (colId, selectedValuesSet)
    onClearFilter,       // (colId)
}) {

    if (!isOpen) return null;
    const column = columnDefinitions.find(c => c.id === colId);

    // Dữ liệu lọc nội bộ (các giá trị được chọn tạm thời)
    const [selectedValues, setSelectedValues] = useState(() => appliedColumnFilters[colId] || new Set());
    const [searchTerm, setSearchTerm] = useState('');

    // Cập nhật state nội bộ khi bộ lọc bên ngoài thay đổi
    useEffect(() => {
        setSelectedValues(appliedColumnFilters[colId] || new Set());
    }, [appliedColumnFilters, colId]);

    // Lấy các giá trị duy nhất từ dữ liệu
    const uniqueValues = useMemo(() => {
        if (!data || !column) return [];
        const values = new Set();
        data.forEach(item => {
            const value = getFieldValue(item, colId);
            if (value !== null && value !== undefined) {
                // Chuyển tất cả về chuỗi để dễ dàng xử lý và so sánh
                values.add(String(value));
            }
        });
        return Array.from(values).sort();
    }, [data, colId, getFieldValue, column]);

    // Các giá trị được lọc để hiển thị trong panel
    const filteredValues = useMemo(() => {
        if (!searchTerm) return uniqueValues;
        const lowerCaseSearch = searchTerm.toLowerCase();
        return uniqueValues.filter(value =>
            String(value).toLowerCase().includes(lowerCaseSearch)
        );
    }, [uniqueValues, searchTerm]);

    const handleValueToggle = useCallback((value) => {
        setSelectedValues(prev => {
            const newSet = new Set(prev);
            if (newSet.has(value)) {
                newSet.delete(value);
            } else {
                newSet.add(value);
            }
            return newSet;
        });
    }, []);

    const handleSelectAll = useCallback((shouldSelect) => {
        if (shouldSelect) {
            setSelectedValues(new Set(uniqueValues));
        } else {
            setSelectedValues(new Set());
        }
    }, [uniqueValues]);

    const handleApply = () => {
        onApplyFilter(colId, selectedValues);
    };

    const handleClear = () => {
        setSelectedValues(new Set());
        onClearFilter(colId);
    };

    if (!column) return <div style={{ padding: '16px', color: '#6b7280' }}>Vui lòng chọn cột để lọc.</div>;

    const isAllSelected = selectedValues.size === uniqueValues.length;
    const isIndeterminate = selectedValues.size > 0 && selectedValues.size < uniqueValues.length;
    const isFilterActive = appliedColumnFilters[colId] && appliedColumnFilters[colId].size > 0;

    return (
        <RightPanel
            isOpen={isOpen}
            onClose={onClose}
            // onClear={handleClearAllFilters}
            // onApply={handleApplyFilters}
            className='filter-right-panel'
            container={container}
            title={`Filters by ${column.label}`}
        >
            <div className="filter-builder-content">

                {/* Thanh tìm kiếm */}
                <div className="filter-search-container">
                    <div className="filter-search-input-wrapper">
                        <LucideIcons.Search size={16} className="filter-search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm giá trị..."
                            className="filter-search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Danh sách các giá trị */}
                <div className="filter-values-list">
                    <div
                        className="filter-item"
                        onClick={() => handleSelectAll(!isAllSelected)}
                    >
                        <input
                            type="checkbox"
                            checked={isAllSelected}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            ref={el => { if (el) el.indeterminate = isIndeterminate; }}
                            onClick={(e) => e.stopPropagation()} // Ngăn chặn sự kiện click lan truyền
                        />
                        <span className="filter-item-label">(Chọn tất cả)</span>
                    </div>

                    {filteredValues.length > 0 ? (
                        filteredValues.map(value => (
                            <div
                                key={value}
                                className="filter-item"
                                onClick={() => handleValueToggle(value)}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedValues.has(value)}
                                    onChange={() => handleValueToggle(value)}
                                    onClick={(e) => e.stopPropagation()} // Ngăn chặn sự kiện click lan truyền
                                />
                                <span>{value || '(Trống)'}</span>
                            </div>
                        ))
                    ) : (
                        <p className="empty-results-message">Không tìm thấy giá trị.</p>
                    )}
                </div>
            </div>
            {/* DEBUG: Display current filter state */}
            {/* <pre style={{ marginTop: '20px', fontSize: '10px', backgroundColor: '#eee', padding: '10px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
        {JSON.stringify(initialFilters, null, 2)}
      </pre> */}
        </RightPanel>
    );
}
// const appliedFilter = {
//   logic: "any", // Mặc định cho nhóm ngoài cùng (Match any)
//   rules: [
//     {
//       type: "condition", // Điều kiện đơn
//       field: "Status",
//       operator: "equals",
//       value: "Purchase Order"
//     },
//     {
//       type: "group", // Nhóm điều kiện con (all of)
//       logic: "all",
//       rules: [
//         {
//           type: "condition",
//           field: "Status",
//           operator: "equals",
//           value: "Purchase Order"
//         },
//         {
//           type: "condition",
//           field: "Status",
//           operator: "equals",
//           value: "Purchase Order"
//         }
//       ]
//     },
//     {
//       type: "group", // Nhóm điều kiện con thứ hai (all of)
//       logic: "all",
//       rules: [
//         {
//           type: "condition",
//           field: "Status",
//           operator: "equals",
//           value: "Purchase Order"
//         }
//       ]
//     }
//   ]
// };
export default ColumnFilterPanel;
