import React, { useEffect, useState } from "react";
import "../../styles/GroupRolesManager.css"; // tạo file CSS đi kèm

function GroupRolesManager() {
  const [groups, setGroups] = useState([]);
  const [allRoles, setAllRoles] = useState([]);
  const [groupRolesMap, setGroupRolesMap] = useState({}); // { group_id: [role_id, ...] }

  useEffect(() => {
    fetchGroups();
    fetchRoles();
  }, []);

  const fetchGroups = async () => {
    const res = await fetch("/api/groups");
    const data = await res.json();
    setGroups(data);
  };

  const fetchRoles = async () => {
    const res = await fetch("/api/roles");
    const data = await res.json();
    setAllRoles(data);

    // Fetch all group-role mappings
    const map = {};
    for (const group of groups) {
      const res = await fetch(`/api/groups/${group.group_id}/roles`);
      const roleIds = await res.json(); // [role_id...]
      map[group.group_id] = roleIds;
    }
    setGroupRolesMap(map);
  };

  const toggleRole = (groupId, roleId) => {
    const currentRoles = groupRolesMap[groupId] || [];
    const newRoles = currentRoles.includes(roleId)
      ? currentRoles.filter(id => id !== roleId)
      : [...currentRoles, roleId];
    setGroupRolesMap(prev => ({ ...prev, [groupId]: newRoles }));
  };

  const handleSave = async (groupId) => {
    await fetch(`/api/groups/${groupId}/roles`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role_ids: groupRolesMap[groupId] })
    });
    alert("Roles updated!");
  };

  return (
    <div className="group-roles-container">
      <h2>Group Roles Management</h2>
      {groups.map(group => (
        <div key={group.group_id} className="group-card">
          <h3>{group.group_name}</h3>
          <div className="roles-grid">
            {allRoles.map(role => (
              <label key={role.role_id} className="checkbox">
                <input
                  type="checkbox"
                  checked={groupRolesMap[group.group_id]?.includes(role.role_id) || false}
                  onChange={() => toggleRole(group.group_id, role.role_id)}
                />
                {role.role_name}
              </label>
            ))}
          </div>
          <button onClick={() => handleSave(group.group_id)}>Save Roles</button>
        </div>
      ))}
    </div>
  );
}

export default GroupRolesManager;
