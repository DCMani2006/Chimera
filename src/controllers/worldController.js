// In-memory world storage

const defaultWorld = {
  id: 1,
  ruleName: "Default Earth",
  gravity: 9.8,
  growthRate: 1,
  oxygenLevel: 0.5,
  description: "Baseline Earth-like conditions",
};

let worlds = [];
let activeWorld = null;

/* ---------------- STABILITY ENGINE ---------------- */

const calculateStability = (gravity, oxygenLevel, growthRate) => {
  const rawStability =
    100 -
    Math.abs(gravity - 9.8) * 5 -
    Math.abs(oxygenLevel - 0.5) * 20 -
    Math.abs(growthRate - 1) * 15;

  return Math.max(0, Math.min(100, rawStability));
};

/* ---------------- SEED SYSTEM ---------------- */

const seedWorlds = [
  {
    ruleName: "Goliath's Burden",
    gravity: 18.5,
    growthRate: 0.3,
    oxygenLevel: 0.9,
    description:
      "A high-mass planet where skeletal structures are thick and plants grow low.",
  },
  {
    ruleName: "Ether Float",
    gravity: 1.2,
    growthRate: 1.8,
    oxygenLevel: 0.15,
    description:
      "Low gravity and rapid growth produce massive thin flora.",
  },
  {
    ruleName: "The Lead Lung",
    gravity: 14.2,
    growthRate: 1.1,
    oxygenLevel: 0.05,
    description:
      "Heavy gravity with suffocating air.",
  },
];

const seedIfEmpty = () => {
  if (worlds.length === 0) {
    seedWorlds.forEach((world, index) => {
      const stabilityScore = calculateStability(
        world.gravity,
        world.oxygenLevel,
        world.growthRate
      );

      worlds.push({
        id: index + 1,
        ...world,
        stabilityScore,
      });
    });

    activeWorld = worlds[0];
    console.log("🌍 Worlds seeded");
  }
};

/* ---------------- CONTROLLERS ---------------- */

const submitRule = (req, res) => {
  const { gravity, oxygenLevel, growthRate } = req.body;

  if (
    typeof gravity !== "number" ||
    typeof oxygenLevel !== "number" ||
    typeof growthRate !== "number"
  ) {
    return res.status(400).json({
      success: false,
      message: "gravity, oxygenLevel and growthRate must be numbers",
    });
  }

  const stabilityScore = calculateStability(
    gravity,
    oxygenLevel,
    growthRate
  );

  const newWorld = {
    id: worlds.length + 1,
    ruleName: "Custom World",
    gravity,
    oxygenLevel,
    growthRate,
    stabilityScore,
    createdAt: new Date(),
  };

  worlds.push(newWorld);
  activeWorld = newWorld;

  res.status(201).json({
    success: true,
    data: newWorld,
  });
};

const getCurrentRule = (req, res) => {
  seedIfEmpty();

  if (!activeWorld) {
    return res.status(404).json({
      success: false,
      message: "No active world found",
    });
  }

  res.json({
    success: true,
    data: activeWorld,
  });
};

const getAverageSurvivalRule = (req, res) => {
  seedIfEmpty();

  if (worlds.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No worlds available",
    });
  }

  const avg = {
    averageGravity:
      worlds.reduce((sum, w) => sum + w.gravity, 0) / worlds.length,

    averageGrowthRate:
      worlds.reduce((sum, w) => sum + w.growthRate, 0) / worlds.length,

    averageOxygenLevel:
      worlds.reduce((sum, w) => sum + w.oxygenLevel, 0) / worlds.length,

    averageStabilityScore:
      worlds.reduce((sum, w) => sum + w.stabilityScore, 0) / worlds.length,
  };

  res.json({
    success: true,
    data: avg,
  });
};

/* ---------------- MUTATION ---------------- */

const mutateWorld = (req, res) => {
  seedIfEmpty();

  if (!activeWorld) {
    return res.status(404).json({
      success: false,
      message: "No active world to mutate",
    });
  }

  const mutateValue = (value, min, max, intensity = 0.5) => {
    const change = (Math.random() - 0.5) * intensity;
    let newValue = value + change;
    newValue = Math.max(min, Math.min(max, newValue));
    return parseFloat(newValue.toFixed(3));
  };

  activeWorld.gravity = mutateValue(activeWorld.gravity, 0, 20);
  activeWorld.growthRate = mutateValue(activeWorld.growthRate, 0, 2);
  activeWorld.oxygenLevel = mutateValue(activeWorld.oxygenLevel, 0, 1);

  activeWorld.stabilityScore = calculateStability(
    activeWorld.gravity,
    activeWorld.oxygenLevel,
    activeWorld.growthRate
  );

  res.json({
    success: true,
    data: activeWorld,
  });
};

module.exports = {
  submitRule,
  getCurrentRule,
  getAverageSurvivalRule,
  mutateWorld,
};
