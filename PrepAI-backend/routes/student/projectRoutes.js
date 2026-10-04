const express = require("express");

const router = express.Router();

const protect = require("../../middleware/authMiddleware");

const {
  getRecommendedProjects,
  getAIRecommendedProjects,
  getProjectById,
  getAllProjects,
  buildAIProjects,
} = require("../../controllers/student/projectController");

router.get("/recommended", protect, getRecommendedProjects);

router.get("/ai-recommended", protect, getAIRecommendedProjects);

router.post("/ai-builder", protect, buildAIProjects);

router.get("/:id", protect, getProjectById);

router.get("/", protect, getAllProjects);

module.exports = router;