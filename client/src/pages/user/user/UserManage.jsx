import React, { useEffect, useState } from "react";
import "./../user/UserModule.css";
import { getUsers, getAllRoles, getDepartments, getTitles, createOrUpdateUser, deleteUser } from "../../../api/api";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [allRoles, setAllRoles] = useState([]);
  const [departments, setdepartments] = useState([]);
  const [titles, settitles] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  // useEffect(() => {
  //   supportedViewTypes(['list', 'gallery', 'board']);
  // }, [supportedViewTypes])
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getUsers();
        setUsers(res);
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
  }, [])

  const startEdit = (user) => {
    const editable = {
      user_id: user.user_id,
      name: user.full_name,
      email: user.email,
      department: user.groups.department,
      title: user.groups.title,
      status: user.status,
      roles: user.user_roles?.map(r => r.role_id) || []
    };
    setEditingUser(editable);
    console.log(departments)
  };

  const cancelEdit = () => setEditingUser(null);

  const filteredUsers = users.filter(user =>
    (user.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (user.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const saveUser = async () => {
    try {
      const userData = {
        user_id: editingUser.user_id, // Nếu có thì sẽ update
        user_name: editingUser.user_name,
        email: editingUser.email,
        full_name: editingUser.name,
        status: editingUser.status,
        department: editingUser.department,
        title: editingUser.title,
        user_roles: editingUser.roles?.map(role_id => ({ role_id })) || []
      };

      const res = await createOrUpdateUser(userData);
      const newUser = res.data;
      if (editingUser.user_id) {
        // Update frontend list
        setUsers(prev =>
          prev.map(u => (u.user_id === editingUser.user_id ? newUser : u))
        );
      } else {
        // Add new user
        setUsers(prev => [...prev, newUser]);
      }

      setEditingUser(null);
    } catch (err) {
      console.error("Failed to save user:", err.message);
    }
  };
  const handleDeleteUser = async (userid) => {
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa User này?");
    if (!confirmDelete) return;
    try {
      const res = await deleteUser(userid);
      // Kiểm tra status code nếu hàm deleteUser không tự throw lỗi
      if (res.status && res.status !== 200 && res.status !== 204) {
        throw new Error("Không có quyền hoặc lỗi server");
      }
      setUsers(prev => prev.filter(u => u.user_id !== userid));
    } catch (error) {
      console.error("Xóa User thất bại:", error.message);
      alert("Xóa User thất bại. Vui lòng thử lại.");
    }
  };

  const toggleRole = (roleId) => {
    if (!editingUser) return;
    const hasRole = editingUser.roles.includes(roleId);
    const newRoles = hasRole
      ? editingUser.roles.filter((r) => r !== roleId)
      : [...editingUser.roles, roleId];
    setEditingUser({ ...editingUser, roles: newRoles });
  };
  return (
    <div className="container">
      <div className="page-container user-management-page">
        <header className="page-header">
          <button
            className="btn btn-primary"
            onClick={() =>
              setEditingUser({
                name: "",
                email: "",
                // password: "",
                roles: [],
                department: departments.length > 0 ? departments[0] : "", // Khởi tạo với giá trị đầu tiên nếu có
                title: titles.length > 0 ? titles[0] : "", // Khởi tạo với giá trị đầu tiên nếu có
                status: "active",
              })
            }
          >
            <i className="icon-plus"></i> Add User
          </button>
        </header>

        {/* <div className="search-bar">
          <input
            type="text"
            className="form-control search-input"
            placeholder="🔍 Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div> */}

        {loading ? ( // Hiển thị trạng thái tải
          <div className="loading-spinner">Loading users...</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Title</th>
                  <th>Roles</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.user_id}>
                    <td>{u.full_name}</td>
                    <td>{u.email}</td>
                    {/* Sử dụng optional chaining để truy cập nested properties */}
                    <td>{u.groups?.department || "N/A"}</td>
                    <td>{u.groups?.title || "N/A"}</td>
                    <td>
                      <div className="tag-group">
                        {u.user_roles?.map((r) => {
                          const role = allRoles.find((ar) => ar.role_id === r.role_id);
                          return role ? (
                            <span key={r.role_id} className="tag tag-info">
                              {role.role_name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </td>
                    <td>
                      <span className={`status-tag status-tag-${u.status}`}>
                        {u.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-secondary"
                          onClick={() => startEdit(u)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDeleteUser(u.user_id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {editingUser && (
          <div className="modal-backdrop">
            <div className="modal-content">
              <h3 className="modal-title">
                {editingUser.user_id ? "Edit User" : "Add User"}
              </h3>

              <div className="form-group">
                <label htmlFor="userName">Full Name</label> {/* Đổi từ Name sang Full Name */}
                <input
                  id="userName"
                  type="text"
                  className="form-control"
                  value={editingUser.name}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, name: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="userEmail">Email</label>
                <input
                  id="userEmail"
                  type="email"
                  className="form-control"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="userDepartment">Department</label>
                  <select
                    id="userDepartment"
                    className="form-control"
                    value={editingUser.department}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, department: e.target.value })
                    }
                  >
                    {/* Render Department options */}
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="userTitle">Title</label>
                  <select
                    id="userTitle"
                    className="form-control"
                    value={editingUser.title}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, title: e.target.value })
                    }
                  >
                    {/* Render Title options */}
                    {titles.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Personal Roles</label>
                <div className="checkbox-group">
                  {allRoles
                    .filter((r) => r.type === "Personal")
                    .map((role) => (
                      <label key={role.role_id} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={editingUser.roles.includes(role.role_id)}
                          onChange={() => toggleRole(role.role_id)}
                        />
                        {role.role_name}
                      </label>
                    ))}
                </div>
              </div>

              <div className="form-group status-toggle">
                <label htmlFor="userStatus">Status:</label>
                <select
                  id="userStatus"
                  className="form-control"
                  value={editingUser.status}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, status: e.target.value })
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="modal-actions">
                <button
                  className="btn btn-outline-secondary"
                  onClick={cancelEdit}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={saveUser}>
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

}
