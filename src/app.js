const express = require("express");
const cors = require("cors");

const worldRoutes = require("./routes/worldRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// No prefix
app.use("/", worldRoutes);

module.exports = app;
