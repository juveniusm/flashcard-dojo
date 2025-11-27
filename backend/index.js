// backend/index.js
const express = require("express");
const cors = require("cors");
const { uploadDir } = require("./upload");

const authRoutes = require("./routes/authRoutes");
const deckRoutes = require("./routes/deckRoutes");
const cardRoutes = require("./routes/cardRoutes");
const progressRoutes = require("./routes/progressRoutes");
const sessionRoutes = require("./routes/sessionRoutes");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadDir));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is running 🧠" });
});

// Mount routes under /api
app.use("/api", authRoutes);
app.use("/api", deckRoutes);
app.use("/api", cardRoutes);
app.use("/api", progressRoutes);
app.use("/api", sessionRoutes);

app.listen(PORT, () => {
  console.log(`Backend listening at http://localhost:${PORT}`);
});
