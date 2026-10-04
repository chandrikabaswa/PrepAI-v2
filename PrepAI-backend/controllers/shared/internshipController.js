const Internship = require("../../models/Internship");
const User = require("../../models/User");
const Application = require("../../models/Application");

// Helper to safely calculate skill match between user and internship skills
const calculateSkillMatch = (userSkills = [], internshipSkills = []) => {
  const userClean = (userSkills || []).map((s) => s.toLowerCase().trim());
  const matchedSkills = (internshipSkills || []).filter((s) =>
    userClean.includes(s.toLowerCase().trim())
  );
  const missingSkills = (internshipSkills || []).filter(
    (s) => !userClean.includes(s.toLowerCase().trim())
  );
  const match =
    internshipSkills && internshipSkills.length > 0
      ? Math.round((matchedSkills.length / internshipSkills.length) * 100)
      : 0;
  return { match, matchedSkills, missingSkills };
};

// Get all internships (Active only, decorated with student match if authenticated)
const getAllInternships = async (req, res) => {
  try {
    const internships = await Internship.find({ status: { $ne: "Closed" } });

    let userSkills = [];
    if (req.user?.id) {
      const user = await User.findById(req.user.id);
      if (user && user.skills) {
        userSkills = user.skills;
      }
    }

    const results = internships.map((internship) => {
      const { match, matchedSkills, missingSkills } = calculateSkillMatch(
        userSkills,
        internship.skills
      );

      const base =
        typeof internship.toObject === "function"
          ? internship.toObject()
          : internship;

      return {
        ...base,
        match,
        matchedSkills,
        missingSkills,
      };
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get recommended internships (Active only, matching skills > 0)
const getRecommendedInternships = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const internships = await Internship.find({ status: { $ne: "Closed" } });

    const recommendations = internships
      .map((internship) => {
        const { match, matchedSkills, missingSkills } = calculateSkillMatch(
          user.skills,
          internship.skills
        );

        const base =
          typeof internship.toObject === "function"
            ? internship.toObject()
            : internship;

        return {
          ...base,
          match,
          matchedSkills,
          missingSkills,
        };
      })
      .filter((internship) => internship.match > 0)
      .sort((a, b) => b.match - a.match);

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get internship by ID
const getInternshipById = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);

    if (!internship) {
      return res.status(404).json({
        message: "Internship not found",
      });
    }

    res.json(internship);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Create a new internship (Recruiter only)
const createInternship = async (req, res) => {
  try {
    const {
      title,
      company,
      location,
      mode,
      stipend,
      duration,
      skills,
      applyLink,
      description,
    } = req.body;

    let companyName = company;
    if (!companyName) {
      const user = await User.findById(req.user.id);
      companyName = user?.companyName || user?.name || "Company";
    }

    const skillsArray = Array.isArray(skills)
      ? skills
      : typeof skills === "string"
      ? skills.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const internship = await Internship.create({
      title,
      company: companyName,
      location,
      mode,
      stipend,
      duration,
      skills: skillsArray,
      applyLink: applyLink || "https://careers.google.com",
      description: description || "",
      postedBy: req.user.id,
      status: "Active",
    });

    res.status(201).json({
      message: "Internship created successfully",
      internship,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get all internships posted by logged-in recruiter (enriched with applicant counts)
const getRecruiterInternships = async (req, res) => {
  try {
    const internships = await Internship.find({ postedBy: req.user.id }).sort({
      createdAt: -1,
    });

    const internshipIds = internships.map((i) => i._id);
    const applications = await Application.find({
      internship: { $in: internshipIds },
    });

    const countsMap = {};
    const statusMap = {};
    applications.forEach((app) => {
      const key = app.internship.toString();
      countsMap[key] = (countsMap[key] || 0) + 1;
      if (!statusMap[key]) {
        statusMap[key] = {
          Applied: 0,
          Reviewing: 0,
          Shortlisted: 0,
          Rejected: 0,
        };
      }
      if (statusMap[key][app.status] !== undefined) {
        statusMap[key][app.status] += 1;
      }
    });

    const enriched = internships.map((job) => {
      const obj = job.toObject();
      obj.applicantCount = countsMap[job._id.toString()] || 0;
      obj.statusCounts = statusMap[job._id.toString()] || {
        Applied: 0,
        Reviewing: 0,
        Shortlisted: 0,
        Rejected: 0,
      };
      return obj;
    });

    res.status(200).json(enriched);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update an existing internship (Strict ownership check)
const updateInternship = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);

    if (!internship) {
      return res.status(404).json({
        message: "Internship not found",
      });
    }

    // Ownership check: must be postedBy this recruiter
    if (!internship.postedBy || internship.postedBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Forbidden: You are not authorized to update this internship",
      });
    }

    if (req.body.title !== undefined) internship.title = req.body.title;
    if (req.body.company !== undefined) internship.company = req.body.company;
    if (req.body.location !== undefined) internship.location = req.body.location;
    if (req.body.mode !== undefined) internship.mode = req.body.mode;
    if (req.body.stipend !== undefined) internship.stipend = req.body.stipend;
    if (req.body.duration !== undefined) internship.duration = req.body.duration;
    if (req.body.applyLink !== undefined) internship.applyLink = req.body.applyLink;
    if (req.body.description !== undefined) internship.description = req.body.description;
    if (req.body.status !== undefined) internship.status = req.body.status;

    if (req.body.skills !== undefined) {
      internship.skills = Array.isArray(req.body.skills)
        ? req.body.skills
        : typeof req.body.skills === "string"
        ? req.body.skills.split(",").map((s) => s.trim()).filter(Boolean)
        : internship.skills;
    }

    await internship.save();

    res.status(200).json({
      message: "Internship updated successfully",
      internship,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete an internship (Strict ownership check)
const deleteInternship = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);

    if (!internship) {
      return res.status(404).json({
        message: "Internship not found",
      });
    }

    // Ownership check: must be postedBy this recruiter
    if (!internship.postedBy || internship.postedBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Forbidden: You are not authorized to delete this internship",
      });
    }

    await Internship.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Internship deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Recruiter-side candidate matching for an internship
const getCandidatesForInternship = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);

    if (!internship) {
      return res.status(404).json({
        message: "Internship not found",
      });
    }

    // Ownership check: must be postedBy this recruiter
    if (!internship.postedBy || internship.postedBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Forbidden: You do not own this internship",
      });
    }

    // Find all student candidates
    const students = await User.find({ role: "student" }).select("-password");

    const internshipSkills = (internship.skills || []).map((s) =>
      s.toLowerCase().trim()
    );

    const candidates = students
      .map((student) => {
        const studentSkills = (student.skills || []).map((s) =>
          s.toLowerCase().trim()
        );

        const matchedSkills = (internship.skills || []).filter((skill) =>
          studentSkills.includes(skill.toLowerCase().trim())
        );

        const missingSkills = (internship.skills || []).filter(
          (skill) => !studentSkills.includes(skill.toLowerCase().trim())
        );

        const match =
          internshipSkills.length > 0
            ? Math.round(
                (matchedSkills.length / internshipSkills.length) * 100
              )
            : 0;

        return {
          id: student._id,
          name: student.name,
          email: student.email,
          college: student.college,
          degree: student.degree,
          branch: student.branch,
          year: student.year,
          goal: student.goal,
          bio: student.bio,
          skills: student.skills,
          concepts: student.concepts,
          match,
          matchedSkills,
          missingSkills,
        };
      })
      .filter((candidate) => candidate.match > 0)
      .sort((a, b) => b.match - a.match);

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
      candidateCount: candidates.length,
      candidates,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Recruiter contacts a candidate (must be matching candidate or applicant for this internship)
const contactCandidate = async (req, res) => {
  try {
    const { internshipId, studentId } = req.params;

    const internship = await Internship.findById(internshipId);
    if (!internship) {
      return res.status(404).json({
        message: "Internship not found",
      });
    }

    // Ownership check: must be postedBy this recruiter
    if (!internship.postedBy || internship.postedBy.toString() !== req.user.id) {
      return res.status(403).json({
        message:
          "Forbidden: You are not authorized to contact candidates using an internship owned by another recruiter",
      });
    }

    // Find student
    const student = await User.findById(studentId).select("-password");
    if (!student || student.role !== "student") {
      return res.status(404).json({
        message: "Student candidate not found",
      });
    }

    // Check condition (a): Does student match skills for this internship?
    const internshipSkills = (internship.skills || []).map((s) =>
      s.toLowerCase().trim()
    );
    const studentSkills = (student.skills || []).map((s) =>
      s.toLowerCase().trim()
    );
    const matchedSkills = (internship.skills || []).filter((skill) =>
      studentSkills.includes(skill.toLowerCase().trim())
    );
    const hasMatchingSkills = matchedSkills.length > 0;

    // Check condition (b): Does student have an application for this internship?
    const application = await Application.findOne({
      internship: internship._id,
      student: student._id,
    });
    const hasApplied = Boolean(application);

    if (!hasMatchingSkills && !hasApplied) {
      return res.status(403).json({
        message:
          "Forbidden: Candidate is not eligible to be contacted for this internship. The student must either have applied to this internship or have matching skills.",
      });
    }

    // Fetch full recruiter details for personalization
    const recruiter = await User.findById(req.user.id).select("-password");
    const recruiterName = recruiter?.name || req.user.name || "Hiring Team";
    const companyName =
      recruiter?.companyName || internship.company || "PrepAI Partner";
    const designationPart = recruiter?.designation
      ? `${recruiter.designation}, `
      : "";

    const isApplicant = hasApplied;
    const subject = isApplicant
      ? `Regarding your application for ${internship.title} at ${companyName}`
      : `Opportunity: ${internship.title} at ${companyName}`;

    const body = isApplicant
      ? `Hi ${student.name},\n\nThank you for applying to the ${internship.title} position at ${companyName} via PrepAI. We have reviewed your profile and application, and would like to connect with you regarding the next steps in our hiring process.\n\nPlease let us know your availability for a brief conversation in the coming days.\n\nBest regards,\n${recruiterName}\n${designationPart}${companyName}`
      : `Hi ${student.name},\n\nI came across your profile on PrepAI and was impressed by your skills and background. We currently have an opening for ${internship.title} at ${companyName} that aligns well with your experience.\n\nWe would love to discuss this opportunity with you. Please let us know if you would be interested in connecting for a brief introductory call.\n\nBest regards,\n${recruiterName}\n${designationPart}${companyName}`;

    const mailtoUrl = `mailto:${student.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    res.status(200).json({
      message: "Candidate contact authorization verified",
      contact: {
        studentId: student._id,
        studentName: student.name,
        studentEmail: student.email,
        internshipId: internship._id,
        internshipTitle: internship.title,
        company: companyName,
        isApplicant,
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

module.exports = {
  getAllInternships,
  getRecommendedInternships,
  getInternshipById,
  createInternship,
  getRecruiterInternships,
  updateInternship,
  deleteInternship,
  getCandidatesForInternship,
  contactCandidate,
};