// utils/filterUtils.js
// export const productfiltercolumns = [
//     { id: 'gri', label: 'GRI', type: 'text' },
//     { id: 'wrin', label: 'WRIN', type: 'text' },
//     { id: 'description', label: 'Description', type: 'text' },
//     { id: 'supplier', label: 'Supplier', type: 'text' },
//     { id: 'vendor.vendor_name', label: 'Vendor', type: 'text' },
//     // { id: 'Amount', label: 'Amount', type: 'number' },
//     // { id: 'OrderDate', label: 'Order Date', type: 'date' },
//     // { id: 'IsActive', label: 'Is Active', type: 'boolean' },
// ];

// export const productgroupablecolumns = [
//     { id: 'gri', label: 'GRI', type: 'text' },
//     { id: 'supplier', label: 'Supplier', type: 'text' },
//     { id: 'vendor.vendor_name', label: 'Vendor', type: 'text' },
//     // { id: 'Amount', label: 'Amount', type: 'number' },
//     // { id: 'OrderDate', label: 'Order Date', type: 'date' },
//     // { id: 'IsActive', label: 'Is Active', type: 'boolean' },
// ];

const datatype = ['text', 'number', 'date', 'boolean'];

// Các loại toán tử cho từng kiểu dữ liệu
export const getOperatorsForType = (type) => {
    switch (type) {
        case 'text': // Đã đổi từ 'string' sang 'text' để khớp với định nghĩa cột mới
            return [
                { id: 'equals', label: 'equals' },
                { id: 'does not equal', label: 'does not equal' },
                { id: 'contains', label: 'contains' },
                { id: 'does not contain', label: 'does not contain' },
                { id: 'starts with', label: 'starts with' },
                { id: 'ends with', label: 'ends with' },
                { id: 'is empty', label: 'is empty' },
                { id: 'is not empty', label: 'is not empty' },
                { id: 'is null', label: 'is null' },
                { id: 'is not null', label: 'is not null' },
            ];
        case 'number':
            return [
                { id: 'equals', label: 'equals' },
                { id: 'does not equal', label: 'does not equal' },
                { id: 'greater than', label: 'greater than' },
                { id: 'greater than or equal', label: 'greater than or equal' },
                { id: 'less than', label: 'less than' },
                { id: 'less than or equal', label: 'less than or equal' },
                { id: 'between', label: 'between' },
                { id: 'is null', label: 'is null' },
                { id: 'is not null', label: 'is not null' },
            ];
        case 'date':
            return [
                { id: 'is', label: 'is' },
                { id: 'is not', label: 'is not' },
                { id: 'is before', label: 'is before' },
                { id: 'is after', label: 'is after' },
                { id: 'is on or before', label: 'is on or before' },
                { id: 'is on or after', label: 'is on or after' },
                { id: 'is null', label: 'is null' },
                { id: 'is not null', label: 'is not null' },
            ];
        case 'boolean':
            return [
                { id: 'is true', label: 'is true' },
                { id: 'is false', label: 'is false' },
                { id: 'equals', label: 'equals' },
                { id: 'does not equal', label: 'does not equal' },
                { id: 'is null', label: 'is null' },
                { id: 'is not null', label: 'is not null' },
            ];
        default:
            return [];
    }
};

let nextId = 1;
export const generateUniqueId = () => `rule-${nextId++}`;

// Cấu trúc khởi tạo filter rỗng hoặc mặc định
export const initialFilterState = {
    id: generateUniqueId(),
    logic: "any",
    rules: [
        {
            id: generateUniqueId(),
            type: "condition",
            field: "",
            operator: "",
            value: "",
            dataType: ""
        }
    ]
};

export const MAX_NESTING_DEPTH = 1; // Giới hạn nhóm lồng nhau 1 lần

/**
 * Kiểm tra xem có bất kỳ bộ lọc nào đang hoạt động trong cấu trúc appliedFilter hay không.
 * Một bộ lọc được coi là "hoạt động" nếu nó có trường (field) được chọn.
 * @param {object} filterConfig - Cấu trúc appliedFilter (nhóm hoặc điều kiện).
 * @returns {boolean} True nếu có bộ lọc hoạt động, ngược lại False.
 */
export const hasActiveFilters = (filterConfig) => {
    // Nếu không có cấu hình bộ lọc hoặc không có rules, coi như không có bộ lọc hoạt động
    if (!filterConfig || !filterConfig.rules || filterConfig.rules.length === 0) {
        return false;
    }

    // Duyệt qua từng rule trong nhóm hiện tại
    return filterConfig.rules.some(rule => {
        if (rule.type === "condition") {
            // Đối với một điều kiện, nó hoạt động nếu trường (field) đã được chọn
            return !!rule.field; // !! chuyển đổi giá trị thành boolean
        } else if (rule.type === "group") {
            // Đối với một nhóm, nó hoạt động nếu bất kỳ rule nào bên trong nó hoạt động (đệ quy)
            return hasActiveFilters(rule);
        }
        return false;
    });
};

/**
 * Hàm trợ giúp để lấy giá trị từ một đường dẫn trường (field path) lồng nhau.
 * Ví dụ: getFieldValue(item, 'vendor.vendor_name')
 * @param {object} item - Đối tượng dữ liệu.
 * @param {string} fieldPath - Đường dẫn đến trường (có thể là 'field' hoặc 'nested.field').
 * @returns {*} Giá trị của trường hoặc undefined nếu không tìm thấy.
 */
export const getFieldValue = (item, fieldPath) => {
    if (!fieldPath || !item) return undefined;
    const parts = fieldPath.split('.');
    let value = item;
    for (const part of parts) {
        if (value && typeof value === 'object' && value[part] !== undefined) {
            value = value[part];
        } else {
            return undefined; // Path không hợp lệ hoặc giá trị không tồn tại
        }
    }
    return value;
};


/**
 * Hàm trợ giúp để chuẩn hóa giá trị đầu vào cho so sánh (ví dụ: cắt khoảng trắng)
 * @param {*} value - Giá trị cần chuẩn hóa.
 * @returns {*} Giá trị đã chuẩn hóa.
 */
const normalizeValue = (value) => {
    if (typeof value === 'string') { // Sử dụng 'string' vì JS dùng string, 'text' là type logic
        return value.trim();
    }
    return value;
};

// Helper function for date formatting
export const formatDate = (dateString) => {
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
 * Hàm trợ giúp để phân tích chuỗi ngày tháng thành đối tượng Date.
 * @param {string} dateString - Chuỗi ngày tháng.
 * @returns {Date|null} Đối tượng Date hoặc null nếu không hợp lệ.
 */
const parseDate = (dateString) => {
    try {
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? null : date;
    } catch (e) {
        return null;
    }
};

/**
 * Hàm kiểm tra một hàng dữ liệu có thỏa mãn một điều kiện lọc đơn lẻ hay không,
 * hỗ trợ nhiều loại dữ liệu và toán tử.
 * @param {object} row - Hàng dữ liệu cần kiểm tra.
 * @param {object} condition - Đối tượng điều kiện {field, operator, value, dataType}.
 * @returns {boolean} True nếu hàng thỏa mãn điều kiện, ngược lại False.
 */
const evaluateCondition = (row, condition) => {
    const { field, operator, value, dataType } = condition;
    let rowValue = getFieldValue(row, field); // Sử dụng getFieldValue để lấy giá trị
    let conditionValue = value;

    // Handle null/undefined values for specific operators
    if (rowValue === undefined || rowValue === null) {
        if (operator === "is null") return true;
        if (operator === "is not null") return false;
        return false; // For other operators, null/undefined doesn't match
    }

    let effectiveDataType = dataType;
    if (!effectiveDataType) {
        // Attempt to infer dataType if not provided
        if (typeof rowValue === 'string') effectiveDataType = 'text'; // Infer as 'text'
        else if (typeof rowValue === 'number') effectiveDataType = 'number';
        else if (typeof rowValue === 'boolean') effectiveDataType = 'boolean';
        else if (rowValue instanceof Date) effectiveDataType = 'date';
        else if (typeof rowValue === 'string' && !isNaN(new Date(rowValue).getTime())) {
            effectiveDataType = 'date';
            rowValue = parseDate(rowValue);
        }
    }

    switch (effectiveDataType) {
        case 'text': // Sử dụng 'text' để khớp với cột định nghĩa
            // Chuyển đổi cả hai giá trị về chữ thường để so sánh không phân biệt chữ hoa/thường
            rowValue = normalizeValue(String(rowValue)).toLowerCase(); // String() để đảm bảo là chuỗi
            conditionValue = normalizeValue(String(conditionValue)).toLowerCase();

            switch (operator) {
                case "equals":
                    return rowValue === conditionValue;
                case "does not equal":
                    return rowValue !== conditionValue;
                case "contains":
                    return rowValue.includes(conditionValue);
                case "does not contain":
                    return !rowValue.includes(conditionValue);
                case "starts with":
                    return rowValue.startsWith(conditionValue);
                case "ends with":
                    return rowValue.endsWith(conditionValue);
                case "is empty":
                    return rowValue === "";
                case "is not empty":
                    return rowValue !== "";
                default:
                    return false;
            }

        case 'number':
            rowValue = Number(rowValue);
            conditionValue = Number(conditionValue);

            if (isNaN(rowValue) || isNaN(conditionValue)) return false;

            switch (operator) {
                case "equals":
                    return rowValue === conditionValue;
                case "does not equal":
                    return rowValue !== conditionValue;
                case "greater than":
                    return rowValue > conditionValue;
                case "greater than or equal":
                    return rowValue >= conditionValue;
                case "less than":
                    return rowValue < conditionValue;
                case "less than or equal":
                    return rowValue <= conditionValue;
                case "between": // value should be an array [min, max]
                    return Array.isArray(conditionValue) && rowValue >= conditionValue[0] && rowValue <= conditionValue[1];
                default:
                    return false;
            }

        case 'date':
            rowValue = rowValue instanceof Date ? rowValue : parseDate(rowValue);
            conditionValue = conditionValue instanceof Date ? conditionValue : parseDate(conditionValue);

            if (!rowValue || !conditionValue) return false;

            // Normalize dates to start of day for comparison
            const rowDate = new Date(rowValue.getFullYear(), rowValue.getMonth(), rowValue.getDate());
            const condDate = new Date(conditionValue.getFullYear(), conditionValue.getMonth(), conditionValue.getDate());

            switch (operator) {
                case "is":
                    return rowDate.getTime() === condDate.getTime();
                case "is not":
                    return rowDate.getTime() !== condDate.getTime();
                case "is before":
                    return rowDate.getTime() < condDate.getTime();
                case "is after":
                    return rowDate.getTime() > condDate.getTime();
                case "is on or before":
                    return rowDate.getTime() <= condDate.getTime();
                case "is on or after":
                    return rowDate.getTime() >= condDate.getTime();
                default:
                    return false;
            }

        case 'boolean':
            rowValue = Boolean(rowValue);
            conditionValue = Boolean(conditionValue);

            switch (operator) {
                case "is true":
                    return rowValue === true;
                case "is false":
                    return rowValue === false;
                case "equals":
                    return rowValue === conditionValue;
                case "does not equal":
                    return rowValue !== conditionValue;
                default:
                    return false;
            }

        default:
            console.warn(`Unsupported data type or operator for field ${field}: ${effectiveDataType} - ${operator}`);
            return false;
    }
};

/**
 * Hàm đệ quy để đánh giá một nhóm điều kiện lọc.
 * @param {object} row - Hàng dữ liệu cần kiểm tra.
 * @param {object} filterGroup - Đối tượng nhóm lọc {logic, rules}.
 * @returns {boolean} True nếu hàng thỏa mãn nhóm điều kiện, ngược lại False.
 */
const evaluateFilterGroup = (row, filterGroup) => {
    const { logic, rules } = filterGroup;

    // If a group has no rules, it effectively matches nothing (or everything, depending on desired behavior).
    // For filtering, if a group is empty, it usually means it doesn't contribute to the filter.
    if (!rules || rules.length === 0) {
        return true; // An empty group doesn't filter anything out, so all rows pass it.
    }

    if (logic === "all") {
        return rules.every(rule => {
            if (rule.type === "condition") {
                // Ensure the condition has a field selected to be considered "active"
                return rule.field ? evaluateCondition(row, rule) : true; // If no field, it doesn't filter.
            } else if (rule.type === "group") {
                return evaluateFilterGroup(row, rule);
            }
            return false;
        });
    } else if (logic === "any") {
        return rules.some(rule => {
            if (rule.type === "condition") {
                // Ensure the condition has a field selected to be considered "active"
                return rule.field ? evaluateCondition(row, rule) : false; // If no field, it doesn't contribute to 'any' match.
            } else if (rule.type === "group") {
                return evaluateFilterGroup(row, rule);
            }
            return false;
        });
    }
    return false;
};

/**
 * Hàm đệ quy để nhóm dữ liệu dựa trên cấu hình nhóm.
 * @param {Array<object>} items - Mảng dữ liệu cần nhóm.
 * @param {Array<object>} groupFields - Mảng các đối tượng trường nhóm [{ field: 'fieldName' }].
 * @param {number} level - Cấp độ nhóm hiện tại (bắt đầu từ 0).
 * @returns {Array<object>} Cấu trúc dữ liệu đã được nhóm.
 */
const groupData = (items, groupFields, level = 0) => {
    if (level >= groupFields.length) {
        return items; // Trả về các mục nếu không còn cấp độ nhóm nào
    }

    const currentGroupField = groupFields[level].field;
    const groupedMap = new Map(); // Sử dụng Map để duy trì thứ tự chèn (cho các nhóm)

    items.forEach(item => {
        const groupValue = getFieldValue(item, currentGroupField); // Sử dụng getFieldValue
        const key = groupValue === undefined || groupValue === null ? '[Empty]' : String(groupValue); // String() để đảm bảo là chuỗi

        if (!groupedMap.has(key)) {
            groupedMap.set(key, {
                groupValue: groupValue,
                field: currentGroupField,
                items: [],
                subgroups: [] // Đã đổi thành 'subgroups' để nhất quán
            });
        }
        groupedMap.get(key).items.push(item);
    });

    // Chuyển đổi Map thành mảng và đệ quy cho các nhóm con
    const groupedArray = Array.from(groupedMap.values());

    // Tiếp tục nhóm các nhóm con
    groupedArray.forEach(group => {
        group.subgroups = groupData(group.items, groupFields, level + 1); // Đã đổi thành 'subgroups'
        // Xóa `items` ở cấp độ này nếu có `subgroups` để tránh trùng lặp dữ liệu
        if (group.subgroups.length > 0) {
            delete group.items;
        }
    });
    return groupedArray;
};


/**
 * Hàm phân tích chuỗi tìm kiếm thành cấu trúc logic.
 * Ví dụ: "Banana & Red; Apple & Green" -> [[["banana"], ["red"]], [["apple"], ["green"]]]
 * @param {string} searchTerm - Chuỗi tìm kiếm.
 * @returns {Array<Array<Array<string>>>} Cấu trúc mảng lồng nhau của các điều kiện.
 */
const parseComplexSearchTerm = (searchTerm) => {
    const trimmedSearchTerm = searchTerm.trim();
    if (!trimmedSearchTerm) {
        return [];
    }

    // Split by OR operator (;)
    const orClauses = trimmedSearchTerm.split(';').map(clause => clause.trim());

    return orClauses.map(orClause => {
        // Split each OR clause by AND operator (&)
        const andSubClauses = orClause.split('&').map(subClause => subClause.trim());
        // Each sub-clause is a single term for now.
        return andSubClauses.filter(term => term !== '').map(term => term.toLowerCase());
    }).filter(clause => clause.length > 0); // Remove empty clauses
};


/**
 * Hàm đánh giá một sản phẩm có khớp với cấu trúc tìm kiếm phức tạp hay không.
 * @param {object} product - Sản phẩm cần kiểm tra.
 * @param {Array<Array<string>>} parsedSearchTermStructure - Cấu trúc tìm kiếm đã được phân tích.
 * @param {Array<object>} searchableColumns - Cấu trúc các cột có thể tìm kiếm.
 * @returns {boolean} True nếu sản phẩm khớp, ngược lại False.
 */
const evaluateComplexSearchTerm = (product, parsedSearchTermStructure, searchableColumns) => {
    if (!parsedSearchTermStructure || parsedSearchTermStructure.length === 0) {
        return true; // No search term, so all products match
    }

    const effectiveSearchableColumns = searchableColumns.filter(col => col.type === 'text');
    if (effectiveSearchableColumns.length === 0) {
        return true; // No searchable text columns, so all products match the search criteria.
    }

    // Outer OR logic: At least one OR clause must be true
    return parsedSearchTermStructure.some(andClauseTerms => {
        // Inner AND logic: All terms in this AND clause must be true
        return andClauseTerms.every(singleTerm => {
            // Innermost check: singleTerm must be found in at least one searchable field of the product
            return effectiveSearchableColumns.some(column => {
                const fieldValue = getFieldValue(product, column.id);
                if (fieldValue === null || fieldValue === undefined) {
                    return false;
                }
                return String(fieldValue).toLowerCase().includes(singleTerm);
            });
        });
    });
};



/**
 * Hàm chính để áp dụng bộ lọc, sắp xếp và nhóm dữ liệu.
 * @param {Array<object>} productsToProcess - Mảng dữ liệu sản phẩm cần xử lý.
 * @param {object} appliedFilterConfig - Cấu trúc appliedFilter.
 * @param {Array<object>} appliedSortConfig - Cấu hình sắp xếp (ví dụ: [{ field: 'Amount', direction: 'asc' }]).
 * @param {Array<object>} appliedGroupConfig - Cấu hình nhóm (ví dụ: [{ field: 'description' }, { field: 'wrin' }]).
 * @returns {Array<object>} Mảng dữ liệu đã được lọc, sắp xếp và nhóm.
 */
export const applyViewFiltersSortAndGroup = (productsToProcess, appliedFilterConfig, appliedSortConfig, appliedGroupConfig, searchTerm = '', searchableColumns = []) => {
    let processedProducts = [...productsToProcess]; // Create a shallow copy

    // 1. Apply Filters
    if (hasActiveFilters(appliedFilterConfig)) {
        processedProducts = processedProducts.filter(product =>
            evaluateFilterGroup(product, appliedFilterConfig)
        );
    }

    // 2. Apply Complex Search Term (Tìm kiếm văn bản tự do phức tạp)
    if (searchTerm && typeof searchTerm === 'string' && searchTerm.trim() !== '') {
        const parsedSearchTermStructure = parseComplexSearchTerm(searchTerm);
        if (parsedSearchTermStructure.length > 0) { // Only filter if parsing yields something
            processedProducts = processedProducts.filter(product =>
                evaluateComplexSearchTerm(product, parsedSearchTermStructure, searchableColumns)
            );
        }
    }

    // 3. Apply Sorting
    if (appliedSortConfig && Array.isArray(appliedSortConfig) && appliedSortConfig.length > 0) {
        processedProducts.sort((a, b) => {
            for (let i = 0; i < appliedSortConfig.length; i++) {
                const { field, direction } = appliedSortConfig[i];
                const valA = getFieldValue(a, field); // Sử dụng getFieldValue
                const valB = getFieldValue(b, field); // Sử dụng getFieldValue

                let comparison = 0;

                // Handle null/undefined values for sorting
                if (valA === null || valA === undefined) {
                    comparison = (valB === null || valB === undefined) ? 0 : -1; // Nulls/undefineds come first
                } else if (valB === null || valB === undefined) {
                    comparison = 1; // Nulls/undefineds come first
                } else if (typeof valA === 'string' && typeof valB === 'string') { // Dùng string vì đó là kiểu JS thực tế
                    comparison = valA.localeCompare(valB);
                } else if (valA instanceof Date && valB instanceof Date) {
                    comparison = valA.getTime() - valB.getTime();
                } else {
                    // For numbers and booleans (true > false)
                    comparison = valA - valB;
                }

                if (comparison !== 0) {
                    return direction === 'asc' ? comparison : -comparison;
                }
            }
            return 0; // If all fields are equal
        });
    }

    // 4. Apply Grouping
    if (appliedGroupConfig && Array.isArray(appliedGroupConfig) && appliedGroupConfig.length > 0) {
        return groupData(processedProducts, appliedGroupConfig);
    }

    // If no grouping applied, return the filtered and sorted flat array
    return processedProducts;
};


export const extractAllItemIds = (itemsOrGroups, idField) => {
    const ids = new Set();
    const traverse = (data) => {
        if (!data) return;
        if (Array.isArray(data)) {
            data.forEach(item => {
                if (item && item.subgroups) { // Đây là một đối tượng nhóm
                    traverse(item.subgroups); // Duyệt qua các item trong nhóm
                } else if (item && getFieldValue(item, idField)) { // Đây là một đối tượng sản phẩm
                    ids.add(getFieldValue(item, idField));
                }
            });
        }
    };
    traverse(itemsOrGroups);
    return Array.from(ids);
};


// searchterm

export const highlightText = (textToHighlight, searchterm) => {
    // Loại bỏ console.log trong production
    // console.log('highlight nè');
    const trimmedSearchTerm = searchterm?.trim().toLowerCase();

    let searchWordsArray = [];
    if (trimmedSearchTerm) { // Rút gọn điều kiện kiểm tra
        searchWordsArray = trimmedSearchTerm
            .split(/[&;]/) // Tách theo dấu & hoặc ;
            .map(word => word.trim()) // Loại bỏ khoảng trắng thừa
            .filter(word => word.length > 0); // Loại bỏ từ rỗng
    }

    // Xử lý trường hợp textToHighlight là null/undefined hoặc chuỗi rỗng
    if (textToHighlight === null || textToHighlight === undefined) {
        return textToHighlight; // Hoặc return '' nếu bạn muốn trả về chuỗi rỗng
    }
    const textAsString = String(textToHighlight); // Đảm bảo làm việc với chuỗi

    // Nếu không có từ khóa tìm kiếm, trả về chuỗi gốc
    if (searchWordsArray.length === 0) {
        return textAsString;
    }

    // Tạo mảng các từ khóa đã được thoát ký tự đặc biệt cho regex
    const escapedWords = searchWordsArray.map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    
    // Nếu sau khi thoát mà không còn từ nào (trường hợp hiếm nhưng có thể xảy ra nếu tất cả là ký tự đặc biệt và được loại bỏ)
    if (escapedWords.length === 0) {
        return textAsString;
    }

    // Tạo regex từ các từ khóa đã thoát, tìm kiếm toàn cầu và không phân biệt chữ hoa/thường
    const regex = new RegExp(`(${escapedWords.join('|')})`, 'gi');
    
    // Tách chuỗi thành các phần, bao gồm cả các phần khớp với regex
    const parts = textAsString.split(regex);

    // --- Cải thiện hiệu suất: Sử dụng Set để kiểm tra isMatch nhanh hơn ---
    const lowerCaseSearchWordsSet = new Set(searchWordsArray.map(word => word.toLowerCase()));

    return (
        <>
            {parts.map((part, i) => {
                // Kiểm tra xem phần hiện tại có khớp với một trong các từ khóa tìm kiếm không (không phân biệt chữ hoa/thường)
                // Tra cứu trong Set nhanh hơn nhiều so với `some()` trên mảng lớn
                const isMatch = lowerCaseSearchWordsSet.has(part.toLowerCase());
                
                return isMatch ? (
                    <span key={i} className='highlight'>{part}</span>
                ) : (
                    part
                );
            })}
        </>
    );
};
