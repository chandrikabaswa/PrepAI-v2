const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const User = require("../models/User");
const { extractResumeText } = require("../services/resumeParser");
const { extractSkillsFromResume } = require("../services/groqService");

// Helper function to deduplicate and normalize skills
function deduplicateSkills(skills) {
  if (!Array.isArray(skills)) return [];
  const seen = new Set();
  const result = [];
  for (const s of skills) {
    const trimmed = (typeof s === "string" ? s : String(s)).trim();
    if (!trimmed) continue;
    const lower = trimmed.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      result.push(trimmed);
    }
  }
  return result;
}

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Skill extraction from uploaded resume
const extractSkillsController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a resume file (PDF or DOCX).",
      });
    }

    const allowedMimes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];
    const isPdfOrDocx =
      allowedMimes.includes(req.file.mimetype) ||
      req.file.originalname.toLowerCase().endsWith(".pdf") ||
      req.file.originalname.toLowerCase().endsWith(".docx");

    if (!isPdfOrDocx) {
      return res.status(400).json({
        message: "Only PDF and DOCX files are supported for skill extraction.",
      });
    }

    const rawResumeText = await extractResumeText(req.file);

    if (!rawResumeText || !rawResumeText.trim()) {
      return res.status(400).json({
        message: "Unable to extract text from the resume. Please ensure the document is not password protected.",
      });
    }

    const textToAnalyze = rawResumeText.substring(0, 6000);

    const extractedSkills = await extractSkillsFromResume(textToAnalyze);

    return res.status(200).json({
      skills: Array.isArray(extractedSkills) ? extractedSkills : [],
    });
  } catch (error) {
    console.error("Skill extraction error:", error.message || error);
    return res.status(500).json({
      message: "Could not automatically detect skills. You can add them manually.",
      skills: [],
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (req.body.name !== undefined) user.name = req.body.name.trim() || user.name;
    if (req.body.college !== undefined) user.college = req.body.college;
    if (req.body.degree !== undefined) user.degree = req.body.degree;
    if (req.body.branch !== undefined) user.branch = req.body.branch;
    if (req.body.year !== undefined) user.year = req.body.year;
    if (req.body.goal !== undefined) user.goal = req.body.goal;
    if (req.body.bio !== undefined) user.bio = req.body.bio;

    // Handle skills (Array, JSON string, or comma-separated string)
    if (req.body.skills !== undefined) {
      let parsedSkills = req.body.skills;
      if (typeof parsedSkills === "string") {
        try {
          const jsonParsed = JSON.parse(parsedSkills);
          if (Array.isArray(jsonParsed)) {
            parsedSkills = jsonParsed;
          } else {
            parsedSkills = parsedSkills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
          }
        } catch {
          parsedSkills = parsedSkills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        }
      }
      if (Array.isArray(parsedSkills)) {
        user.skills = deduplicateSkills(parsedSkills);
      }
    }

    // Handle concepts
    if (req.body.concepts !== undefined) {
      let parsedConcepts = req.body.concepts;
      if (typeof parsedConcepts === "string") {
        try {
          const jsonParsed = JSON.parse(parsedConcepts);
          if (Array.isArray(jsonParsed)) {
            parsedConcepts = jsonParsed;
          } else {
            parsedConcepts = parsedConcepts
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
          }
        } catch {
          parsedConcepts = parsedConcepts
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        }
      }
      if (Array.isArray(parsedConcepts)) {
        user.concepts = deduplicateSkills(parsedConcepts);
      }
    }

    // Handle codingProfiles (Object, JSON string, or individual body fields)
    if (req.body.codingProfiles !== undefined) {
      let parsedProfiles = req.body.codingProfiles;
      if (typeof parsedProfiles === "string") {
        try {
          parsedProfiles = JSON.parse(parsedProfiles);
        } catch {
          parsedProfiles = {};
        }
      }
      if (typeof parsedProfiles === "object" && parsedProfiles !== null) {
        user.codingProfiles = {
          github:
            typeof parsedProfiles.github === "string"
              ? parsedProfiles.github.trim()
              : user.codingProfiles?.github || "",
          leetcode:
            typeof parsedProfiles.leetcode === "string"
              ? parsedProfiles.leetcode.trim()
              : user.codingProfiles?.leetcode || "",
          hackerrank:
            typeof parsedProfiles.hackerrank === "string"
              ? parsedProfiles.hackerrank.trim()
              : user.codingProfiles?.hackerrank || "",
          linkedin:
            typeof parsedProfiles.linkedin === "string"
              ? parsedProfiles.linkedin.trim()
              : user.codingProfiles?.linkedin || "",
        };
      }
    } else if (
      req.body.github !== undefined ||
      req.body.leetcode !== undefined ||
      req.body.hackerrank !== undefined ||
      req.body.linkedin !== undefined
    ) {
      user.codingProfiles = {
        github:
          typeof req.body.github === "string"
            ? req.body.github.trim()
            : user.codingProfiles?.github || "",
        leetcode:
          typeof req.body.leetcode === "string"
            ? req.body.leetcode.trim()
            : user.codingProfiles?.leetcode || "",
        hackerrank:
          typeof req.body.hackerrank === "string"
            ? req.body.hackerrank.trim()
            : user.codingProfiles?.hackerrank || "",
        linkedin:
          typeof req.body.linkedin === "string"
            ? req.body.linkedin.trim()
            : user.codingProfiles?.linkedin || "",
      };
    }

    // Handle projects
    if (req.body.projects !== undefined) {
      let parsedProjects = req.body.projects;
      if (typeof parsedProjects === "string") {
        try {
          parsedProjects = JSON.parse(parsedProjects);
        } catch {
          parsedProjects = [];
        }
      }
      if (Array.isArray(parsedProjects)) {
        user.projects = parsedProjects.map((p) => {
          let techStack = [];
          if (Array.isArray(p.techStack)) {
            techStack = deduplicateSkills(p.techStack);
          } else if (typeof p.techStack === "string") {
            techStack = deduplicateSkills(
              p.techStack.split(",").map((s) => s.trim())
            );
          }
          return {
            title: p.title || "",
            description: p.description || "",
            techStack,
            githubUrl: p.githubUrl || "",
            liveUrl: p.liveUrl || "",
            ...(p._id ? { _id: p._id } : {}),
          };
        });
      }
    }

    // Handle experience
    if (req.body.experience !== undefined) {
      let parsedExp = req.body.experience;
      if (typeof parsedExp === "string") {
        try {
          parsedExp = JSON.parse(parsedExp);
        } catch {
          parsedExp = [];
        }
      }
      if (Array.isArray(parsedExp)) {
        user.experience = parsedExp.map((e) => {
          let skills = [];
          if (Array.isArray(e.skills)) {
            skills = deduplicateSkills(e.skills);
          } else if (typeof e.skills === "string") {
            skills = deduplicateSkills(
              e.skills.split(",").map((s) => s.trim())
            );
          }
          return {
            type: e.type || "Internship",
            company: e.company || "",
            role: e.role || "",
            location: e.location || "",
            startDate: e.startDate || "",
            endDate: e.endDate || "",
            currentlyWorking: Boolean(e.currentlyWorking),
            description: e.description || "",
            achievements: e.achievements || "",
            skills,
            link: e.link || "",
            ...(e._id ? { _id: e._id } : {}),
          };
        });
      }
    }

    // Handle achievements
    if (req.body.achievements !== undefined) {
      let parsedAchievements = req.body.achievements;
      if (typeof parsedAchievements === "string") {
        try {
          parsedAchievements = JSON.parse(parsedAchievements);
        } catch {
          parsedAchievements = parsedAchievements
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
            .map((title) => ({ title, description: "", date: "", link: "" }));
        }
      }
      if (Array.isArray(parsedAchievements)) {
        user.achievements = parsedAchievements.map((a) => {
          if (typeof a === "string") {
            return { title: a, description: "", date: "", link: "" };
          }
          return {
            title: a.title || "",
            description: a.description || "",
            date: a.date || "",
            link: a.link || "",
            ...(a._id ? { _id: a._id } : {}),
          };
        });
      }
    }

    // Handle certifications
    if (req.body.certifications !== undefined) {
      let parsedCerts = req.body.certifications;
      if (typeof parsedCerts === "string") {
        try {
          parsedCerts = JSON.parse(parsedCerts);
        } catch {
          parsedCerts = parsedCerts
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
            .map((name) => ({ name, organization: "", date: "", credentialUrl: "" }));
        }
      }
      if (Array.isArray(parsedCerts)) {
        user.certifications = parsedCerts.map((c) => {
          if (typeof c === "string") {
            return { name: c, organization: "", date: "", credentialUrl: "" };
          }
          return {
            name: c.name || "",
            organization: c.organization || "",
            date: c.date || "",
            credentialUrl: c.credentialUrl || "",
            ...(c._id ? { _id: c._id } : {}),
          };
        });
      }
    }

    // Handle recruiter visibility
    if (req.body.recruiterVisibility !== undefined) {
      user.recruiterVisibility =
        req.body.recruiterVisibility === true ||
        req.body.recruiterVisibility === "true";
    }

    // Handle resume file upload if provided
    if (req.file) {
      const allowedMimes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
      ];
      const isPdfOrDocx =
        allowedMimes.includes(req.file.mimetype) ||
        req.file.originalname.toLowerCase().endsWith(".pdf") ||
        req.file.originalname.toLowerCase().endsWith(".docx");

      if (!isPdfOrDocx) {
        return res.status(400).json({
          message: "Only PDF and DOCX files are allowed for resume upload.",
        });
      }

      // Ensure uploads folder exists
      const uploadsDir = path.join(__dirname, "../uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const safeFilename = `${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const filePath = path.join(uploadsDir, safeFilename);
      fs.writeFileSync(filePath, req.file.buffer);

      // Extract text from resume using existing parser
      let extractedText = "";
      try {
        extractedText = await extractResumeText(req.file);
      } catch (parserErr) {
        console.warn("Resume text extraction warning:", parserErr.message);
      }

      user.resume = {
        fileName: req.file.originalname,
        fileUrl: `/uploads/${safeFilename}`,
        text: extractedText || "",
        uploadedAt: new Date(),
      };
    }

    await user.save();

    const updatedUser = await User.findById(req.user.id).select("-password");

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  signup,
  login,
  updateProfile,
  getProfile,
  extractSkillsController,
  deduplicateSkills,
};
