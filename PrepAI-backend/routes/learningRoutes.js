const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  getRecommendedLearning,
  getAILearningRecommendations,
  exploreLearningTopic,
} = require("../controllers/learningController");

router.get(
  "/recommended",
  protect,
  getRecommendedLearning
);

router.get(
  "/ai-recommended",
  protect,
  getAILearningRecommendations
);

router.post(
  "/explore",
  protect,
  exploreLearningTopic
);

router.get(
  "/explore",
  protect,
  exploreLearningTopic
);

module.exports = router;