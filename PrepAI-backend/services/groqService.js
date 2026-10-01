require("dotenv").config();

const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function generateInterviewQuestions(role, description, resumeText) {
  const prompt = `
You are a senior software engineer conducting an interview.

Generate exactly 5 interview questions.

Candidate Resume:
${resumeText || "Resume not provided."}

Target Role:
${role}

Job Description:
${description}

Instructions:

1. Read the resume carefully.
2. Ask questions based on:
   - Resume projects
   - Skills mentioned
   - Technologies used
   - Job description
3. Mix Easy, Medium and Hard questions.
4. If the resume contains projects, ask about those projects.
5. If the resume is empty, generate questions only from the job description.

Return ONLY valid JSON.

Example:

[
  {
    "question": "Explain your Ecommerce project.",
    "difficulty": "Easy"
  },
  {
    "question": "How does React Virtual DOM work?",
    "difficulty": "Medium"
  },
  {
    "question": "Explain JWT Authentication in your project.",
    "difficulty": "Hard"
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

module.exports = {
  generateInterviewQuestions,
  evaluateInterviewAnswers,
  generateProjectRecommendations,
  generateLearningRecommendations,
  analyzeResume,
  analyzeResumeForJob,
};

