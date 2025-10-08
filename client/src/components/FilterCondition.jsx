// components/FilterCondition.jsx
import React, { useState, useEffect } from 'react';
import { getOperatorsForType } from '../utils/filterUtils';
import * as LucideIcons from "lucide-react";

const FilterCondition = ({ condition, onUpdate, onDelete, filtercolumns }) => {
    const { id, field, operator, value, dataType } = condition;

    // Đảm bảo dòng này được khai báo ở đây
    const [selectedColumn, setSelectedColumn] = useState(() => filtercolumns.find(col => col.id === field));
    const [currentOperators, setCurrentOperators] = useState([]); // <--- Dòng này phải có mặt ở đây!

    useEffect(() => {
        // Cập nhật selectedColumn khi field prop thay đổi từ bên ngoài
        const newSelectedColumn = filtercolumns.find(col => col.id === field);
        if (newSelectedColumn !== selectedColumn) {
            setSelectedColumn(newSelectedColumn);
        }
    }, [field, selectedColumn]);


    useEffect(() => {
        if (selectedColumn) {
            const operators = getOperatorsForType(selectedColumn.type);
            setCurrentOperators(operators);

            let updates = {};
            let shouldUpdate = false;

            // 1. Kiểm tra và cập nhật dataType
            if (dataType !== selectedColumn.type) {
                updates.dataType = selectedColumn.type;
                shouldUpdate = true;
            }

            // 2. Kiểm tra và reset operator nếu không hợp lệ
            // Đảm bảo `operator` là một string hợp lệ trước khi gọi `.some`
            if (operator && !operators.some(op => op.id === operator)) {
                updates.operator = '';
                // updates.value = ''; // Tùy chọn: reset value khi operator thay đổi
                shouldUpdate = true;
            }

            // 3. Nếu có bất kỳ cập nhật nào cần thiết, gọi onUpdate
            if (shouldUpdate) {
                onUpdate(id, updates);
            }
        } else {
            // Khi không có cột nào được chọn, reset operator, value, và dataType
            if (operator !== '' || value !== '' || dataType !== '') {
                onUpdate(id, { operator: '', value: '', dataType: '' });
            }
            setCurrentOperators([]);
        }
    }, [selectedColumn, id, onUpdate, operator, dataType, value]);

    const handleFieldChange = (e) => {
        const columnId = e.target.value;
        onUpdate(id, { field: columnId });
    };

    const handleOperatorChange = (e) => {
        const newOperator = e.target.value;
        onUpdate(id, { operator: newOperator });
    };

    const handleValueChange = (e) => {
        let newValue = e.target.value;
        if (selectedColumn && selectedColumn.type === 'number') {
            newValue = Number(newValue);
        } else if (selectedColumn && selectedColumn.type === 'boolean') {
             newValue = newValue === 'true';
        }
        onUpdate(id, { value: newValue });
    };

    const renderValueInput = () => {
        // Kiểm tra selectedColumn trước khi truy cập type
        if (!selectedColumn || ['is null', 'is not null', 'is empty', 'is not empty', 'is true', 'is false'].includes(operator)) {
            return null;
        }

        switch (selectedColumn.type) {
            case 'string':
                return <input type="text" value={value || ''} onChange={handleValueChange} placeholder="Enter value" className="filter-input" />;
            case 'number':
                return <input type="number" value={value || ''} onChange={handleValueChange} placeholder="Enter number" className="filter-input" />;
            case 'date':
                const dateValue = value instanceof Date
                    ? value.toISOString().substring(0, 10)
                    : (typeof value === 'string' && value.length >= 10 ? value.substring(0, 10) : '');
                return <input type="date" value={dateValue} onChange={handleValueChange} className="filter-input" />;
            case 'boolean':
                return (
                    <select value={value === true ? 'true' : (value === false ? 'false' : '')} onChange={handleValueChange} className="filter-dropdown">
                        <option value="">Select...</option>
                        <option value="true">True</option>
                        <option value="false">False</option>
                    </select>
                );
            default:
                return <input type="text" value={value || ''} onChange={handleValueChange} placeholder="Enter value" className="filter-input" />;
        }
    };

    return (
        <div className="filter-condition-row">
            <select value={field} onChange={handleFieldChange} className="filter-dropdown">
                <option value="">Select Column</option>
                {filtercolumns.map(col => (
                    <option key={col.id} value={col.id}>{col.label}</option>
                ))}
            </select>

            <select value={operator} onChange={handleOperatorChange} className="filter-dropdown">
                <option value="">Select Operator</option>
                {/* Đảm bảo currentOperators đã được khởi tạo là một mảng trước khi dùng .map() */}
                {currentOperators && currentOperators.map(op => (
                    <option key={op.id} value={op.id}>{op.label}</option>
                ))}
            </select>

            {renderValueInput()}

            <button onClick={() => onDelete(id)} className="filter-icon-button delete-button" title="Remove Rule">
                <LucideIcons.Trash size={20} />
            </button>
        </div>
    );
};

export default FilterCondition;