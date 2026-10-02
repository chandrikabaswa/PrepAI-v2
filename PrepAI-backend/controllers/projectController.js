const Project = require("../models/Project");
const User = require("../models/User");

const {
  generateProjectRecommendations,
  generateCustomProjectIdeas,
} = require("../services/groqService");

const getRecommendedProjects = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const projects = await Project.find();

    const recommendations = projects
      .map((project) => {
        const userSkills = user.skills
          .join(",")
          .split(",")
          .map((skill) => skill.toLowerCase().trim());

        const matchedSkills = project.skills.filter((skill) =>
          userSkills.includes(skill.toLowerCase().trim()),
        );

        const score = Math.round(
          (matchedSkills.length / project.skills.length) * 100,
        );

        return {
          project: project.toObject(),
          match: score,
        };
      })
      .filter((project) => project.match > 0)
      .sort((a, b) => b.match - a.match);

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getAIRecommendedProjects = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    let result = await generateProjectRecommendations(user);

    result = result
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const start = result.indexOf("[");
    const end = result.lastIndexOf("]");

    if (start === -1 || end === -1) {
      throw new Error("AI did not return valid JSON.");
    }

    result = result.substring(start, end + 1);

    const projects = JSON.parse(result);

    res.json(projects);
  } catch (error) {
    console.error(error.response?.data || error);

    res.status(500).json({
      message: error.message,
    });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find();

    res.json(projects);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const buildAIProjects = async (req, res) => {
  try {
    const { technologies, difficulty, domain } = req.body;

    if (!technologies || !Array.isArray(technologies) || technologies.length === 0) {
      return res.status(400).json({
        message: "Please provide at least one technology.",
      });
    }

    const projects = await generateCustomProjectIdeas({
      technologies,
      difficulty: difficulty || "Intermediate",
      domain: domain || "",
    });

    res.json(projects);
  } catch (error) {
    console.error("AI Project Builder Error:", error.response?.data || error);
    res.status(500).json({
      message: error.message || "Failed to generate AI project recommendations.",
    });
  }
};

module.exports = {
  getRecommendedProjects,
  getAIRecommendedProjects,
  getProjectById,
  getAllProjects,
  buildAIProjects,
};
