const express = require("express");

const router = express.Router();

const protect = require("../../middleware/authMiddleware");

const upload = require("../../middleware/uploadMiddleware");

const {
  analyzeResumeController,
} = require("../../controllers/student/resumeController");

router.post(
  "/analyze",
  protect,
  upload.single("resume"),
  analyzeResumeController
);

module.exports = router;