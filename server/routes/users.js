const express = require("express");
const router = express.Router();
const supabase = require("../supabase");
const bcrypt = require("bcrypt");
const authenticateToken = require("../middleware/authenticateToken"); 
const authorize = require("../middleware/authorizePermission")

router.get("/allmodules", authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('modules')
      .select('module_key, module_label, icon')
      .order('sort_order', { ascending: true });
    if (error) {
      console.error('Error fetching modules:', error);
    } else {
      console.log('Fetched modules:', data);
    }
    if (error) return res.status(500).json({ message: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
    console.log('Fetched fail:', err);
  }
});
router.get("/allresources", authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('module_key', { ascending: true })
      .order('resource_id', { ascending: true });
    if (error) {
      console.error('Error fetching resources:', error);
    } else {
      console.log('Fetched resources:', data);
    }
    if (error) return res.status(500).json({ message: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
    console.log('Fetched fail:', err);
  }
});

router.get("/users", authenticateToken, authorize("User_User_view"), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('user_id, email, full_name, status, groups(department, title), user_roles(role_id)')
      .order('full_name', { ascending: true });
    if (error) {
      console.error('Error fetching users:', error);
    } else {
      console.log('Fetched users:', data);
    }
    if (error) return res.status(500).json({ message: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
    console.log('Fetched fail:', err);
  }
});
router.get("/allRoles", authenticateToken, authorize("User_Roles_view"), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('role_id, role_name, description, type, permissions')
      .order('role_name', { ascending: true });
    if (error) {
      console.error('Error fetching all roles:', error);
    } else {
      console.log('Fetched all roles:', data);
    }
    if (error) return res.status(500).json({ message: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
    console.log('Fetched fail:', err);
  }
});
router.get("/departments", authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('groups')
      .select('department', { count: 'exact' })
      .order('department', { ascending: true });
    if (error) {
      console.error('Error fetching departments:', error);
    } else {
      console.log('Fetched departments:', data);
    }
    if (error) return res.status(500).json({ message: error.message });
    const req1 = [...new Set(data.map(item => item.department))];
    res.json(req1);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
    console.log('Fetched fail:', err);
  }
});
router.get("/titles", authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('groups')
      .select('title', { count: 'exact' })
      .order('title', { ascending: true });
    if (error) {
      console.error('Error fetching titles:', error);
    } else {
      console.log('Fetched titles:', data);
    }
    if (error) return res.status(500).json({ message: error.message });
    const req1 = [...new Set(data.map(item => item.title))];
    res.json(req1);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
    console.log('Fetched fail:', err);
  }
});

// Create Update Delete User
router.post('/saveUser',authenticateToken, authorize("User_User_update"), async (req, res) => {
  const {
    user_id,
    email,
    full_name,
    status,
    department,
    title,
    user_roles,
  } = req.body;
  try {
    // 1. Tìm group_id theo department + title
    const { data: groupData, error: groupErr } = await supabase
      .from('groups')
      .select('group_id')
      .eq('department', department)
      .eq('title', title)
      .single();

    if (groupErr || !groupData) {
      return res.status(400).json({ error: 'Group not found' });
    }
    const group_id = groupData.group_id;
    let userResult;
    if (user_id) {
      // UPDATE USER
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          email,
          full_name,
          status,
          group_id,
        })
        .eq('user_id', user_id)
        .select()
        .single();
      if (updateError) throw updateError;
      userResult = updatedUser;
      // Xóa roles cũ
      await supabase.from('user_roles').delete().eq('user_id', user_id);
      // Thêm roles mới
      if (user_roles?.length) {
        const newRoles = user_roles.map(r => ({ user_id, role_id: r.role_id }));
        await supabase.from('user_roles').insert(newRoles);
      }
    } else {
      // CREATE USER
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          email,
          full_name,
          status,
          group_id,
          password_hash: '$2b$10$qrOr7vItTmVVkVa.f1bneOuvfW861lYDFDSAX9vmOrJabyYZ6WwzG'
        })
        .select()
        .single();
      if (insertError) throw insertError;
      userResult = newUser;
      // Thêm roles
      if (user_roles?.length) {
        const newRoles = user_roles.map(r => ({ user_id: userResult.user_id, role_id: r.role_id }));
        await supabase.from('user_roles').insert(newRoles);
      }
    }
    // Lấy lại dữ liệu user kèm group và roles
    const { data: fullUser, error: userFetchError } = await supabase
      .from('users')
      .select(`
        user_id, email, full_name, status,
        groups:group_id (department, title),
        user_roles (role_id)
      `)
      .eq('user_id', userResult.user_id)
      .single();
    if (userFetchError) throw userFetchError;
    res.json(fullUser);
  } catch (err) {
    console.error('Error creating/updating user:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});
router.post('/deleteUser', authenticateToken, authorize("User_User_delete"), async (req, res) => {
  try {
    const { user_id } = req.body;
    const { data: deleteRole, error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('user_id', user_id)
      .select()
      .single();

    if (deleteError) throw deleteError;
    res.json({ success: true, deleted: deleteRole });
  } catch (err) {
    console.error('Error deleting group:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// View Create Update Delete Group
router.get("/groups", authenticateToken, authorize("User_GroupUser_view"), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('groups')
      .select('group_id, group_name, department, title, role_id')
      .order('department', { ascending: true })
      .order('title', { ascending: true });
    if (error) {
      console.error('Error fetching groups:', error);
    } else {
      console.log('Fetched groups:', data);
    }
    if (error) return res.status(500).json({ message: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
    console.log('Fetched fail:', err);
  }
});
router.post('/saveGroup',authenticateToken, authorize("User_GroupUser_update"), async (req, res) => {
  const {
    group_id,
    group_name,
    department,
    title,
    role_id,
  } = req.body;
  try {
    let groupResult;
    if (group_id) {
      // UPDATE GROUP
      const { data: updatedGroup, error: updateError } = await supabase
        .from('groups')
        .update({ group_name, department, title, role_id })
        .eq('group_id', group_id)
        .select().single();
      if (updateError) throw updateError;
      groupResult = updatedGroup;
    } else {
      // CREATE GROUP
      if (role_id) {
        const { data: newGroup, error: insertError } = await supabase
          .from('groups')
          .insert({
            group_name, department, title, role_id
            // ...(role_id ? { role_id } : {})
          })
          .select()
          .single();
        if (insertError) throw insertError;
        groupResult = newGroup;
      } else {
        const { data: newRole, error: roleinsertError } = await supabase
          .from('roles')
          .insert({
            role_name: `${department} ${title}`,
            title: "Group"
          })
          .select()
          .single();
        if (roleinsertError) throw roleinsertError;

        const { data: newGroup, error: groupinsertError } = await supabase
          .from('groups')
          .insert({
            group_name, department, title, role_id : newRole.role_id
          })
          .select()
          .single();
        if (groupinsertError) throw groupinsertError;
        groupResult = newGroup;
      }
    }
    // Lấy lại dữ liệu group
    const { data: fullGroup, error: groupFetchError } = await supabase
      .from('groups')
      .select(`
        group_id, group_name, department, title, role_id
      `)
      .eq('group_id', groupResult.group_id)
      .single();
    if (groupFetchError) throw groupFetchError;
    res.json(fullGroup);
  } catch (err) {
    console.error('Error creating/updating group:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});
router.post('/deleteGroup', authenticateToken, authorize("User_GroupUser_delete"), async (req, res) => {
  try {
    const { group_id } = req.body;

    const { data: deleteGroup, error: deleteError } = await supabase
      .from('groups')
      .delete()
      .eq('group_id', group_id)
      .select()
      .single();

    if (deleteError) throw deleteError;

    res.json({ success: true, deleted: deleteGroup });
  } catch (err) {
    console.error('Error deleting group:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Create Update Delete Roles
router.post('/saveRole', authenticateToken, authorize("User_Roles_view"), async (req, res) => {
  const {
    role_id,
    role_name,
    description,
    type,
    permissions
  } = req.body;
  try {
    let roleResult;
    if (role_id) {
      // UPDATE ROLE
      const { data: updatedRole, error: updateError } = await supabase
        .from('roles')
        .update({
          role_name,
          description,
          type,
          permissions
        })
        .eq('role_id', role_id)
        .select()
        .single();
      if (updateError) throw updateError;
      roleResult = updatedRole;
    } else {
      // CREATE ROLE
      const { data: newRole, error: insertError } = await supabase
        .from('roles')
        .insert({
          role_id,
          role_name,
          description,
          type,
          permissions
        })
        .select()
        .single();
      if (insertError) throw insertError;
      roleResult = newRole;
    }
    // Lấy lại dữ liệu role
    const { data: fullRole, error: roleFetchError } = await supabase
      .from('roles')
      .select(`
        role_id, role_name, description, type, permissions
      `)
      .eq('role_id', roleResult.role_id)
      .single();
    if (roleFetchError) throw roleFetchError;
    res.json(fullRole);
  } catch (err) {
    console.error('Error creating/updating role:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});
router.post('/deleteRole', authenticateToken, authorize("User_Roles_delete"), async (req, res) => {
  try {
    const { role_id } = req.body;
    const { data: deleteRole, error: deleteError } = await supabase
      .from('roles')
      .delete()
      .eq('role_id', role_id)
      .select()
      .single();

    if (deleteError) throw deleteError;
    res.json({ success: true, deleted: deleteRole });
  } catch (err) {
    console.error('Error deleting group:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

module.exports = router;


