require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const supabase = require("../supabase");
const bcrypt = require("bcrypt");

function generateAccessToken(payload) {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "45m" });
}

function generateRefreshToken(payload) {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
}

// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data: _user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("status", "active")
      .single();

    if (error || !_user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    // Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(password, _user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    // Lấy danh sách quyền của người dùng
    const { data: userPermissionsResult } = await supabase.rpc('get_user_permissions', { p_user_id: _user.user_id });
    const _permissions = userPermissionsResult.map(item => item.permission_name).join(";");
    // Lưu Refresh Token vào database (để bảo mật hơn)
    // await supabase.from("users").update({ refresh_token: refreshToken }).eq("user_id", _user.user_id);

    // Tạo Access Token và Refresh Token
    const userPayload = { user_id: _user.user_id, email: _user.email, full_name: _user.full_name, permissions: _permissions }
    const accessToken = generateAccessToken(userPayload);
    const refreshToken = generateRefreshToken(userPayload);

    // Lưu Refresh Token trong HTTP-Only Cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      //sameSite: "Strict", //"Strict",   // Bảo vệ chống CSRF
      sameSite: "none", //"none",   // khác site
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });
    res.cookie("accessToken", accessToken, {
      httpOnly: true,       // Không cho JS truy cập → chống XSS
      secure: true,         // Bắt buộc HTTPS trong production
      //sameSite: "Strict", //"Strict",   // Bảo vệ chống CSRF
      sameSite: "none", //"none",   // khác site
      maxAge: 45 * 60 * 1000 // 1 giờ
    });
    res.json({ accessToken, user: userPayload });
    console.log('User Login Successful');
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/refresh-token", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: "Unauthorized" });
  try {
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, user) => {
      if (err) return res.status(403).json({ message: "Invalid Refresh Token" });
      // 🔐 Kiểm tra refresh token trong database
      // const { data: _user } = await supabase
      //   .from("users")
      //   .select("refresh_token")
      //   .eq("id", user.id)
      //   .single();

      // if (_user?.refresh_token !== refreshToken) {
      //   return res.status(403).json({ message: "Invalid Refresh Token" });
      // }

      // ✅ Tạo Access Token mới
      const userPayload = { user_id: user.user_id, email: user.email, full_name: user.full_name, permissions: user.permissions }
      const newAccessToken = generateAccessToken(userPayload);
      const newRefreshToken = generateRefreshToken(userPayload);
      // Cập nhật refresh token mới vào database
      // const { error: updateError } = await supabase
      //   .from("users")
      //   .update({ refresh_token: newRefreshToken })
      //   .eq("user_id", user.user_id);

      // if (updateError) {
      //   console.error("Refresh Token Error: Failed to update new refresh token in DB", updateError);
      //   return res.status(500).json({ message: "Internal Server Error - Could not update token." });
      // }

      // Gửi refresh token mới qua HTTP-Only Cookie
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true, // Đảm bảo true trong production (HTTPS)
        //sameSite: "Strict", //"Strict",   // Bảo vệ chống CSRF
        sameSite: "none", //"none",   // khác site
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
      });
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,       // Không cho JS truy cập → chống XSS
        secure: true,         // Bắt buộc HTTPS trong production
        //sameSite: "Strict", //"Strict",   // Bảo vệ chống CSRF
        sameSite: "none", //"none",   // khác site
        maxAge: 45 * 60 * 1000 // 1 giờ
      });
      res.json({ accessToken: newAccessToken, user: userPayload });
      console.log('Refresh Token Successful');
    });
  } catch (err) {
    console.error("Refresh Token Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Logout Route
router.post("/logout", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    // Xóa Refresh Token trong database
    await supabase.from("users").update({ refresh_token: null }).eq("refresh_token", refreshToken);
  }
  // Xóa Cookie
  res.clearCookie("refreshToken");
  res.send("Logged out");
  console.log('User Logout Successful');
});

module.exports = router;
