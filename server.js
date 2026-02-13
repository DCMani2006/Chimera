const express = require("express");
const path = require("path");

console.log("🔥 THIS SERVER FILE IS RUNNING");
console.log("Directory:", __dirname);

const app = express();

app.use(express.static(path.join(__dirname, "frontend")));

app.get("/", (req, res) => {
  console.log("Serving index.html");
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
