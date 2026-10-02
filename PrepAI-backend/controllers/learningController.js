const Learning = require("../models/Learning");
const User = require("../models/User");

const {
  generateLearningRecommendations,
  generateTopicRoadmap,
} = require("../services/groqService");

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

const getRecommendedLearning = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const userSkills = (user.skills || []).map((skill) =>
      skill.toLowerCase().trim(),
    );

    let userGoal = (user.goal || "").toLowerCase().trim();

    if (userGoal === "sde" || userGoal === "software developer") {
      userGoal = "software engineer";
    }

    const topics = await Learning.find();

    const recommendations = topics.filter((topic) => {
      // Case-insensitive goal match
      const goalMatch = topic.goals.some(
        (goal) => goal.toLowerCase().trim() === userGoal,
      );

      // Check if prerequisites are met
      const prerequisiteMet =
        topic.skills.length === 0 ||
        topic.skills.some((skill) =>
          userSkills.includes(skill.toLowerCase().trim()),
        );

      // Don't recommend if the user already knows this topic
      const alreadyKnows = userSkills.includes(
        topic.title.toLowerCase().trim(),
      );

      return goalMatch && prerequisiteMet && !alreadyKnows;
    });

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getAILearningRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    let result = await generateLearningRecommendations(user);

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

    const recommendations = JSON.parse(result);

    res.json(recommendations);
  } catch (error) {
    console.error(error.response?.data || error);

    res.status(500).json({
      message: error.message,
    });
  }
};

const exploreLearningTopic = async (req, res) => {
  try {
    const topic = (req.body.topic || req.query.topic || "").trim();

    if (!topic) {
      return res.status(400).json({
        message: "Please enter a topic or technology to explore.",
      });
    }

    // 1. Check if topic exists in existing Learning MongoDB collection
    const escaped = escapeRegex(topic);
    let existing = await Learning.findOne({
      title: { $regex: new RegExp(`^${escaped}$`, "i") },
    });

    if (!existing) {
      existing = await Learning.findOne({
        title: { $regex: new RegExp(escaped, "i") },
      });
    }

    if (existing) {
      const dbObj = existing.toObject();
      const topicData = {
        _id: dbObj._id,
        title: dbObj.title,
        description: dbObj.description,
        difficulty: dbObj.difficulty,
        duration: dbObj.duration,
        prerequisites: dbObj.skills && dbObj.skills.length > 0 ? dbObj.skills : ["Basic Programming Foundations"],
        skills: dbObj.skills || [],
        goals: dbObj.goals || [],
        resources: dbObj.resources || [],
        whyLearn: `Mastering ${dbObj.title} is essential for ${dbObj.goals?.join(", ") || "software roles"} and widely evaluated in technical interviews.`,
        whatYouWillLearn: [
          `Core concepts, syntax, and workflows of ${dbObj.title}`,
          `Industry standard best practices and optimization techniques`,
          `Solving real-world architectural and application challenges`
        ],
        roadmap: [
          {
            step: 1,
            phase: "Foundations",
            title: `Introduction & Environment Setup`,
            description: `Understand the core architecture, syntax, and foundational concepts of ${dbObj.title}.`
          },
          {
            step: 2,
            phase: "Core Implementation",
            title: `Hands-on Features & Patterns`,
            description: `Build practical modules, implement key features, and practice standard conventions.`
          },
          {
            step: 3,
            phase: "Advanced & Production",
            title: `Optimization & Project Integration`,
            description: `Integrate ${dbObj.title} into portfolio projects, write clean tests, and prepare for interviews.`
          }
        ],
        keyConcepts: [
          dbObj.title,
          ...(dbObj.skills || []),
          "Best Practices",
          "Production Standards"
        ],
        projects: [
          {
            title: `${dbObj.title} Practical Implementation`,
            description: `Build a clean, documented application showcasing end-to-end proficiency in ${dbObj.title}.`
          }
        ],
        source: "database",
      };

      return res.json(topicData);
    }

    // 2. Not in database: use Groq AI service to generate a learning roadmap
    const aiRoadmap = await generateTopicRoadmap(topic);

    return res.json({
      source: "ai",
      ...aiRoadmap,
    });
  } catch (error) {
    console.error("Explore Learning Topic Error:", error.response?.data || error);
    res.status(500).json({
      message: error.message || "Failed to generate learning roadmap for this topic.",
    });
  }
};

module.exports = {
  getRecommendedLearning,
  getAILearningRecommendations,
  exploreLearningTopic,
};

