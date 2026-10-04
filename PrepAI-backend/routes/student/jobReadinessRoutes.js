const express = require("express");
const router = express.Router();

const protect = require("../../middleware/authMiddleware");
const upload = require("../../middleware/uploadMiddleware");
const {
  analyzeJobReadiness,
} = require("../../controllers/student/jobReadinessController");

// POST /api/job-readiness/analyze
router.post(
  "/analyze",
  protect,
  upload.single("resume"),
  analyzeJobReadiness
);

module.exports = router;
