const express = require("express");

const router = express.Router();

const protect = require("../../middleware/authMiddleware");
const upload = require("../../middleware/uploadMiddleware");

const {
  generateInterview,
  evaluateInterview,
} = require("../../controllers/student/aiInterviewController");

router.post(
  "/generate",
  protect,
  upload.single("resume"),
  generateInterview
);
router.post("/evaluate", protect, evaluateInterview);

module.exports = router;