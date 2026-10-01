const Application = require("../models/Application");
const Internship = require("../models/Internship");
const User = require("../models/User");

// POST /api/applications/:internshipId (Student only)
const applyToInternship = async (req, res) => {
  try {
    const { internshipId } = req.params;

    const internship = await Internship.findById(internshipId);
    if (!internship) {
      return res.status(404).json({
        message: "Internship not found",
      });
    }

    if (internship.status === "Closed") {
      return res.status(400).json({
        message: "This internship is closed for applications",
      });
    }

    if (!internship.postedBy) {
      return res.status(400).json({
        message:
          "This is an external platform listing and does not accept direct applications on PrepAI. Please apply via the external link.",
      });
    }

    // Check if already applied
    const existing = await Application.findOne({
      student: req.user.id,
      internship: internshipId,
    });

    if (existing) {
      return res.status(400).json({
        message: "You have already applied to this internship",
      });
    }

    const application = await Application.create({
      student: req.user.id,
      internship: internship._id,
      recruiter: internship.postedBy,
      status: "Applied",
    });

    res.status(201).json({
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    // Handle duplicate key error if concurrent requests occur
    if (error.code === 11000) {
      return res.status(400).json({
        message: "You have already applied to this internship",
      });
    }
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET /api/applications/student (Student only)
const getStudentApplications = async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user.id })
      .populate("internship")
      .sort({ createdAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET /api/applications/internship/:internshipId (Recruiter only)
const getInternshipApplicants = async (req, res) => {
  try {
    const { internshipId } = req.params;

    const internship = await Internship.findById(internshipId);
    if (!internship) {
      return res.status(404).json({
        message: "Internship not found",
      });
    }

    // Verify recruiter owns this internship
    if (
      !internship.postedBy ||
      internship.postedBy.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message:
          "Forbidden: You are not authorized to view applicants for this internship",
      });
    }

    const applications = await Application.find({ internship: internshipId })
      .populate(
        "student",
        "name email college degree branch year skills concepts goal bio"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      internship: {
        id: internship._id,
        title: internship.title,
        company: internship.company,
        location: internship.location,
        mode: internship.mode,
        skills: internship.skills,
        status: internship.status,
      },
      applicantCount: applications.length,
      applications,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// PUT /api/applications/:applicationId/status (Recruiter only)
const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["Applied", "Reviewing", "Shortlisted", "Rejected"];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`,
      });
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    // Verify recruiter owns the related internship
    if (
      !application.recruiter ||
      application.recruiter.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message:
          "Forbidden: You do not own the internship for this application",
      });
    }

    application.status = status;
    await application.save();

    res.status(200).json({
      message: "Application status updated successfully",
      application,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  applyToInternship,
  getStudentApplications,
  getInternshipApplicants,
  updateApplicationStatus,
};
