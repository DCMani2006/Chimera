const express = require("express");
const router = express.Router();

const {
  submitRule,
  getCurrentRule,
  getAverageSurvivalRule,
} = require("../controllers/worldController");

// EXACT routes as per original spec
router.post("/submitRule", submitRule);
router.get("/currentRule", getCurrentRule);
router.get("/averageSurvivalRule", getAverageSurvivalRule);

module.exports = router;
