const express = require("express");
const path = require("path");
const cors = require("cors");

const worldRoutes = require("./routes/worldRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/world", worldRoutes);

app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "index.html"));
});

module.exports = app;
