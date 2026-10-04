const Application = require("../../models/Application");
const Internship = require("../../models/Internship");
const User = require("../../models/User");

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
      .populate("recruiter", "name email companyName designation")
      .sort({ createdAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE /api/applications/:applicationId (Student only)
const withdrawApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    // Verify student owns this application
    if (application.student.toString() !== req.user.id) {
      return res.status(403).json({
        message:
          "Forbidden: You are not authorized to withdraw this application",
      });
    }

    await Application.findByIdAndDelete(applicationId);

    res.status(200).json({
      message: "Application withdrawn successfully",
      applicationId,
    });
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

// POST /api/applications/:applicationId/contact (Recruiter only)
const contactApplicant = async (req, res) => {
  try {
    const { applicationId } = req.params;

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

    const student = await User.findById(application.student).select(
      "-password"
    );
    if (!student) {
      return res.status(404).json({
        message: "Student candidate not found",
      });
    }

    const internship = await Internship.findById(application.internship);

    // Fetch full recruiter details for personalization
    const recruiter = await User.findById(req.user.id).select("-password");
    const recruiterName = recruiter?.name || req.user.name || "Hiring Team";
    const companyName =
      recruiter?.companyName || internship?.company || "PrepAI Partner";
    const designationPart = recruiter?.designation
      ? `${recruiter.designation}, `
      : "";

    const subject = `Regarding your application for ${
      internship?.title || "Internship"
    } at ${companyName}`;

    const body = `Hi ${student.name},\n\nThank you for applying to the ${
      internship?.title || "internship"
    } position at ${companyName} via PrepAI. We have reviewed your profile and application, and would like to connect with you regarding the next steps in our hiring process.\n\nPlease let us know your availability for a brief conversation in the coming days.\n\nBest regards,\n${recruiterName}\n${designationPart}${companyName}`;

    const mailtoUrl = `mailto:${student.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    res.status(200).json({
      message: "Applicant contact authorization verified",
      contact: {
        applicationId: application._id,
        studentId: student._id,
        studentName: student.name,
        studentEmail: student.email,
        internshipId: internship?._id,
        internshipTitle: internship?.title,
        company: companyName,
        isApplicant: true,
        subject,
        body,
        mailtoUrl,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET /api/applications/recruiter/analytics (Recruiter only)
const getRecruiterAnalytics = async (req, res) => {
  try {
    const recruiterId = req.user.id;

    // 1. Find all internships owned by this recruiter
    const internships = await Internship.find({ postedBy: recruiterId }).sort({
      createdAt: -1,
    });

    const internshipIds = internships.map((i) => i._id);

    // 2. Find all applications for these internships
    const applications = await Application.find({
      internship: { $in: internshipIds },
    })
      .populate("student", "name email college degree branch year skills")
      .populate("internship", "title company location mode status stipend")
      .sort({ createdAt: -1 });

    // 3. Compute overall aggregate metrics
    const totalPostings = internships.length;
    const activePostings = internships.filter(
      (i) => i.status !== "Closed"
    ).length;
    const closedPostings = internships.filter(
      (i) => i.status === "Closed"
    ).length;
    const totalApplicants = applications.length;

    const statusCounts = {
      Applied: 0,
      Reviewing: 0,
      Shortlisted: 0,
      Rejected: 0,
    };

    applications.forEach((app) => {
      if (statusCounts[app.status] !== undefined) {
        statusCounts[app.status] += 1;
      }
    });

    // 4. Per-posting breakdown
    const postingsBreakdown = internships.map((job) => {
      const jobApps = applications.filter(
        (a) =>
          a.internship && a.internship._id.toString() === job._id.toString()
      );

      const jobStatusCounts = {
        Applied: 0,
        Reviewing: 0,
        Shortlisted: 0,
        Rejected: 0,
      };

      jobApps.forEach((a) => {
        if (jobStatusCounts[a.status] !== undefined) {
          jobStatusCounts[a.status] += 1;
        }
      });

      return {
        _id: job._id,
        title: job.title,
        company: job.company,
        location: job.location,
        mode: job.mode,
        stipend: job.stipend,
        duration: job.duration,
        skills: job.skills,
        status: job.status || "Active",
        applicantCount: jobApps.length,
        statusCounts: jobStatusCounts,
        latestAppliedAt: jobApps.length > 0 ? jobApps[0].createdAt : null,
      };
    });

    // 5. Recent applications list (top 10 most recent across all postings)
    const recentApplications = applications.slice(0, 10).map((app) => ({
      _id: app._id,
      status: app.status,
      createdAt: app.createdAt,
      student: app.student,
      internship: app.internship
        ? {
            _id: app.internship._id,
            title: app.internship.title,
            company: app.internship.company,
          }
        : null,
    }));

    res.status(200).json({
      metrics: {
        totalPostings,
        activePostings,
        closedPostings,
        totalApplicants,
        statusCounts,
      },
      postingsBreakdown,
      recentApplications,
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
  withdrawApplication,
  getInternshipApplicants,
  updateApplicationStatus,
  contactApplicant,
  getRecruiterAnalytics,
};
