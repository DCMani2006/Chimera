const express = require("express");
const router = express.Router();

const {
  submitRule,
  getCurrentRule,
  getAverageSurvivalRule,
  mutateWorld,
} = require("../controllers/worldController");

router.post("/submitRule", submitRule);
router.get("/currentRule", getCurrentRule);
router.get("/averageSurvivalRule", getAverageSurvivalRule);
router.post("/mutateWorld", mutateWorld);
module.exports = router;
