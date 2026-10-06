const express = require("express");

const router = express.Router();

const protect = require("../../middleware/authMiddleware");

const {
  getRecommendedLearning,
  getAILearningRecommendations,
  exploreLearningTopic,
  getLearningResources,
} = require("../../controllers/student/learningController");

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

router.get(
  "/resources",
  protect,
  getLearningResources
);

module.exports = router;
