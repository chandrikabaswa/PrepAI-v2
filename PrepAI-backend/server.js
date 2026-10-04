const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const learningRoutes = require("./routes/learningRoutes");
const resumeRoutes = require("./routes/resumeRoutes");

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const internshipRoutes = require("./routes/internshipRoutes");
const aiInterviewRoutes = require("./routes/aiInterviewRoutes");
const jobReadinessRoutes = require("./routes/jobReadinessRoutes");
const applicationRoutes = require("./routes/applicationRoutes");

const path = require("path");

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/users", userRoutes);
app.use("/api/profile", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/internships", internshipRoutes);
app.use("/api/learning", learningRoutes);
app.use("/api/ai-interview", aiInterviewRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/job-readiness", jobReadinessRoutes);
app.use("/api/applications", applicationRoutes);

app.get("/", (req, res) => {
  res.send("PrepAI Backend is Running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
