const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "index.html"));
});

// Example test route (to confirm backend works)
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working!" });
});
const worldRoutes = require("./routes/worldRoutes");
app.use("/api/world", worldRoutes);

module.exports = app;
