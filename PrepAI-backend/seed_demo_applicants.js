require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Internship = require("./models/Internship");
const Application = require("./models/Application");

// 13 realistic demo student candidate profiles
const demoCandidates = [
  {
    name: "Aarav Sharma",
    email: "aarav.sharma.demo@prepai.dev",
    college: "Indian Institute of Technology (IIT) Delhi",
    degree: "B.Tech",
    branch: "Computer Science and Engineering",
    year: "4th Year",
    skills: ["Python", "PyTorch", "TensorFlow", "Deep Learning", "Computer Vision"],
    goal: "AI Research Scientist",
    bio: "Passionate about deep learning architectures, transformer models, and real-time computer vision pipelines.",
    status: "Shortlisted",
  },
  {
    name: "Ananya Iyer",
    email: "ananya.iyer.demo@prepai.dev",
    college: "BITS Pilani",
    degree: "B.E.",
    branch: "Computer Science",
    year: "3rd Year",
    skills: ["Python", "Scikit-Learn", "NLP", "BERT", "FastAPI"],
    goal: "Machine Learning Engineer",
    bio: "Specializing in NLP and conversational AI. Built text summarization microservices and semantic search tools.",
    status: "Reviewing",
  },
  {
    name: "Rohan Mehta",
    email: "rohan.mehta.demo@prepai.dev",
    college: "National Institute of Technology (NIT) Trichy",
    degree: "B.Tech",
    branch: "Data Science & Artificial Intelligence",
    year: "4th Year",
    skills: ["Python", "Machine Learning", "Pandas", "NumPy", "SQL"],
    goal: "Applied ML Engineer",
    bio: "Focused on predictive analytics and reinforcement learning. Ranked top 5% in university hackathons.",
    status: "Reviewing",
  },
  {
    name: "Priya Nair",
    email: "priya.nair.demo@prepai.dev",
    college: "IIIT Hyderabad",
    degree: "M.Tech",
    branch: "Artificial Intelligence",
    year: "2nd Year (Postgrad)",
    skills: ["PyTorch", "Computer Vision", "OpenCV", "CUDA", "Python"],
    goal: "Computer Vision Researcher",
    bio: "Graduate researcher with publications in multi-object tracking and generative adversarial networks (GANs).",
    status: "Shortlisted",
  },
  {
    name: "Vikramaditya Rao",
    email: "vikram.rao.demo@prepai.dev",
    college: "IIT Bombay",
    degree: "B.Tech",
    branch: "Electrical Engineering & CS Minor",
    year: "3rd Year",
    skills: ["Python", "TensorFlow", "Edge AI", "Embedded C++", "C++"],
    goal: "Embedded ML Specialist",
    bio: "Enthusiast for on-device machine learning optimization, quantized neural nets, and low-latency inference.",
    status: "Applied",
  },
  {
    name: "Sneha Kulkarni",
    email: "sneha.kulkarni.demo@prepai.dev",
    college: "College of Engineering Pune (COEP)",
    degree: "B.Tech",
    branch: "Computer Engineering",
    year: "4th Year",
    skills: ["Python", "Flask", "Docker", "Machine Learning", "MLflow"],
    goal: "MLOps Engineer",
    bio: "Strong focus on MLOps, automated CI/CD for ML models, data version control, and containerized deployments.",
    status: "Reviewing",
  },
  {
    name: "Devansh Patel",
    email: "devansh.patel.demo@prepai.dev",
    college: "Delhi Technological University (DTU)",
    degree: "B.Tech",
    branch: "Information Technology",
    year: "3rd Year",
    skills: ["Python", "Data Structures", "Algorithms", "Machine Learning", "Git"],
    goal: "Software Engineer / AI",
    bio: "Competitive programmer with solid foundations in algorithmic problem solving and foundational ML.",
    status: "Applied",
  },
  {
    name: "Tanvi Deshmukh",
    email: "tanvi.deshmukh.demo@prepai.dev",
    college: "Vellore Institute of Technology (VIT)",
    degree: "B.Tech",
    branch: "Computer Science",
    year: "4th Year",
    skills: ["Python", "LLMs", "LangChain", "Vector Databases", "Prompt Engineering"],
    goal: "Generative AI Engineer",
    bio: "Building Retrieval-Augmented Generation (RAG) agents, semantic cache systems, and evaluation frameworks.",
    status: "Shortlisted",
  },
  {
    name: "Kabir Sen",
    email: "kabir.sen.demo@prepai.dev",
    college: "Jadavpur University",
    degree: "B.E.",
    branch: "Computer Science and Engineering",
    year: "3rd Year",
    skills: ["Python", "Statistics", "Data Analysis", "SQL", "Pandas"],
    goal: "Data Scientist",
    bio: "Passionate about probability theory, statistical hypothesis testing, and exploratory data analysis.",
    status: "Applied",
  },
  {
    name: "Meera Reddy",
    email: "meera.reddy.demo@prepai.dev",
    college: "Osmania University College of Engineering",
    degree: "B.E.",
    branch: "Information Technology",
    year: "4th Year",
    skills: ["Python", "Scikit-Learn", "Matplotlib", "Seaborn", "Machine Learning"],
    goal: "AI Solutions Developer",
    bio: "Developing practical AI-driven business tools and predictive models with intuitive dashboards.",
    status: "Reviewing",
  },
  {
    name: "Arjun Gupta",
    email: "arjun.gupta.demo@prepai.dev",
    college: "Manipal Institute of Technology",
    degree: "B.Tech",
    branch: "Electronics & Communication",
    year: "2nd Year",
    skills: ["C++", "Basic Python", "HTML", "CSS"],
    goal: "Software Developer",
    bio: "Eager second-year student exploring machine learning fundamentals and building introductory software projects.",
    status: "Rejected",
  },
  {
    name: "Siddharth Malhotra",
    email: "siddharth.m.demo@prepai.dev",
    college: "SRM Institute of Science and Technology",
    degree: "B.Tech",
    branch: "Mechanical Engineering",
    year: "4th Year",
    skills: ["MATLAB", "Basic Python", "CAD"],
    goal: "Engineering Analyst",
    bio: "Transitioning from mechanical design to computational modeling and artificial intelligence.",
    status: "Rejected",
  },
  {
    name: "Rhea Bhattacharya",
    email: "rhea.bhatt.demo@prepai.dev",
    college: "Amity University",
    degree: "BCA",
    branch: "Computer Applications",
    year: "3rd Year",
    skills: ["JavaScript", "HTML", "CSS", "Basic Python"],
    goal: "Web Developer",
    bio: "Frontend developer interested in exploring AI integrations and intelligent web user interfaces.",
    status: "Rejected",
  },
];

async function seedDemoApplicants() {
  try {
    console.log("==================================================");
    console.log("  SEEDING DEMO APPLICANTS FOR RECRUITER POSTING   ");
    console.log("==================================================");

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    // 1. Find existing recruiter-posted internships
    const recruiterInternships = await Internship.find({
      postedBy: { $ne: null },
    });

    if (recruiterInternships.length === 0) {
      console.log(
        "No recruiter-posted internships found! Please create a recruiter internship first."
      );
      await mongoose.disconnect();
      return;
    }

    console.log(
      `Found ${recruiterInternships.length} recruiter-posted internship(s):`
    );
    recruiterInternships.forEach((job) => {
      console.log(
        ` - [${job._id}] ${job.title} at ${job.company} (recruiter: ${job.postedBy})`
      );
    });

    // We seed applicants for the target recruiter internship (e.g. Google AI/ML Intern)
    const targetJob =
      recruiterInternships.find(
        (job) =>
          job.title.toLowerCase().includes("ai") ||
          job.company.toLowerCase().includes("google")
      ) || recruiterInternships[0];

    console.log(
      `\nTargeting internship for demo applicants: "${targetJob.title}" at "${targetJob.company}" (ID: ${targetJob._id})`
    );

    // 2. Clean up any orphaned applications with dangling user/internship references from prior tests
    const allApps = await Application.find();
    let cleanedOrphans = 0;
    for (const app of allApps) {
      const studentExists = await User.findById(app.student);
      const internshipExists = await Internship.findById(app.internship);
      if (!studentExists || !internshipExists) {
        await Application.findByIdAndDelete(app._id);
        cleanedOrphans++;
      }
    }
    if (cleanedOrphans > 0) {
      console.log(
        `Cleaned up ${cleanedOrphans} orphaned application records with dangling references.`
      );
    }

    // 3. Create or find demo students and attach applications
    const defaultPassword = await bcrypt.hash("DemoStudent123!", 10);
    let createdUsersCount = 0;
    let createdAppsCount = 0;
    let existingAppsCount = 0;

    for (const candidate of demoCandidates) {
      // Find or create student
      let student = await User.findOne({ email: candidate.email });
      if (!student) {
        student = await User.create({
          name: candidate.name,
          email: candidate.email,
          password: defaultPassword,
          role: "student",
          college: candidate.college,
          degree: candidate.degree,
          branch: candidate.branch,
          year: candidate.year,
          skills: candidate.skills,
          goal: candidate.goal,
          bio: candidate.bio,
          isVerified: true,
        });
        createdUsersCount++;
      } else {
        // Update profile fields to ensure latest realism
        student.name = candidate.name;
        student.college = candidate.college;
        student.degree = candidate.degree;
        student.branch = candidate.branch;
        student.year = candidate.year;
        student.skills = candidate.skills;
        student.goal = candidate.goal;
        student.bio = candidate.bio;
        await student.save();
      }

      // Check if application already exists (prevent duplicates)
      let app = await Application.findOne({
        student: student._id,
        internship: targetJob._id,
      });

      if (!app) {
        app = await Application.create({
          student: student._id,
          internship: targetJob._id,
          recruiter: targetJob.postedBy,
          status: candidate.status,
        });
        createdAppsCount++;
      } else {
        // Keep status updated
        app.status = candidate.status;
        await app.save();
        existingAppsCount++;
      }
    }

    console.log(`\nDemo Seeding Summary:`);
    console.log(` - Demo student users created: ${createdUsersCount}`);
    console.log(` - New applications created: ${createdAppsCount}`);
    console.log(` - Existing applications refreshed: ${existingAppsCount}`);

    // 4. Final Verification
    const finalApps = await Application.find({ internship: targetJob._id })
      .populate("student", "name email college degree branch year skills")
      .sort({ createdAt: -1 });

    console.log(
      `\nTotal verified applicants for "${targetJob.title}": ${finalApps.length}`
    );

    const statusBreakdown = {
      Applied: 0,
      Reviewing: 0,
      Shortlisted: 0,
      Rejected: 0,
    };
    finalApps.forEach((a) => {
      if (statusBreakdown[a.status] !== undefined) {
        statusBreakdown[a.status]++;
      }
    });

    console.log("Status Breakdown:", statusBreakdown);
    console.log("\nApplicant List preview:");
    finalApps.forEach((a, idx) => {
      console.log(
        ` ${idx + 1}. ${a.student?.name} (${a.student?.email}) - [${a.status}] - ${a.student?.college}`
      );
    });

    await mongoose.disconnect();
    console.log("\nSeeding finished successfully! Database disconnected.");
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedDemoApplicants();
}

module.exports = seedDemoApplicants;
