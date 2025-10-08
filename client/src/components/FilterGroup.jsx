// components/FilterGroup.jsx
import React from 'react';
import FilterCondition from './FilterCondition';
import { generateUniqueId, MAX_NESTING_DEPTH } from '../utils/filterUtils';
import { LucideAArrowDown } from 'lucide-react';
import * as LucideIcons from "lucide-react";

// Max depth for nested groups (0-indexed). 1 means one level of nesting is allowed.
// So, a group at depth 0 can contain a group, but a group at depth 1 cannot.
// const MAX_NESTING_DEPTH = 1;

const FilterGroup = ({ group, onUpdateGroup, onAddRule, onAddGroup, onDeleteRule, depth , filtercolumns}) => {
    const { id, logic, rules } = group;

    const handleLogicChange = (e) => {
        onUpdateGroup(id, { logic: e.target.value });
    };

    const handleAddRule = () => {
        onAddRule(id, {
            id: generateUniqueId(),
            type: "condition",
            field: "",
            operator: "",
            value: "",
            dataType: ""
        });
    };

    const handleAddGroup = () => {
        onAddGroup(id, {
            id: generateUniqueId(),
            type: "group",
            logic: "all", // Default to 'all' for new groups
            rules: []
        });
    };

    // Determine if adding a new group is allowed at the current depth
    const canAddGroup = depth < MAX_NESTING_DEPTH;

    return (
        <div className="filter-group-container">
            <div className="filter-group-header">
                <span className="filter-group-label">Match</span>
                <select value={logic} onChange={handleLogicChange} className="filter-dropdown any-or-all">
                    <option value="any">any</option>
                    <option value="all">all</option>
                </select>
                <span className="filter-group-label">of the following rules:</span>
                {/* You can add a delete group button here if this is not the root group */}
            </div>
            <div className="filter-group-body">
                {rules.map((rule, index) => (
                    <div key={rule.id} className="filter-rule-item">
                        {rule.type === "condition" ? (
                            <FilterCondition
                                condition={rule}
                                onUpdate={(ruleId, updates) => {
                                    onUpdateGroup(id, {
                                        rules: rules.map(r => r.id === ruleId ? { ...r, ...updates } : r)
                                    });
                                }}
                                onDelete={(ruleId) => onDeleteRule(id, ruleId)}
                                filtercolumns = {filtercolumns}
                            />
                        ) : (
                            <FilterGroup
                                group={rule}
                                onUpdateGroup={(groupId, updates) => {
                                    onUpdateGroup(id, {
                                        rules: rules.map(r => r.id === groupId ? { ...r, ...updates } : r)
                                    });
                                }}
                                onAddRule={onAddRule}
                                onAddGroup={onAddGroup}
                                onDeleteRule={onDeleteRule}
                                depth={depth + 1} // Increment depth for nested groups
                                filtercolumns = {filtercolumns}
                            />
                        )}
                         {/* Delete button for nested groups (if not the root group) */}
                         {rule.type === "group" && (
                            <button onClick={() => onDeleteRule(id, rule.id)} className="filter-icon-button delete-group-button" title="Remove Group">
                                <LucideIcons.Trash size={20} />
                            </button>
                        )}
                    </div>
                ))}
                <div className="filter-group-actions">
                    <button onClick={handleAddRule} className="filter-action-button">
                        + Add Rule
                    </button>
                    {/* Conditionally render or disable the "Add Group" button */}
                    {canAddGroup && (
                        <button onClick={handleAddGroup} className="filter-action-button">
                            + Add Group
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FilterGroup;
