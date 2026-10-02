// Curated list of cheerful, motivating, and playful daily developer messages
export const MOTIVATIONAL_MESSAGES = [
  "☀️ New day, new chance to make progress!",
  "🚀 Your future self is going to thank you for starting today.",
  "☕ Coffee ready? Career mode: ON!",
  "💻 One more project, one more reason to be proud.",
  "😎 You're not behind. You're building at your own pace.",
  "🌱 Small progress today. Big difference tomorrow.",
  "🐛 Every bug you fix makes you a little stronger.",
  "🔥 Keep going. Your GitHub is getting more interesting!",
  "✨ You don't need to know everything. Just keep learning.",
  "🎯 One step closer to that dream role.",
  "🛠️ Don't just learn it. Build it.",
  "😄 No pressure. Just make a little progress today!",
  "💡 Ideas are great, but working code is unbeatable.",
  "🌟 Every expert was once a beginner who didn't quit.",
  "⚡ Ship code, learn fast, repeat.",
  "🧱 Great systems are built one clean function at a time.",
  "🧭 Trust the journey. Every concept mastered is a milestone.",
  "📚 The best way to learn is by getting your hands dirty with code.",
  "🔮 What you build today is proof of what you can do tomorrow.",
  "🏆 Keep leveling up. The tech industry has a spot for you.",
  "🌈 Great developers aren't born; they're built line by line.",
  "🦾 Stack skills today, celebrate career wins tomorrow!",
  "🎨 Coding is an art where your logic comes to life.",
  "🔍 Debugging: Solving mysteries you accidentally created!",
  "🪴 Real growth happens outside your comfort zone.",
  "🏁 Every senior engineer once searched for basic syntax. Keep building!",
  "📈 Consistency beats intensity every single time.",
  "🧠 Every challenge today is a talking point for your next interview.",
  "🪄 Turning curiosity into code, one feature at a time.",
  "🚴 Keep moving forward. Even 20 minutes of focus counts.",
  "💎 Projects in your portfolio speak louder than words.",
  "🔑 Your curiosity is your greatest superpower as an engineer.",
  "🌌 Big career milestones start with small daily commits.",
  "💬 The code you write today shapes the engineer you become tomorrow.",
  "🎯 Focus on momentum over perfection.",
  "🏄 Ride the learning curve — it gets smoother with every project!",
  "🛡️ Don't fear the errors. They're just proof that you're trying.",
  "🚀 You've got this! Let's build something awesome today.",
  "🧩 Every complex project is just small problems solved one by one.",
  "☀️ Fresh day, fresh terminal. Let's make things happen!",
  "🛠️ Your portfolio is your story. Make it an impressive one.",
  "🏋️ Career workout starts now. Ready, set, build!",
  "🏃 It's a marathon of curiosity. Celebrate every small win!",
  "🔮 Tomorrow's opportunities depend on today's practice.",
  "🎈 Celebrate when your code works, and learn when it breaks!",
  "💫 Trust your ability to figure it out. You always do.",
];

/**
 * Deterministically picks one message for the current calendar day.
 * Ensures the message stays consistent across page re-renders on the same day,
 * and rotates automatically day by day.
 */
export function getDailyMotivationalMessage() {
  const now = new Date();
  // Calculate day-of-the-year (1 - 366)
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now - startOfYear;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  const index = Math.abs(dayOfYear) % MOTIVATIONAL_MESSAGES.length;
  return MOTIVATIONAL_MESSAGES[index];
}

// Set of lowercase soft skills to exclude from Technical Skills count
export const SOFT_SKILLS = new Set([
  "communication",
  "communication skills",
  "team collaboration",
  "collaboration",
  "teamwork",
  "time management",
  "leadership",
  "problem solving",
  "critical thinking",
  "adaptability",
  "work ethic",
  "emotional intelligence",
  "conflict resolution",
  "interpersonal skills",
  "active listening",
  "presentation",
  "presentation skills",
  "public speaking",
  "decision making",
  "negotiation",
  "creativity",
  "multitasking",
  "stress management",
  "mentoring",
  "empathy",
  "analytical thinking",
  "attention to detail",
  "organization",
  "flexibility",
  "customer service",
]);

/**
 * Computes count of technical skills by filtering out known soft skills.
 */
export function countTechnicalSkills(skills = []) {
  if (!Array.isArray(skills)) return 0;
  return skills.filter((s) => {
    if (!s || typeof s !== "string") return false;
    const clean = s.trim().toLowerCase();
    return !SOFT_SKILLS.has(clean);
  }).length;
}
