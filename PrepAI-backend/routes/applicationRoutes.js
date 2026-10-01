const express = require("express");
const router = express.Router();

const { protect, authorizeRole } = require("../middleware/authMiddleware");

const {
  applyToInternship,
  getStudentApplications,
  withdrawApplication,
  getInternshipApplicants,
  updateApplicationStatus,
  contactApplicant,
} = require("../controllers/applicationController");

// Student application routes
router.post("/:internshipId", protect, authorizeRole("student"), applyToInternship);
router.get("/student", protect, authorizeRole("student"), getStudentApplications);
router.delete("/:applicationId", protect, authorizeRole("student"), withdrawApplication);

// Recruiter applicant management routes
router.get(
  "/internship/:internshipId",
  protect,
  authorizeRole("recruiter"),
  getInternshipApplicants
);

router.put(
  "/:applicationId/status",
  protect,
  authorizeRole("recruiter"),
  updateApplicationStatus
);

router.post(
  "/:applicationId/contact",
  protect,
  authorizeRole("recruiter"),
  contactApplicant
);

module.exports = router;
