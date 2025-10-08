// src/components/FilterModal.jsx
import React, { useState, useEffect } from 'react';
import * as LucideIcons from "lucide-react";
import "./FilterModal.css"
import RightPanel from './RightPanel';
import FilterGroup from './FilterGroup';
import Modal from './Modal';
import { initialFilterState, generateUniqueId } from '../utils/filterUtils';
import { filtercolumns } from '../utils/ProductConfig';

/**
 * Component FilterPanel cho phép người dùng áp dụng các bộ lọc cho danh sách sản phẩm.
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
function FilterModal({ isOpen, onClose, onApplyFilters, onClearFilters, initialFilters, filterableFields, container }) {
  // State cục bộ để quản lý các giá trị input trong panel
  // console.log(initialFilters, 'a');
  // const [currentPanelFilters, setCurrentPanelFilters] = useState(initialFilters);
  // console.log(currentPanelFilters, 'b');
  // const [appliedFilter, setAppliedFilter] = useState(() =>
  //   initialFilters?.rules?.length ? JSON.parse(JSON.stringify(initialFilters)) : initialFilterState
  // );
  // console.log(appliedFilter, 'c');
  // Hàm đệ quy để cập nhật một nhóm hoặc điều kiện cụ thể
  const updateRuleInGroup = (currentGroup, targetId, updates) => {
    if (currentGroup.id === targetId) {
      return { ...currentGroup, ...updates };
    }
    return {
      ...currentGroup,
      rules: currentGroup.rules.map(rule => {
        if (rule.type === 'group') {
          return updateRuleInGroup(rule, targetId, updates);
        }
        return rule.id === targetId ? { ...rule, ...updates } : rule;
      })
    };
  };
  // Hàm đệ quy để thêm rule (điều kiện/nhóm) vào một nhóm cụ thể
  const addRuleToGroup = (currentGroup, targetGroupId, newRule) => {
    if (currentGroup.id === targetGroupId) {
      return {
        ...currentGroup,
        rules: [...currentGroup.rules, newRule]
      };
    }
    return {
      ...currentGroup,
      rules: currentGroup.rules.map(rule => {
        if (rule.type === 'group') {
          return addRuleToGroup(rule, targetGroupId, newRule);
        }
        return rule;
      })
    };
  };
  // Hàm đệ quy để xóa rule (điều kiện/nhóm) khỏi một nhóm cụ thể
  const deleteRuleFromGroup = (currentGroup, parentGroupId, ruleIdToDelete) => {
    if (currentGroup.id === parentGroupId) {
      return {
        ...currentGroup,
        rules: currentGroup.rules.filter(rule => rule.id !== ruleIdToDelete)
      };
    }
    return {
      ...currentGroup,
      rules: currentGroup.rules.map(rule => {
        if (rule.type === 'group') {
          return deleteRuleFromGroup(rule, parentGroupId, ruleIdToDelete);
        }
        return rule;
      })
    };
  };

  const handleUpdateGroup = (groupId, updates) => {
    onApplyFilters(prevFilter => updateRuleInGroup(prevFilter, groupId, updates));
  };

  const handleAddRule = (groupId, newRule) => {
    onApplyFilters(prevFilter => addRuleToGroup(prevFilter, groupId, newRule));
  };

  const handleAddGroup = (groupId, newGroup) => {
    onApplyFilters(prevFilter => addRuleToGroup(prevFilter, groupId, newGroup));
  };

  const handleDeleteRule = (parentGroupId, ruleIdToDelete) => {
    onApplyFilters(prevFilter => deleteRuleFromGroup(prevFilter, parentGroupId, ruleIdToDelete));
  };

  const handleApplyFilters = () => {
    console.log("Applied Filter Configuration:", JSON.stringify(initialFilters, null, 2));
    // Tại đây bạn sẽ gọi hàm `applyFilter` (hàm lọc dữ liệu) với appliedFilter này
    onApplyFilters(initialFilters);
    onClose();
  };

  const handleClearAllFilters = () => {
    // setAppliedFilter(initialFilterState);
    onClearFilters();
    onApplyFilters(initialFilterState);
  };
  // Cập nhật state cục bộ khi initialFilters thay đổi từ bên ngoài (ví dụ: khi mở panel)
  // useEffect(() => {
  //   // Đảm bảo tạo một bản sao sâu nếu initialFilters chứa các đối tượng có thể bị sửa đổi
  //   setAppliedFilter(initialFilters?.length ? JSON.parse(JSON.stringify(initialFilters)) : initialFilterState);
  // }, [initialFilters]);

  if (!isOpen) return null;
  // console.log(appliedFilter);
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onClear={handleClearAllFilters}
      onApply={handleApplyFilters}
      className='filter-panel'
      // container={container}
      title='Filters'
    >
      <div className="filter-builder-content">
        <FilterGroup
          group={initialFilters} // Truyền nhóm gốc
          onUpdateGroup={handleUpdateGroup}
          onAddRule={handleAddRule}
          onAddGroup={handleAddGroup}
          onDeleteRule={handleDeleteRule}
          depth={0}
          filtercolumns={filtercolumns}
        />

      </div>
      {/* DEBUG: Display current filter state */}
      {/* <pre style={{ marginTop: '20px', fontSize: '10px', backgroundColor: '#eee', padding: '10px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
        {JSON.stringify(initialFilters, null, 2)}
      </pre> */}
    </Modal>
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
export default FilterModal;
