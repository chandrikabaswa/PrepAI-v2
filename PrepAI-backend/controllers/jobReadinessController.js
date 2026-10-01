const { extractResumeText } = require("../services/resumeParser");
const { analyzeResumeForJob } = require("../services/groqService");
const Learning = require("../models/Learning");

/**
 * Controller to perform comprehensive Job Match and Readiness Analysis
 * Compares uploaded resume against target job role and description.
 */
const analyzeJobReadiness = async (req, res) => {
  try {
    // 1. Validate file upload
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a resume file (PDF or DOCX).",
      });
    }

    // 2. Validate role and description
    const role = (req.body.role || "").trim();
    const description = (req.body.description || "").trim();

    if (!role) {
      return res.status(400).json({
        message: "Target Job Role is required.",
      });
    }

    if (!description) {
      return res.status(400).json({
        message: "Job Description is required.",
      });
    }

    // 3. Extract text from uploaded resume
    const rawResumeText = await extractResumeText(req.file);

    if (!rawResumeText || !rawResumeText.trim()) {
      return res.status(400).json({
        message:
          "Unable to extract text from the resume. Please ensure the document contains readable text and is not password protected.",
      });
    }

    // Limit text sent to AI to prevent token overflow
    const resumeText = rawResumeText.substring(0, 6000);

    // 4. Request analysis from Groq AI
    let rawAiResult = await analyzeResumeForJob(
      resumeText,
      role,
      description
    );

    // 5. Clean and parse AI JSON
    rawAiResult = rawAiResult
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const startIdx = rawAiResult.indexOf("{");
    const endIdx = rawAiResult.lastIndexOf("}");

    if (startIdx === -1 || endIdx === -1) {
      throw new Error(
        "AI service returned an invalid JSON response structure."
      );
    }

    const jsonString = rawAiResult.substring(startIdx, endIdx + 1);
    const analysis = JSON.parse(jsonString);

    // 6. Normalize overall score and readiness level

    // Make sure AI actually returned a valid score
    if (!Number.isFinite(analysis.jobMatchScore)) {
      throw new Error("AI did not return a valid job match score.");
    }

    // Keep score between 0 and 100
    const score = Math.max(
      0,
      Math.min(100, Math.round(analysis.jobMatchScore))
    );

    analysis.jobMatchScore = score;

    if (!analysis.readinessLevel) {
      if (score >= 80) {
        analysis.readinessLevel = "Strong Match";
      } else if (score >= 65) {
        analysis.readinessLevel = "Good Match";
      } else if (score >= 50) {
        analysis.readinessLevel = "Partial Match";
      } else {
        analysis.readinessLevel = "Significant Skill Gap";
      }
    }

    // 7. Ensure structured breakdown exists
    analysis.breakdown = {
      skillsMatch: Number.isFinite(analysis.breakdown?.skillsMatch)
        ? Math.max(
            0,
            Math.min(100, Math.round(analysis.breakdown.skillsMatch))
          )
        : score,

      technicalExperience: Number.isFinite(
        analysis.breakdown?.technicalExperience
      )
        ? Math.max(
            0,
            Math.min(
              100,
              Math.round(analysis.breakdown.technicalExperience)
            )
          )
        : score,

      projects: Number.isFinite(analysis.breakdown?.projects)
        ? Math.max(
            0,
            Math.min(100, Math.round(analysis.breakdown.projects))
          )
        : score,

      resumeAlignment: Number.isFinite(
        analysis.breakdown?.resumeAlignment
      )
        ? Math.max(
            0,
            Math.min(
              100,
              Math.round(analysis.breakdown.resumeAlignment)
            )
          )
        : score,
    };

    // 8. Integrate with existing MongoDB Learning collection
    try {
      const dbLearningTopics = await Learning.find();

      // Helper function to find a matching learning topic in DB
      const findMatchedDbTopic = (skillName, topicName) => {
        if (!dbLearningTopics || dbLearningTopics.length === 0) {
          return null;
        }

        const clean = (s) =>
          (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

        const cleanSkill = clean(skillName);
        const cleanTopic = clean(topicName);

        return dbLearningTopics.find((dbTopic) => {
          const dbCleanTitle = clean(dbTopic.title);

          // Direct title match
          if (
            (cleanSkill &&
              (dbCleanTitle === cleanSkill ||
                dbCleanTitle.includes(cleanSkill) ||
                cleanSkill.includes(dbCleanTitle))) ||
            (cleanTopic &&
              (dbCleanTitle === cleanTopic ||
                dbCleanTitle.includes(cleanTopic) ||
                cleanTopic.includes(dbCleanTitle)))
          ) {
            return true;
          }

          // Skills array match
          if (Array.isArray(dbTopic.skills)) {
            return dbTopic.skills.some((s) => {
              const cleanDbSkill = clean(s);

              return (
                (cleanSkill &&
                  (cleanDbSkill === cleanSkill ||
                    cleanDbSkill.includes(cleanSkill) ||
                    cleanSkill.includes(cleanDbSkill))) ||
                (cleanTopic &&
                  (cleanDbSkill === cleanTopic ||
                    cleanDbSkill.includes(cleanTopic) ||
                    cleanTopic.includes(cleanDbSkill)))
              );
            });
          }

          return false;
        });
      };

      const enrichedLearning = (
        analysis.learningRecommendations || []
      ).map((rec) => {
        const matched = findMatchedDbTopic(rec.skill, rec.topic);

        if (matched) {
          return {
            skill: rec.skill || matched.title,
            topic: matched.title,
            description: matched.description,
            difficulty: matched.difficulty,
            duration: matched.duration,
            priority: rec.priority || "Medium",
            reason:
              rec.reason || `Important skill required for ${role}.`,
            resources: matched.resources || [],
            matchedFromDatabase: true,
          };
        }

        return {
          skill: rec.skill,
          topic: rec.topic || rec.skill,
          description:
            rec.description ||
            `Build core competency in ${rec.skill} required for this role.`,
          difficulty: rec.difficulty || "Intermediate",
          duration: rec.duration || "Self-paced",
          priority: rec.priority || "Medium",
          reason:
            rec.reason || `Skill gap identified for ${role}.`,
          resources: Array.isArray(rec.resources)
            ? rec.resources
            : [],
          matchedFromDatabase: false,
        };
      });

      analysis.learningRecommendations = enrichedLearning;

      // Extract unique recommended resources from matched DB topics
      const resourceMap = new Map();

      enrichedLearning.forEach((item) => {
        if (item.resources && Array.isArray(item.resources)) {
          item.resources.forEach((r) => {
            if (
              r.name &&
              r.url &&
              !resourceMap.has(r.url)
            ) {
              resourceMap.set(r.url, {
                name: r.name,
                url: r.url,
              });
            }
          });
        }
      });

      analysis.recommendedResources =
        Array.from(resourceMap.values());
    } catch (dbErr) {
      console.warn(
        "Could not query Learning collection:",
        dbErr.message
      );

      // Gracefully retain AI learning recommendations if DB query fails
      analysis.recommendedResources =
        analysis.recommendedResources || [];
    }

    // 9. Standardize Mock Interview Recommendation
    const isMockRecommended = score >= 50;

    analysis.mockInterview = {
      recommended: isMockRecommended,

      reason:
        analysis.mockInterview?.reason ||
        (isMockRecommended
          ? "Your profile has a reasonable match for this role. You can test your readiness in an AI mock interview."
          : "We recommend focusing on your core skill gaps and learning plan before taking the interview."),
    };

    // 10. Ensure default arrays
    analysis.strengths = Array.isArray(analysis.strengths)
      ? analysis.strengths
      : [];

    analysis.skillAnalysis = Array.isArray(
      analysis.skillAnalysis
    )
      ? analysis.skillAnalysis
      : [];

    analysis.skillGaps = Array.isArray(
      analysis.skillGaps
    )
      ? analysis.skillGaps
      : [];

    analysis.resumeStrengths = Array.isArray(
      analysis.resumeStrengths
    )
      ? analysis.resumeStrengths
      : [];

    analysis.resumeWeaknesses = Array.isArray(
      analysis.resumeWeaknesses
    )
      ? analysis.resumeWeaknesses
      : [];

    analysis.resumeImprovements = Array.isArray(
      analysis.resumeImprovements
    )
      ? analysis.resumeImprovements
      : [];

    analysis.projectRecommendations = Array.isArray(
      analysis.projectRecommendations
    )
      ? analysis.projectRecommendations
      : [];

    analysis.nextSteps = Array.isArray(
      analysis.nextSteps
    )
      ? analysis.nextSteps
      : [];

    return res.status(200).json(analysis);
  } catch (error) {
    console.error(
      "Job Readiness Analysis Error:",
      error.message || error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to analyze job readiness. Please try again.",
    });
  }
};

module.exports = {
  analyzeJobReadiness,
};