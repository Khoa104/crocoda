import React, { useState, useEffect } from "react";
// import "../../styles/UserModule.css";
import { getGroups, getAllRoles, getDepartments, getTitles, createOrUpdateGroup, deleteGroup } from "../../api/api"; // dùng nếu cần gọi API thật

export default function GroupManagement() {
  const [groups, setGroups] = useState([]);
  const [editingGroup, setEditingGroup] = useState(null);
  const [showCustomDepartment, setShowCustomDepartment] = useState(false);
  const [showCustomTitle, setShowCustomTitle] = useState(false);
  const [useExistingRole, setuseExistingRole] = useState(false);
  const [allRoles, setAllRoles] = useState([]);
  const [departments, setdepartments] = useState([]);
  const [titles, settitles] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchAllRoles = async () => {
    try {
      const res2 = await getAllRoles();
      setAllRoles(res2);
    } catch (error) {
      console.error("Failed to fetch roles:", error.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getGroups();
        setGroups(res);
        const res2 = await getAllRoles();
        setAllRoles(res2);
        const res3 = await getDepartments();
        setdepartments(res3);
        const res4 = await getTitles();
        settitles(res4);
      } catch (error) {
        console.error("Failed to fetch data:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    fetchAllRoles();
  }, [])
  const saveGroup = async () => {
    try {
      const groupData = {
        group_id: editingGroup.group_id, // Nếu có thì sẽ update
        group_name: editingGroup.group_name,
        department: editingGroup.department,
        title: editingGroup.title,
        role_id: editingGroup.role_id,
      };
      const res = await createOrUpdateGroup(groupData);
      const newGroup = res.data;
      if (editingGroup.group_id) {
        // Update frontend list
        setGroups(prev =>
          prev.map(u => (u.group_id === editingGroup.group_id ? newGroup : u))
        );
      } else {
        // Add new group
        setGroups(prev => [...prev, newGroup]);
      }
      if (editingGroup.department && !departments.includes(editingGroup.department)) {
        setdepartments(prev => [...prev, editingGroup.department]);
      }
      if (editingGroup.title && !titles.includes(editingGroup.title)) {
        settitles(prev => [...prev, editingGroup.title]);
      }
      if (!useExistingRole) { fetchAllRoles() }
      setEditingGroup(null);
      setShowCustomDepartment(null);
      setShowCustomTitle(null);
      setuseExistingRole(null);
    } catch (err) {
      console.error("Failed to save group:", err.message);
    }
  };
  const handleDeleteGroup = async (groupid) => {
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa Group này?");
    if (!confirmDelete) return;
    try {
      const res = await deleteGroup(groupid);
      if (res.status && res.status !== 200 && res.status !== 204) {
        throw new Error("Không có quyền hoặc lỗi server");
      }
      setGroups(prev => prev.filter(g => g.group_id !== groupid));
    } catch (error) {
      console.error("Xóa Group thất bại:", error.message);
      alert("Xóa Group thất bại. Vui lòng thử lại.");
    }
  };

  const filteredGroups = groups.filter(g => g.group_name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.group_name.localeCompare(b.group_name));
  const cancelEdit = () => {
    setEditingGroup(null);
    setShowCustomDepartment(null);
    setShowCustomTitle(null);
    setuseExistingRole(null)
  }
  return (
    <div className="container1">
      <div className="page-container group-management-page">
        <header className="page-header">
          {/* <h2 className="page-title">Group Management</h2> */}
          <button
            className="btn btn-primary"
            onClick={() =>
              setEditingGroup({
                group_name: "",
                department: departments[0] || "",
                title: titles[0] || "",
                role_id: ""
              })
            }
          >
            <i className="icon-plus"></i> Add Group
          </button>
        </header>

        {/* <div className="search-bar">
          <input
            type="text"
            className="form-control search-input"
            placeholder="🔍 Tìm kiếm theo group name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div> */}

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Group Name</th>
                <th>Department</th>
                <th>Title</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGroups.map((g) => (
                <tr key={g.group_id}>
                  <td>{g.group_name}</td>
                  <td>{g.department}</td>
                  <td>{g.title}</td>
                  <td>
                    <div className="tag-group">
                      <span className="tag tag-info">
                        {allRoles.find((r) => r.role_id === g.role_id)?.role_name || "—"}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-secondary" onClick={() => setEditingGroup({ ...g })}>Edit</button>
                      <button className="btn btn-danger" onClick={() => handleDeleteGroup(g.group_id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editingGroup && (
          <div className="modal-backdrop">
            <div className="modal-content">
              <h3 className="modal-title">{editingGroup.group_id ? "Edit Group" : "Add Group"}</h3>

              <div className="form-group">
                <label htmlFor="groupName">Group Name</label>
                <input
                  id="groupName"
                  type="text"
                  className="form-control"
                  value={editingGroup.group_name}
                  onChange={(e) =>
                    setEditingGroup({ ...editingGroup, group_name: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="groupDepartment">Department</label>
                <select
                  id="groupDepartment"
                  className="form-control"
                  value={editingGroup.department}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "__custom__") {
                      setEditingGroup({ ...editingGroup, department: "" });
                      setShowCustomDepartment(true);
                    } else {
                      setEditingGroup({ ...editingGroup, department: value });
                      setShowCustomDepartment(false);
                    }
                  }}
                >
                  <option value="">-- Select --</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                  <option value="__custom__">+ Thêm mới...</option>
                </select>
              </div>
              {showCustomDepartment && (
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nhập Department mới"
                    value={editingGroup.department}
                    onChange={(e) =>
                      setEditingGroup({ ...editingGroup, department: e.target.value })
                    }
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="groupTitle">Title</label>
                <select
                  id="groupTitle"
                  className="form-control"
                  value={editingGroup.title}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "__custom_title__") {
                      setShowCustomTitle(true);
                      setEditingGroup({ ...editingGroup, title: "" });
                    } else {
                      setShowCustomTitle(false);
                      setEditingGroup({ ...editingGroup, title: value });
                    }
                  }}
                >
                  <option value="">-- Select Title --</option>
                  {titles.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                  <option value="__custom_title__">+ Thêm mới...</option>
                </select>
              </div>
              {showCustomTitle && (
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nhập title mới"
                    value={editingGroup.title}
                    onChange={(e) =>
                      setEditingGroup({ ...editingGroup, title: e.target.value })
                    }
                  />
                </div>
              )}

              {!editingGroup.group_id && (
                <div className="form-group">
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={!!useExistingRole}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setuseExistingRole(checked);
                        if (checked) {
                          setEditingGroup({ ...editingGroup, role_id: "" });
                        }
                      }}
                    />
                    Sử dụng role có sẵn
                  </label>
                </div>
              )}

              {(editingGroup.group_id || useExistingRole) && (
                <div className="form-group">
                  <label>Group Role</label>
                  <div className="radio-group">
                    {allRoles.filter(r => r.type === "Group").map((role) => (
                      <label key={role.role_id} className="radio-item">
                        <input
                          type="radio"
                          name="group-role"
                          checked={editingGroup.role_id === role.role_id}
                          onChange={() =>
                            setEditingGroup({ ...editingGroup, role_id: role.role_id })
                          }
                        />
                        {role.role_name}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button className="btn btn-outline-secondary" onClick={cancelEdit}>Cancel</button>
                <button className="btn btn-primary" onClick={saveGroup}>Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
