const express = require("express");
const path = require("path");

const app = express();

// Serve the frontend folder correctly
app.use(express.static(path.join(__dirname, "../frontend")));

module.exports = app;
