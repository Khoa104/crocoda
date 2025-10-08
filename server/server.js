// server/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const scmRoutes = require("./routes/scm");
// const productRoutes = require("./routes/products");

const app = express();
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  "https://crocoda.qzz.io",
  "https://crocoda-dev.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// handle preflight properly
app.options(/.*/, (req, res) => {
  res.sendStatus(200);
});

app.use("/auth", authRoutes);
app.use("/user", usersRoutes);
app.use("/scm", scmRoutes);

// app.use("/api/products", productRoutes);
// Health check route
// app.get("/", (req, res) => {
//   res.send("✅ Crocoda backend is running on Render!");
// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
