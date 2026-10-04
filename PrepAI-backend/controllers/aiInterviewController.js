const {
  generateInterviewQuestions,
  evaluateInterviewAnswers,
} = require("../services/groqService");
const { extractResumeText } = require("../services/resumeParser");

const generateInterview = async (req, res) => {
  try {
    const {
      role,
      description = "",
      difficulty = "medium",
      questionType = "general",
    } = req.body;

    if (!role || !role.trim()) {
      return res.status(400).json({
        message: "Target Job Role is required.",
      });
    }

    const normQuestionType = (questionType || "general").trim().toLowerCase();
    const normDifficulty = (difficulty || "medium").trim();

    let resumeText = "";
    if (req.file) {
      resumeText = (await extractResumeText(req.file)).substring(0, 6000);
    } else if (req.body.resumeText) {
      resumeText = req.body.resumeText.substring(0, 6000);
    }

    // Validation based on question type
    if (normQuestionType === "resume" && !resumeText.trim()) {
      return res.status(400).json({
        message: "Please upload your resume for a Resume-Based interview.",
      });
    }

    if (
      normQuestionType === "jobdescription" &&
      (!description || !description.trim())
    ) {
      return res.status(400).json({
        message:
          "Please provide a Job Description for a Job-Description-Based interview.",
      });
    }

    let result = await generateInterviewQuestions(
      role.trim(),
      description ? description.trim() : "",
      resumeText,
      normDifficulty,
      normQuestionType
    );

    result = result
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const start = result.indexOf("[");
    const end = result.lastIndexOf("]");

    if (start === -1 || end === -1) {
      throw new Error("AI did not return a valid JSON array.");
    }

    result = result.substring(start, end + 1);

    const questions = JSON.parse(result);

    res.status(200).json(questions);
  } catch (error) {
    console.error("Interview Generation Error:", error.response?.data || error);
    res.status(500).json({
      message: error.message || "Failed to generate interview.",
    });
  }
};

const evaluateInterview = async (req, res) => {
  try {
    const { role, answers } = req.body;

    // Keep only answered questions
    const answeredQuestions = answers.filter(
      (item) => item.answer && item.answer.trim() !== "",
    );

    // If user didn't answer anything
    if (answeredQuestions.length === 0) {
      return res.status(200).json({
        overallScore: 0,
        technicalKnowledge: 0,
        communication: 0,
        confidence: 0,
        strengths: [],
        improvements: [
          "No answers were provided.",
          "Complete the interview to receive an evaluation.",
        ],
        feedback:
          "The interview could not be evaluated because no answers were submitted.",
      });
    }

    // Send only answered questions to the AI
    let result = await evaluateInterviewAnswers(role, answeredQuestions);
    
    result = result
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const start = result.indexOf("{");
    const end = result.lastIndexOf("}");

    if (start === -1 || end === -1) {
      throw new Error("AI did not return valid JSON.");
    }

    result = result.substring(start, end + 1);

    const evaluation = JSON.parse(result);

    res.status(200).json(evaluation);
  } catch (error) {
    console.error("========== EVALUATION ERROR ==========");
    console.error(error.response?.data || error);

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  generateInterview,
  evaluateInterview,
};
