const mongoose = require("mongoose");

const worldSchema = new mongoose.Schema(
  {
    ruleName: {
      type: String,
      required: true,
      trim: true,
    },

    gravity: {
      type: Number,
      required: true,
      min: 0,
      max: 20,
    },

    growthRate: {
      type: Number,
      required: true,
      min: 0,
      max: 2,
    },

    oxygenLevel: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },

    description: {
      type: String,
      required: true,
    },

    stabilityScore: {
      type: Number,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("World", worldSchema);
