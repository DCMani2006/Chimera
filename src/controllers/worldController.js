// In-memory world storage
const defaultWorld = {
  ruleName: "Default Earth",
  gravity: 9.8,
  growthRate: 1,
  oxygenLevel: 0.5,
  description: "Baseline Earth-like conditions",
};
let rules = [];
let activeWorld = defaultWorld;

let worlds = [];
const seedWorlds = [
  {
    ruleName: "Goliath's Burden",
    gravity: 18.5,
    growthRate: 0.3,
    oxygenLevel: 0.9,
    description:
      "A high-mass planet where skeletal structures are thick and plants grow low to the ground."
  },
  {
    ruleName: "Ether Float",
    gravity: 1.2,
    growthRate: 1.8,
    oxygenLevel: 0.15,
    description:
      "Low gravity and high growth result in massive, thin-stalked flora."
  },
  {
    ruleName: "The Lead Lung",
    gravity: 14.2,
    growthRate: 1.1,
    oxygenLevel: 0.05,
    description:
      "Heavy gravity combined with suffocating air makes exploration difficult."
  }
];


const calculateStability = (gravity, oxygenLevel) => {
  const rawStability =
    100 -
    Math.abs(gravity - 9.8) * 5 -
    Math.abs(oxygenLevel - 0.5) * 20;

  // Clamp between 0 and 100
  return Math.max(0, Math.min(100, rawStability));
};


const seedIfEmpty = () => {
  if (worlds.length === 0) {
    seedWorlds.forEach((world) => {
      const stabilityScore = calculateStability(
        world.gravity,
        world.oxygenLevel
      );

      worlds.push({
        id: worlds.length + 1,
        ...world,
        stabilityScore
      });
    });

    activeWorld = worlds[0];

    console.log("🌍 Default worlds seeded");
  }
};

const submitRule = (req, res) => {
  const { gravity } = req.body;

  // Validation
  if (typeof gravity !== "number") {
    return res.status(400).json({
      success: false,
      message: "gravity must be a number",
    });
  }

  const stabilityScore = calculateStability(gravity);

  const newRule = {
    id: worlds.length + 1,
    gravity,
    stabilityScore,
    createdAt: new Date(),
  };

  worlds.push(newRule);
  activeWorld = newRule;

  res.status(201).json({
    success: true,
    message: "Rule submitted successfully",
    data: newRule,
  });
};


const getCurrentRule = (req, res) => {
  if (!activeWorld) {
    return res.status(404).json({
      success: false,
      message: "No active rule found",
    });
  }

  res.json({
    success: true,
    data: activeWorld,
  });
};


const getAllWorlds = (req, res) => {
  res.json(worlds);
};

const getAverageSurvivalRule = (req, res) => {
    if (rules.length === 0) {
  const stabilityScore = calculateStability(
    defaultWorld.gravity,
    defaultWorld.oxygenLevel
  );

  return res.json({
    ...defaultWorld,
    stabilityScore,
  });
}

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


const mutateWorld = (req, res) => {
  if (!activeWorld) {
    return res.status(404).json({
      success: false,
      message: "No active world to mutate",
    });
  }

  const mutateValue = (value, min, max, intensity = 0.5) => {
    const change = (Math.random() - 0.5) * intensity;
    let newValue = value + change;

    if (newValue < min) newValue = min;
    if (newValue > max) newValue = max;

    return parseFloat(newValue.toFixed(3));
  };

  activeWorld.gravity = mutateValue(activeWorld.gravity, 0, 20);
  activeWorld.growthRate = mutateValue(activeWorld.growthRate, 0, 2);
  activeWorld.oxygenLevel = mutateValue(activeWorld.oxygenLevel, 0, 1);

  activeWorld.stabilityScore = calculateStability(
    activeWorld.gravity,
    activeWorld.oxygenLevel
  );

  res.json({
    success: true,
    message: "World mutated successfully",
    data: activeWorld,
  });
};
module.exports = {
  submitRule,
  getCurrentRule,
  getAverageSurvivalRule,
};


