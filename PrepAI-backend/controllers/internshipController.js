const Internship = require("../models/Internship");
const User = require("../models/User");

// Get all internships
const getAllInternships = async (req, res) => {
  try {
    const internships = await Internship.find();

    res.json(internships);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get recommended internships
const getRecommendedInternships = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const internships = await Internship.find();

    const recommendations = internships
      .map((internship) => {
        const userSkills = user.skills.map((skill) =>
          skill.toLowerCase().trim()
        );

        const matchedSkills = internship.skills.filter((skill) =>
          userSkills.includes(skill.toLowerCase().trim())
        );

        const missingSkills = internship.skills.filter(
          (skill) =>
            !userSkills.includes(skill.toLowerCase().trim())
        );

        const match = Math.round(
          (matchedSkills.length / internship.skills.length) * 100
        );

        return {
          ...internship.toObject(),
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

// Get all internships posted by logged-in recruiter
const getRecruiterInternships = async (req, res) => {
  try {
    const internships = await Internship.find({ postedBy: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json(internships);
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

module.exports = {
  getAllInternships,
  getRecommendedInternships,
  getInternshipById,
  createInternship,
  getRecruiterInternships,
  updateInternship,
  deleteInternship,
  getCandidatesForInternship,
};