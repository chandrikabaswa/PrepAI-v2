const express = require("express");

const router = express.Router();

const { protect, authorizeRole } = require("../../middleware/authMiddleware");

const {
  getAllInternships,
  getRecommendedInternships,
  getInternshipById,
  createInternship,
  getRecruiterInternships,
  updateInternship,
  deleteInternship,
  getCandidatesForInternship,
  contactCandidate,
} = require("../../controllers/shared/internshipController");

// Student & shared routes (Preserved)
router.get("/", protect, getAllInternships);

router.get("/recommended", protect, getRecommendedInternships);

// Recruiter specific routes (Placed before /:id to prevent route collisions)
router.post("/", protect, authorizeRole("recruiter"), createInternship);

router.get(
  "/recruiter/my-postings",
  protect,
  authorizeRole("recruiter"),
  getRecruiterInternships
);

router.get(
  "/:id/candidates",
  protect,
  authorizeRole("recruiter"),
  getCandidatesForInternship
);

router.post(
  "/:internshipId/contact/:studentId",
  protect,
  authorizeRole("recruiter"),
  contactCandidate
);

// Single internship routes
router.get("/:id", protect, getInternshipById);

router.put("/:id", protect, authorizeRole("recruiter"), updateInternship);

router.delete("/:id", protect, authorizeRole("recruiter"), deleteInternship);

module.exports = router;