const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function generateInterviewQuestions(
  role,
  description,
  resumeText,
  difficulty = "medium",
  questionType = "general"
) {
  const normDifficulty = (difficulty || "medium").toLowerCase();
  const normType = (questionType || "general").toLowerCase();

  let difficultyInstruction = "";
  if (normDifficulty === "easy") {
    difficultyInstruction =
      "Generate fundamental, straightforward interview questions covering core concepts suitable for basic preparation.";
  } else if (normDifficulty === "hard") {
    difficultyInstruction =
      "Generate advanced, deeper, scenario-based, and challenging technical interview questions testing complex architectural decisions, edge cases, and in-depth problem-solving.";
  } else {
    // medium default
    difficultyInstruction =
      "Generate practical, moderate-depth interview questions involving real-world application, trade-offs, and problem-solving.";
  }

  let typeInstruction = "";
  if (normType === "resume") {
    typeInstruction = `
- PRIMARY SOURCE: Candidate's Actual Resume.
- Base questions strictly on the projects, skills, technologies, and achievements actually present in the resume.
- Do NOT invent, assume, or hallucinate projects, technologies, or experience that are not present in the resume.
- Focus directly on what the candidate has built and used.`;
  } else if (normType === "jobdescription") {
    typeInstruction = `
- PRIMARY SOURCE: Job Description & Role Requirements.
- Base questions strictly on the skills, technologies, responsibilities, and requirements mentioned in the Job Description.
- Focus on assessing the candidate's qualification for the specific responsibilities outlined in the job description.`;
  } else {
    typeInstruction = `
- PRIMARY SOURCE: General Role Competencies.
- Generate questions generally relevant to the target role (${role}).
- Focus on foundational to practical industry concepts expected for this job title.
- Do not require resume or job description as the primary source.`;
  }

  const prompt = `
You are a senior technical interviewer and hiring manager conducting an interview for the role of ${role}.

TARGET ROLE:
${role}

SELECTED DIFFICULTY LEVEL:
${normDifficulty.toUpperCase()}
Rule: ${difficultyInstruction}

SELECTED QUESTION TYPE:
${normType.toUpperCase()}
Rule: ${typeInstruction}

CANDIDATE RESUME:
${resumeText || "No resume provided."}

JOB DESCRIPTION:
${description || "No job description provided."}

INSTRUCTIONS:
1. Generate exactly 5 interview questions.
2. Strictly enforce the selected difficulty level (${normDifficulty}): ${difficultyInstruction}
3. Strictly enforce the selected question type (${normType}):
   ${typeInstruction}
4. If Question Type is "resume", do NOT invent projects or skills not present in the resume.
5. Return ONLY a valid JSON array of 5 objects with no extra commentary or markdown formatting outside of JSON.

Format:
[
  {
    "question": "Question text here",
    "difficulty": "${normDifficulty.charAt(0).toUpperCase() + normDifficulty.slice(1)}"
  }
]
`;

  const response = await groq.chat.completions.create({
    model: "openai/gpt-oss-20b",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.6,
  });

  return response.choices[0].message.content;
}

async function evaluateInterviewAnswers(role, answers) {
  const prompt = `
You are a senior technical interviewer.

Evaluate the following interview.

Role:
${role}

Questions and Answers:

If a question has no answer, treat it as unanswered.

Do not assume the candidate knows the answer.

Score only based on the answers actually provided.

If all answers are empty, return an overall score of 0.

${JSON.stringify(answers, null, 2)}

Return ONLY JSON.

Example:

{
  "overallScore":85,
  "technicalKnowledge":8,
  "communication":9,
  "confidence":8,
  "strengths":[
    "Good React knowledge",
    "Clear explanations"
  ],
  "improvements":[
    "Practice DBMS",
    "Improve confidence"
  ],
  "feedback":"Overall good performance."
}
`;

  const response = await groq.chat.completions.create({
    model: "openai/gpt-oss-20b",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.5,
  });

  return response.choices[0].message.content;
}

async function generateProjectRecommendations(user) {
  const prompt = `
You are an experienced software mentor.

Generate exactly 6 software project recommendations based on the student's profile.

Student Profile

Branch:
${user.branch}

Skills:
${(user.skills || []).join(", ")}

Career Goal:
${user.goal}

Instructions:

1. Recommend projects suitable for the student's skill level.
2. Recommend projects that improve placement opportunities.
3. Prefer trending technologies used in the software industry.
4. Recommend portfolio-worthy projects.
5. Include projects frequently discussed in technical interviews.
6. Recommend modern tech stacks.
7. Explain why each project is recommended.
8. Return ONLY valid JSON.

Example:

[
  {
    "title":"AI Resume Analyzer",
    "description":"Analyze resumes and suggest improvements using AI.",
    "difficulty":"Intermediate",
    "reason":"Recommended because it strengthens your React, backend development and AI integration skills while being an excellent portfolio project.",
    "skills":["React","Node.js","AI"],
    "techStack":["React","Express","MongoDB","Groq AI"]
  }
]
`;

  const response = await groq.chat.completions.create({
    model: "openai/gpt-oss-20b",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.5,
    max_completion_tokens: 6000,
  });

  return response.choices[0].message.content;
}

async function generateLearningRecommendations(user) {
  const prompt = `
You are an expert software mentor.

Generate a personalized learning roadmap for the student.

Student Profile

Branch:
${user.branch}

Skills:
${(user.skills || []).join(", ")}

Career Goal:
${user.goal}

Instructions:

Return each topic with:
1. Recommend topics in a logical learning order.
2. Focus on technologies currently in demand.
3. Include interview preparation topics.
4. Recommend topics that strengthen the student's portfolio.
5. Explain why each topic is recommended.
6. Return ONLY valid JSON.

Example:

[
  {
    "title": "React Hooks",
    "description": "Learn useState and useEffect.",
    "difficulty": "Intermediate",
    "duration": "2 Weeks",
    "reason": "Recommended because React Hooks are essential for modern React development and are widely used in frontend interviews.",
    "resources": [
      {
        "name": "React Docs",
        "url": "https://react.dev"
      }
    ]
  }
]
`;

  const response = await groq.chat.completions.create({
    model: "openai/gpt-oss-20b",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.5,
    max_completion_tokens: 6000,
  });

  return response.choices[0].message.content;
}

async function analyzeResume(resumeText) {
  const prompt = `
You are an expert ATS (Applicant Tracking System) and Resume Quality Auditor.

Analyze the following resume for overall quality, ATS compatibility, and completeness.
IMPORTANT:
- This is a GENERAL resume evaluation. There is NO specific target job role or job description.
- Evaluate ONLY what is actually documented in the candidate's resume.
- Do NOT invent, assume, or fabricate any experience, projects, achievements, or skills.
- Return ONLY valid JSON with no markdown code fences or backticks.

Resume Content:
${resumeText || "No resume text provided."}

INSTRUCTIONS:
1. "atsScore": Overall ATS readiness and resume quality score between 0 and 100.
2. "readinessLevel": "ATS Ready" (80-100), "Good Quality" (65-79), "Needs Optimization" (50-64), or "Needs Rework" (<50).
3. "summary": A concise 2-3 sentence overall assessment of the resume's formatting, structure, and technical depth.
4. "breakdown": 5 numeric quality scores (0-100) based strictly on resume evidence:
   - "atsCompatibility": Parsing ease, section clarity, standard headings, avoiding complex tables/graphics.
   - "contentQuality": Action verbs, clarity, grammar, and professional tone.
   - "skillsRelevance": Depth, currency, and alignment of technical skills listed.
   - "projectStrength": Detail, technology mentions, and problem solving in projects.
   - "resumeCompleteness": Presence of critical sections (education, skills, projects, contact info).
5. "strengths": 3-5 specific, factual strengths found directly in the resume.
6. "weaknesses": 3-5 specific "Areas to Improve" observed in the resume.
7. "skillsDetected": Categorized object of technical skills explicitly mentioned in the resume:
   {
     "programming": ["..."],
     "frontend": ["..."],
     "backend": ["..."],
     "database": ["..."],
     "tools": ["..."]
   }
   Only include categories that have at least one detected skill. Do NOT invent skills.
8. "missingSkills": 3-5 common industry skills that would naturally complement the candidate's existing tech stack.
9. "resumeSections": An object evaluating whether standard resume sections are present based on evidence in the resume:
   {
     "education": true,
     "technicalSkills": true,
     "projects": true,
     "experience": true,
     "achievements": true,
     "certifications": true
   }
10. "atsAnalysis":
    - "positive": 2-4 positive ATS observations (e.g. "Standard section titles detect cleanly", "Clear contact and education details").
    - "issues": 1-3 potential ATS risks (e.g. "Lack of measurable metrics may reduce keyword scoring in screening filters", "Missing live project links"). If none, return an empty array.
    - "keywordsPresent": List of 6-10 prominent technical keywords already found in the resume.
11. "improvements": 4-5 concrete, actionable resume improvements (do NOT recommend fabricating experience).
12. "nextSteps": 4-5 prioritized next actions for the candidate.

Expected JSON schema:
{
  "atsScore": 84,
  "readinessLevel": "ATS Ready",
  "summary": "The resume features a well-structured technical foundation with relevant project work, though bullet points could be strengthened with measurable outcomes.",
  "breakdown": {
    "atsCompatibility": 86,
    "contentQuality": 82,
    "skillsRelevance": 88,
    "projectStrength": 80,
    "resumeCompleteness": 85
  },
  "strengths": [
    "Clear technical stack showcasing hands-on programming experience.",
    "Well-organized project descriptions highlighting architecture and tools.",
    "Clean education and academic qualification records."
  ],
  "weaknesses": [
    "Project bullet points lack quantifiable impact and performance metrics.",
    "Limited information on testing, deployment, and live repository links.",
    "Action verbs could be diversified to better highlight ownership."
  ],
  "skillsDetected": {
    "programming": ["Java", "JavaScript", "Python"],
    "frontend": ["React", "HTML5", "CSS3"],
    "backend": ["Node.js", "Express"],
    "database": ["MongoDB", "SQL"],
    "tools": ["Git", "Postman"]
  },
  "missingSkills": [
    "Docker",
    "CI/CD Pipelines",
    "Unit Testing"
  ],
  "resumeSections": {
    "education": true,
    "technicalSkills": true,
    "projects": true,
    "experience": false,
    "achievements": true,
    "certifications": false
  },
  "atsAnalysis": {
    "positive": [
      "Standard section headings allow automated ATS parsers to index content correctly.",
      "Clear chronological layout with contact and education info.",
      "Good density of foundational developer terminology."
    ],
    "issues": [
      "Absence of metrics (e.g. % speedup, user volume) may lower ranking in modern algorithmic screeners.",
      "Projects lack live links which verify production deployment."
    ],
    "keywordsPresent": [
      "React",
      "Node.js",
      "MongoDB",
      "Express",
      "REST APIs",
      "Git"
    ]
  },
  "improvements": [
    "Add measurable outcomes (e.g., response time improvements, dataset sizes) to project bullets.",
    "Include active GitHub repository or live deployment URLs for highlighted projects.",
    "Strengthen bullet points by starting with decisive impact verbs like Engineered, Optimized, or Deployed.",
    "Add relevant industry certifications or coursework if earned."
  ],
  "nextSteps": [
    "Refine project descriptions with quantifiable results and user metrics.",
    "Add live demo links and GitHub links to project sections.",
    "Ensure consistent dates and formatting across all sections.",
    "Analyze resume against specific target roles using Job Match Analysis."
  ]
}
`;

  const response = await groq.chat.completions.create({
    model: "openai/gpt-oss-20b",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.4,
    max_completion_tokens: 6000,
  });

  return response.choices[0].message.content;
}

async function analyzeResumeForJob(resumeText, role, description) {
  const prompt = `
You are an expert technical recruiter and job-readiness analyst.

Analyze how ready the candidate is for the specified target role based strictly on their resume and the job requirements.

Target Job Role:
${role}

Job Description:
${description}

Candidate Resume:
${resumeText || "No resume text provided."}

CRITICAL INSTRUCTIONS:
1. Analyze ONLY evidence present in the resume. Compare the resume against the supplied job description.
2. Do NOT invent experience or assume the candidate knows a skill without clear evidence.
3. Calculate an overall job match score (0-100) called "jobMatchScore". This represents how well the evidence in the resume matches the requirements of the job description.
4. Set "readinessLevel" based on the score:
   - 80-100: "Strong Match"
   - 65-79: "Good Match"
   - 50-64: "Partial Match"
   - Below 50: "Significant Skill Gap"
5. Provide a readiness breakdown with scores (0-100) for:
   - skillsMatch
   - technicalExperience
   - projects
   - resumeAlignment
6. Distinguish skills in "skillAnalysis":
   - "Strong": Explicitly demonstrated with relevant project/work experience.
   - "Partial": Mentioned in passing or partially covered, but lacking deep proof.
   - "Missing": Required/preferred by the job description but not found in the resume.
   Assign each skill an importance: "High", "Medium", or "Low".
7. Detail "skillGaps" for missing or weak skills with priority ("High", "Medium", "Low") and reason.
8. Recommend learning needs based on skill gaps. For each recommend: skill, topic, priority, and reason.
9. Recommend practical portfolio projects that directly demonstrate missing skills.
10. Analyze the resume itself: resumeStrengths, resumeWeaknesses, and specific, realistic resumeImprovements (do NOT recommend fabricating experience).
11. Provide prioritized "nextSteps" (e.g. 1. Learn X, 2. Build Y, 3. Update resume, 4. Practice interview).
12. For "mockInterview":
    - If jobMatchScore >= 50: recommended is true, explaining that the candidate has a reasonable match to test their readiness.
    - If jobMatchScore < 50: recommended is false, explaining that candidate should address core skill gaps first.
13. Return ONLY valid JSON.
14. Do NOT include markdown code fences or backticks (no \`\`\` or \`\`\`json).
15. Keep the response concise, concrete, and structured to prevent token limits.

Expected JSON schema:
{
  "jobMatchScore": 72,
  "readinessLevel": "Good Match",
  "summary": "Concise explanation of the candidate's alignment with the role.",
  "breakdown": {
    "skillsMatch": 80,
    "technicalExperience": 70,
    "projects": 75,
    "resumeAlignment": 68
  },
  "strengths": [
    {
      "skill": "Java",
      "reason": "The job requires Java and the resume demonstrates Java-based projects."
    }
  ],
  "skillAnalysis": [
    {
      "skill": "Java",
      "status": "Strong",
      "importance": "High",
      "reason": "Demonstrated hands-on experience and projects built with Java."
    },
    {
      "skill": "Docker",
      "status": "Missing",
      "importance": "High",
      "reason": "Docker is listed in the job description but is not demonstrated in the resume."
    }
  ],
  "skillGaps": [
    {
      "skill": "Docker",
      "priority": "High",
      "reason": "Required for deployment and containerized environments specified in the job."
    }
  ],
  "resumeStrengths": [
    "Clear project descriptions highlighting relevant technical stack."
  ],
  "resumeWeaknesses": [
    "Projects lack quantifiable impact and deployment links."
  ],
  "resumeImprovements": [
    "Add measurable outcomes and production impact metrics.",
    "Mention REST API and deployment details if present."
  ],
  "learningRecommendations": [
    {
      "skill": "Docker",
      "topic": "Docker",
      "priority": "High",
      "reason": "Essential for containerizing microservices required by this role."
    }
  ],
  "projectRecommendations": [
    {
      "title": "Containerized Backend Application",
      "description": "Build and containerize a backend service using Docker and Express.",
      "skills": ["Docker", "Node.js", "REST APIs"],
      "reason": "Directly demonstrates containerization competence for the target job."
    }
  ],
  "nextSteps": [
    "Learn Docker fundamentals.",
    "Practice backend testing.",
    "Build a Dockerized backend project.",
    "Update resume with Docker project evidence.",
    "Take the AI mock interview."
  ],
  "mockInterview": {
    "recommended": true,
    "reason": "The candidate has a reasonable match with the role and can now test their technical readiness."
  }
}
`;

  const response = await groq.chat.completions.create({
    model: "openai/gpt-oss-20b",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.4,
    max_completion_tokens: 6000,
  });

  return response.choices[0].message.content;
}

async function extractSkillsFromResume(resumeText) {
  const prompt = `You are a resume skill extraction system.

Extract only skills explicitly supported by the resume.

Return ONLY valid JSON.
Do not use markdown.
Do not use code fences.
Do not include explanations.

Required format:

{
  "skills": ["skill1", "skill2", "skill3"]
}

Include relevant:
- programming languages
- frameworks
- libraries
- databases
- developer tools
- cloud/platform technologies
- technical concepts
- relevant professional tools

Do not invent skills.
Do not infer unsupported skills.

Resume Text:
${resumeText || "No resume text provided."}`;

  const response = await groq.chat.completions.create({
    model: "openai/gpt-oss-20b",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.2,
    max_completion_tokens: 4000,
  });

  console.log(
    "RAW SKILL AI RESPONSE:",
    response.choices[0].message.content
  );

  const result = response.choices[0].message.content;

  let cleaned = (result || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("AI did not return valid JSON.");
  }

  cleaned = cleaned.substring(start, end + 1);

  const parsed = JSON.parse(cleaned);

  if (!parsed.skills || !Array.isArray(parsed.skills)) {
    throw new Error("AI returned an invalid skills format.");
  }

  const seen = new Set();
  const cleanSkills = [];
  for (const s of parsed.skills) {
    const trimmed = (typeof s === "string" ? s : String(s)).trim();
    if (!trimmed) continue;
    const lower = trimmed.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      cleanSkills.push(trimmed);
    }
  }

  return cleanSkills;
}

async function generateCustomProjectIdeas({ technologies = [], difficulty = "Intermediate", domain = "" }) {
  const techList = technologies.filter(Boolean).join(", ");
  const domainText =
    domain && domain !== "Any"
      ? `Target Domain / Industry: ${domain}`
      : "Domain: General Real-World Industry Application";

  const prompt = `
You are a senior principal engineer, open-source contributor, and technical hiring mentor.

A student wants to build software projects using specific technologies, difficulty, and optional domain.
Generate exactly 4 realistic, portfolio-worthy, production-grade project ideas tailored to their inputs.

Target Parameters:
- Technologies to use: ${techList || "Modern Web / Software Development Stack"}
- Target Difficulty Level: ${difficulty || "Intermediate"}
- ${domainText}

CRITICAL REQUIREMENTS:
1. The 4 projects MUST strictly center around and meaningfully use the student's selected technologies (${techList}).
2. The projects MUST strictly match the selected difficulty level (${difficulty}).
3. If a specific domain (${domain && domain !== "Any" ? domain : "General"}) is provided, all 4 project ideas MUST directly address realistic operational, clinical, enterprise, or consumer problems within that domain.
4. Generate realistic, impressive, portfolio-worthy projects that students can showcase to technical recruiters and discuss in system design interviews.
5. STRICTLY AVOID generic tutorial-style projects such as:
   - Todo App
   - Calculator
   - Basic Portfolio
   - Simple Weather App
   - Basic Blog
   - Simple CRUD application
   unless the user explicitly asked for basic beginner exercises. Focus on practical real-world problems with business/user value.
6. Provide a concise, clear problem statement and actionable core features for each project.
7. Generate EXACTLY 4 projects.
8. Return ONLY valid JSON with no markdown formatting, no code fences, no backticks.

Expected JSON array schema:
[
  {
    "title": "Project Title",
    "description": "2-3 sentence overview explaining what the platform does, its value proposition, and how it utilizes the tech stack.",
    "difficulty": "${difficulty || "Intermediate"}",
    "technologies": ["Tech1", "Tech2", "Tech3"],
    "problemStatement": "Clear description of the real-world operational or business challenge this project addresses.",
    "keyFeatures": [
      "Key technical feature 1",
      "Key technical feature 2",
      "Key technical feature 3",
      "Key technical feature 4"
    ],
    "whyRecommended": "Why this project is high-value for a student's portfolio and demonstrates mastery of the target stack."
  }
]
`;

  const response = await groq.chat.completions.create({
    model: "openai/gpt-oss-20b",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_completion_tokens: 5000,
  });

  const raw = response.choices[0].message.content;
  let cleaned = (raw || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");

  if (start === -1 || end === -1) {
    throw new Error("AI did not return a valid JSON array.");
  }

  cleaned = cleaned.substring(start, end + 1);
  const parsed = JSON.parse(cleaned);

  if (!Array.isArray(parsed)) {
    throw new Error("Expected an array of projects from AI.");
  }

  // Ensure each project has required schema fields
  return parsed.slice(0, 4).map((p) => ({
    title: p.title || "Custom Project Idea",
    description: p.description || "",
    difficulty: p.difficulty || difficulty || "Intermediate",
    technologies:
      Array.isArray(p.technologies) && p.technologies.length > 0
        ? p.technologies
        : technologies,
    problemStatement: p.problemStatement || p.description || "",
    keyFeatures: Array.isArray(p.keyFeatures) ? p.keyFeatures : [],
    whyRecommended: p.whyRecommended || "",
  }));
}

async function generateTopicRoadmap(topic) {
  const prompt = `
You are a senior technical educator and software curriculum architect.

A student wants to learn the topic/technology/skill: "${topic}".

Generate a structured, professional, and actionable learning roadmap and study guide.

Return ONLY valid JSON (no markdown formatting, no code fences, no commentary).

JSON structure:
{
  "title": "${topic}",
  "description": "2-3 sentence overview explaining what this technology/skill is and what it is used for in software development.",
  "whyLearn": "Explain why this skill is valuable in the industry, what career opportunities it unlocks, and how it is evaluated in technical interviews.",
  "difficulty": "Beginner | Intermediate | Advanced",
  "duration": "e.g. 2-3 Weeks",
  "prerequisites": [
    "Prerequisite 1",
    "Prerequisite 2"
  ],
  "whatYouWillLearn": [
    "Core concept or capability 1",
    "Core concept or capability 2",
    "Core concept or capability 3",
    "Core concept or capability 4"
  ],
  "roadmap": [
    {
      "step": 1,
      "phase": "Foundations",
      "title": "Phase 1 title",
      "description": "What to study and practice in this initial phase."
    },
    {
      "step": 2,
      "phase": "Core Architecture",
      "title": "Phase 2 title",
      "description": "Key techniques, patterns, and hands-on implementations."
    },
    {
      "step": 3,
      "phase": "Advanced Patterns",
      "title": "Phase 3 title",
      "description": "Performance, security, production considerations, and edge cases."
    },
    {
      "step": 4,
      "phase": "Production & Portfolio",
      "title": "Phase 4 title",
      "description": "Building full-scale projects, testing, and deployment."
    }
  ],
  "keyConcepts": [
    "Concept 1",
    "Concept 2",
    "Concept 3",
    "Concept 4",
    "Concept 5"
  ],
  "projects": [
    {
      "title": "Project Idea 1",
      "description": "Practical portfolio project description demonstrating this skill."
    },
    {
      "title": "Project Idea 2",
      "description": "Advanced or full-stack project description integrating this skill."
    }
  ],
  "resources": [
    {
      "name": "Official Documentation",
      "url": "https://..."
    },
    {
      "name": "Interactive / Recommended Guide",
      "url": "https://..."
    }
  ]
}
`;

  const response = await groq.chat.completions.create({
    model: "openai/gpt-oss-20b",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.4,
    max_completion_tokens: 6000,
  });

  const content = response.choices[0]?.message?.content || "{}";
  let cleaned = content
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("AI did not return valid JSON for topic roadmap.");
  }

  cleaned = cleaned.substring(start, end + 1);
  const parsed = JSON.parse(cleaned);

  return {
    title: parsed.title || topic,
    description: parsed.description || `Comprehensive guide to learning ${topic}.`,
    whyLearn: parsed.whyLearn || `Mastering ${topic} expands your technical versatility and job readiness.`,
    difficulty: parsed.difficulty || "Intermediate",
    duration: parsed.duration || "2-3 Weeks",
    prerequisites: Array.isArray(parsed.prerequisites) ? parsed.prerequisites : ["Basic Programming Foundations"],
    whatYouWillLearn: Array.isArray(parsed.whatYouWillLearn) ? parsed.whatYouWillLearn : [
      `Core fundamentals of ${topic}`,
      `Practical implementations and design patterns`,
      `Common interview questions and debugging strategies`
    ],
    roadmap: Array.isArray(parsed.roadmap) ? parsed.roadmap : [
      { step: 1, phase: "Foundations", title: "Getting Started", description: `Understand core building blocks and set up development environment for ${topic}.` },
      { step: 2, phase: "Core Skills", title: "Hands-on Development", description: `Build functional components and practice fundamental workflows with ${topic}.` },
      { step: 3, phase: "Best Practices", title: "Architecture & Optimization", description: `Master design patterns, debugging, and production-ready conventions.` }
    ],
    keyConcepts: Array.isArray(parsed.keyConcepts) ? parsed.keyConcepts : [topic, "Best Practices", "Core API", "Architecture"],
    projects: Array.isArray(parsed.projects) ? parsed.projects : [
      { title: `${topic} Starter Project`, description: `Build a clean, documented application showcasing key capabilities of ${topic}.` }
    ],
    resources: Array.isArray(parsed.resources) && parsed.resources.length > 0 ? parsed.resources : [
      { name: "Official Documentation", url: "https://developer.mozilla.org" }
    ],
  };
}

module.exports = {
  generateInterviewQuestions,
  evaluateInterviewAnswers,
  generateProjectRecommendations,
  generateLearningRecommendations,
  analyzeResume,
  analyzeResumeForJob,
  extractSkillsFromResume,
  generateCustomProjectIdeas,
  generateTopicRoadmap,
};




