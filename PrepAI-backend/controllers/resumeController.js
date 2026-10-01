const { extractResumeText } = require("../services/resumeParser");

const { analyzeResume } = require("../services/groqService");

const analyzeResumeController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a resume.",
      });
    }

    // Extract resume text
    const resumeText = await extractResumeText(req.file);

    // Limit text sent to AI
    const text = resumeText.substring(0, 6000);

    let result = await analyzeResume(text);

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

    const raw = JSON.parse(result);

    // Normalize and safeguard response structure
    const atsScore =
      typeof raw.atsScore === "number"
        ? Math.min(100, Math.max(0, Math.round(raw.atsScore)))
        : 75;

    let readinessLevel = raw.readinessLevel;
    if (!readinessLevel) {
      if (atsScore >= 80) readinessLevel = "ATS Ready";
      else if (atsScore >= 65) readinessLevel = "Good Quality";
      else if (atsScore >= 50) readinessLevel = "Needs Optimization";
      else readinessLevel = "Needs Rework";
    }

    const breakdown = {
      atsCompatibility:
        raw.breakdown?.atsCompatibility ?? Math.min(100, atsScore + 2),
      contentQuality:
        raw.breakdown?.contentQuality ?? Math.max(0, atsScore - 2),
      skillsRelevance:
        raw.breakdown?.skillsRelevance ?? Math.min(100, atsScore + 3),
      projectStrength:
        raw.breakdown?.projectStrength ?? Math.max(0, atsScore - 4),
      resumeCompleteness:
        raw.breakdown?.resumeCompleteness ?? atsScore,
    };

    const analysis = {
      atsScore,
      readinessLevel,
      summary:
        raw.summary ||
        "Resume analyzed for overall ATS compatibility, structure, and technical depth.",
      breakdown,
      strengths: Array.isArray(raw.strengths) ? raw.strengths : [],
      weaknesses: Array.isArray(raw.weaknesses) ? raw.weaknesses : [],
      skillsDetected: raw.skillsDetected || [],
      missingSkills: Array.isArray(raw.missingSkills) ? raw.missingSkills : [],
      resumeSections: raw.resumeSections || {
        education: true,
        technicalSkills: true,
        projects: true,
        experience: false,
        achievements: true,
        certifications: false,
      },
      atsAnalysis: raw.atsAnalysis || {
        positive: ["Standard section layout detected."],
        issues: [],
        keywordsPresent: [],
      },
      improvements: Array.isArray(raw.improvements) ? raw.improvements : [],
      nextSteps: Array.isArray(raw.nextSteps) ? raw.nextSteps : [],
    };

    res.status(200).json(analysis);
  } catch (error) {
    console.error(error.response?.data || error);

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  analyzeResumeController,
};