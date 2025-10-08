import React, { useState, useEffect } from "react";
import { getAllRoles, createOrUpdateRole, deleteRole, getAllResources } from "../../api/api";
// import "../../styles/UserModule.css";
// import "../styles/RolesManagement.css";

// const initialRoles = [
//   {
//     role_id: "270ce8e0-c2c6-4d32-ba28-af5d4e447aa8",
//     role_name: "finance_staff",
//     description: "Chỉ có quyền xem thông tin tài chính",
//     permissions: "Finance_financialreport_view"
//   }
// ];

// Sidebar, app.jsx
const actions = ["view", "create", "edit", "delete"];

export default function RolesManagement() {
  const [roles, setRoles] = useState([]);
  const [resources, setResources] = useState([]);
  const [editingRole, setEditingRole] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res2 = await getAllRoles();
        const res = await getAllResources();
        setRoles(res2);
        setResources(res);
      } catch (error) {
        console.error("Failed to fetch data:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [])

  const parsePermissions = (permString) =>
    permString ? permString.split(";").filter(Boolean) : [];

  const togglePermission = (perm) => {
    const current = parsePermissions(editingRole.permissions);
    const has = current.includes(perm);
    const updated = has
      ? current.filter(p => p !== perm)
      : [...current, perm];
    setEditingRole({ ...editingRole, permissions: updated.join(";") });
  };

  const saveRole = async () => {
    try {
      const roleData = {
        role_id: editingRole.role_id, // Nếu có thì sẽ update
        role_name: editingRole.role_name,
        description: editingRole.description,
        permissions: editingRole.permissions,
        type: editingRole.type
      };

      const res = await createOrUpdateRole(roleData);
      const newRole = res.data;

      if (editingRole.role_id) {
        // Update frontend list
        setRoles(prev =>
          prev.map(u => (u.role_id === editingRole.role_id ? newRole : u))
        );
      } else {
        // Add new role
        setRoles(prev => [...prev, newRole]);
      }
      setEditingRole(null);
    } catch (err) {
      console.error("Failed to save role:", err.message);
    }
  };
  const handleDeleteRole = async (roleid) => {
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa Role này?");
    if (!confirmDelete) return;
    try {
      const res = await deleteRole(roleid);
      if (res.status && res.status !== 200 && res.status !== 204) {
        throw new Error("Không có quyền hoặc lỗi server");
      }
      setRoles(prev => prev.filter(r => r.role_id !== roleid));
    } catch (error) {
      console.error("Xóa Role thất bại:", error.message);
      alert("Xóa Role thất bại. Vui lòng thử lại.");
    }
  };
  const cancelEdit = () => setEditingRole(null);

  const filteredRoles = roles.filter(r =>
    r.role_name.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="container1">
      <div className="page-container roles-management-page">
        <header className="page-header">
          {/* <h2 className="page-title">Roles Management</h2> */}
          <button
            className="btn btn-primary"
            onClick={() =>
              setEditingRole({
                role_name: "",
                description: "",
                type: "Personal", // Mặc định type là Personal khi thêm mới
                permissions: ""
              })
            }
          >
            <i className="icon-plus"></i> Add Role
          </button>
        </header>

        {/* <div className="search-bar">
          <input
            type="text"
            className="form-control search-input"
            placeholder="🔍 Tìm kiếm role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div> */}

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Role Name</th>
                <th>Description</th>
                <th>Type</th>
                <th>Permissions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoles.map((role) => (
                <tr key={role.role_id}>
                  <td>{role.role_name}</td>
                  <td>{role.description}</td>
                  <td>
                    <span className={`tag tag-${role.type === "Group" ? "primary" : "secondary"}`}>
                      {role.type}
                    </span>
                  </td>
                  <td>
                    <div className="tag-group">
                      {parsePermissions(role.permissions).map((perm) => (
                        <span className="tag tag-info" key={perm}>{perm}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-secondary" onClick={() => setEditingRole({ ...role })}>Edit</button>
                      <button className="btn btn-danger" onClick={() => handleDeleteRole(role.role_id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editingRole && (
          <div className="modal-backdrop">
            <div className="modal-content">
              <h3 className="modal-title">{editingRole.role_id ? "Edit Role" : "Add Role"}</h3>

              <div className="form-group">
                <label htmlFor="roleName">Role Name</label>
                <input
                  id="roleName"
                  type="text"
                  className="form-control"
                  value={editingRole.role_name}
                  onChange={(e) =>
                    setEditingRole({ ...editingRole, role_name: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="roleType">Type</label>
                <select
                  id="roleType"
                  className="form-control"
                  value={editingRole.type}
                  onChange={(e) =>
                    setEditingRole({ ...editingRole, type: e.target.value })
                  }
                >
                  <option value="Personal">Personal</option>
                  <option value="Group">Group</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="roleDescription">Description</label>
                <input
                  id="roleDescription"
                  type="text"
                  className="form-control"
                  value={editingRole.description}
                  onChange={(e) =>
                    setEditingRole({ ...editingRole, description: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Permissions</label>
                <div className="permission-grid">
                  <div className="table-responsive-sm">
                    <table className="data-table perm-table">
                      <thead>
                        <tr>
                          <th>Module</th>
                          <th>Resource</th>
                          {actions.map((a) => (
                            <th key={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {resources.map(({ module_key: module, resource_name: resource}) => (
                          <tr key={`${module}_${resource}`}>
                            <td>{module}</td>
                            <td>{resource}</td>
                            {actions.map((action) => {
                              const permKey = `${module}_${resource}_${action}`;
                              const checked = parsePermissions(editingRole.permissions).includes(permKey);
                              return (
                                <td key={action} className="text-center">
                                  <label className="checkbox-item checkbox-inline">
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => togglePermission(permKey)}
                                    />
                                  </label>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn btn-outline-secondary" onClick={cancelEdit}>Cancel</button>
                <button className="btn btn-primary" onClick={saveRole}>Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



// import React, { useState } from "react";
// import "../styles/UserManagement.css"; // Dùng lại CSS dùng chung

// const allPermissions = [
//   { permission_id: 1, permission_code: "Finance_financialreport_view" },
//   { permission_id: 2, permission_code: "Content_article_create" },
//   { permission_id: 3, permission_code: "Content_article_edit" },
//   { permission_id: 4, permission_code: "HR_employee_manage" },
// ];

// const initialRoles = [
//   {
//     role_id: 1,
//     role_name: "super_admin",
//     permissions: [1, 2, 3, 4],
//   },
//   {
//     role_id: 2,
//     role_name: "finance_viewer",
//     permissions: [1],
//   },
//   {
//     role_id: 3,
//     role_name: "content_creator",
//     permissions: [2, 3],
//   },
// ];

// export default function RolesManagement() {
//   const [roles, setRoles] = useState(initialRoles);

//   const togglePermission = (roleId, permissionId) => {
//     setRoles(prevRoles =>
//       prevRoles.map(role => {
//         if (role.role_id === roleId) {
//           const hasPerm = role.permissions.includes(permissionId);
//           return {
//             ...role,
//             permissions: hasPerm
//               ? role.permissions.filter(p => p !== permissionId)
//               : [...role.permissions, permissionId],
//           };
//         }
//         return role;
//       })
//     );
//   };

//   return (
//     <div className="container user-management">
//       <h2>Roles Management</h2>

//       <table className="table">
//         <thead>
//           <tr>
//             <th>Role</th>
//             {allPermissions.map(p => (
//               <th key={p.permission_id}>
//                 <div className="vertical-text">
//                   {p.permission_code}
//                 </div>
//               </th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {roles.map(role => (
//             <tr key={role.role_id}>
//               <td>{role.role_name}</td>
//               {allPermissions.map(p => (
//                 <td key={p.permission_id}>
//                   <input
//                     type="checkbox"
//                     checked={role.permissions.includes(p.permission_id)}
//                     onChange={() => togglePermission(role.role_id, p.permission_id)}
//                   />
//                 </td>
//               ))}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }
