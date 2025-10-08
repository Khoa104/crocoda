
// server/authMiddleware.js
const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const token = req.cookies?.accessToken;
  if (!token) return res.status(401).json({code: "NO_TOKEN", message: "Access Denied. No Token Provided." });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ code: "TOKEN_EXPIRED", message: "Token expired" });
      }
      return res.status(401).json({ code: "INVALID_TOKEN", message: "Invalid token" });
    };
    req.user = user;
    req.userPermissions = user.permissions
    next();
  });
}

module.exports = authenticateToken;
