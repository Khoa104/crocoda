function authorize(...allowedPermission) {
  return (req, res, next) => {
    const userPermissions = req.userPermissions || [];
    console.log(userPermissions)
    const userPermissionsSet = new Set(userPermissions.split(';').map(p => p.trim()));
    const hasPermission = allowedPermission.some(p => userPermissionsSet.has(p));

    if (!hasPermission) {
      return res.status(403).json({ message: "Access denied: insufficient permissions" });
    }
    next();
  };
}

module.exports = authorize;
