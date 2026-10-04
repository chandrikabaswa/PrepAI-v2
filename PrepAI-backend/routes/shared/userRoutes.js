const express = require("express");
const protect = require("../../middleware/authMiddleware");
const upload = require("../../middleware/uploadMiddleware");
const router = express.Router();

const {
  signup,
  login,
  updateProfile,
  getProfile,
  extractSkillsController,
} = require("../../controllers/shared/userController");

router.post("/signup", signup);
router.post("/login", login);
router.put("/profile", protect, upload.single("resume"), updateProfile);
router.get("/profile", protect, getProfile);

// Route for extracting skills from an uploaded resume file
router.post(
  "/extract-skills",
  protect,
  upload.single("resume"),
  extractSkillsController
);

module.exports = router;