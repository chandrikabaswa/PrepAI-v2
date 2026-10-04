require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Internship = require("./models/Internship");
const Application = require("./models/Application");

// 30 realistic demo student candidate profiles covering all engineering & tech domains
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
  },
  {
    name: "Siddharth Malhotra",
    email: "siddharth.m.demo@prepai.dev",
    college: "SRM Institute of Science and Technology",
    degree: "B.Tech",
    branch: "Mechanical Engineering",
    year: "4th Year",
    skills: ["MATLAB", "Basic Python", "CAD", "Control Systems"],
    goal: "Engineering Analyst",
    bio: "Transitioning from mechanical design to computational modeling, control systems, and artificial intelligence.",
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
  },
  {
    name: "Aditya Verma",
    email: "aditya.verma.demo@prepai.dev",
    college: "IIIT Bangalore",
    degree: "B.Tech",
    branch: "Computer Science",
    year: "4th Year",
    skills: ["React", "Node.js", "JavaScript", "MongoDB", "Express", "REST APIs"],
    goal: "Full Stack Software Engineer",
    bio: "Full stack web developer passionate about high-concurrency microservices, GraphQL, and modern React SPAs.",
  },
  {
    name: "Ishita Sen",
    email: "ishita.sen.demo@prepai.dev",
    college: "Jadavpur University",
    degree: "B.E.",
    branch: "Information Technology",
    year: "3rd Year",
    skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "Docker", "Git"],
    goal: "Full Stack Product Engineer",
    bio: "Developing modern TypeScript applications with clean architecture, automated testing, and CI/CD pipelines.",
  },
  {
    name: "Rahul Deshmukh",
    email: "rahul.deshmukh.demo@prepai.dev",
    college: "College of Engineering Pune (COEP)",
    degree: "B.Tech",
    branch: "Computer Engineering",
    year: "4th Year",
    skills: ["Google Cloud", "AWS", "Docker", "Kubernetes", "Linux", "Python"],
    goal: "Cloud Solutions Architect",
    bio: "Certified cloud enthusiast with hands-on multi-cloud deployments, Terraform scripts, and serverless architectures.",
  },
  {
    name: "Kavya Menon",
    email: "kavya.menon.demo@prepai.dev",
    college: "National Institute of Technology (NIT) Calicut",
    degree: "B.Tech",
    branch: "Computer Science and Engineering",
    year: "4th Year",
    skills: ["Linux", "Python", "Kubernetes", "Cloud", "Prometheus", "CI/CD"],
    goal: "Site Reliability Engineer (SRE)",
    bio: "Focusing on system observability, automated incident response, distributed tracing, and fault-tolerant cloud clusters.",
  },
  {
    name: "Harsh Vardhan",
    email: "harsh.vardhan.demo@prepai.dev",
    college: "Indian Institute of Technology (IIT) Roorkee",
    degree: "B.Tech",
    branch: "Computer Science",
    year: "3rd Year",
    skills: ["Python", "SQL", "Big Data", "Spark", "Hadoop", "Pandas"],
    goal: "Big Data Engineer",
    bio: "Enthusiastic about large-scale ETL pipelines, streaming data processing with Apache Spark/Kafka, and data lakes.",
  },
  {
    name: "Nikhil Choudhary",
    email: "nikhil.choudhary.demo@prepai.dev",
    college: "Malaviya National Institute of Technology (MNIT) Jaipur",
    degree: "B.Tech",
    branch: "Information Technology",
    year: "4th Year",
    skills: ["Kotlin", "Android", "Java", "APIs", "Android Studio"],
    goal: "Senior Android Developer",
    bio: "Building high-performance native Android applications using Jetpack Compose, MVVM architecture, and coroutines.",
  },
  {
    name: "Divya Sharma",
    email: "divya.sharma.demo@prepai.dev",
    college: "Delhi Technological University (DTU)",
    degree: "B.Tech",
    branch: "Software Engineering",
    year: "3rd Year",
    skills: ["Kotlin", "Android", "Java", "REST APIs", "Git"],
    goal: "Mobile Applications Engineer",
    bio: "Passionate about mobile UX, offline-first architectures, Room database caching, and material design systems.",
  },
  {
    name: "Ayush Singhania",
    email: "ayush.singhania.demo@prepai.dev",
    college: "BITS Pilani, Goa Campus",
    degree: "B.E.",
    branch: "Computer Science",
    year: "4th Year",
    skills: ["Python", "Cybersecurity", "Linux", "Networking", "Wireshark"],
    goal: "Information Security Analyst",
    bio: "Active CTF participant with focus on network vulnerability assessment, packet analysis, and cryptanalysis.",
  },
  {
    name: "Rithika Nair",
    email: "rithika.nair.demo@prepai.dev",
    college: "Amrita Vishwa Vidyapeetham",
    degree: "B.Tech",
    branch: "Cyber Security",
    year: "4th Year",
    skills: ["Cybersecurity", "Linux", "Networking", "Python", "Penetration Testing"],
    goal: "Security Operations Specialist",
    bio: "Specializing in zero-trust architecture, threat hunting, secure software development, and Linux kernel hardening.",
  },
  {
    name: "Varun Joshi",
    email: "varun.joshi.demo@prepai.dev",
    college: "Indian Institute of Technology (IIT) Guwahati",
    degree: "B.Tech",
    branch: "Computer Science",
    year: "4th Year",
    skills: ["C++", "Linux", "Algorithms", "Systems", "DSA"],
    goal: "Systems Software Engineer",
    bio: "Deep interest in low-level systems programming, cache-coherent memory models, compiler design, and multithreading.",
  },
  {
    name: "Pranav Hegde",
    email: "pranav.hegde.demo@prepai.dev",
    college: "R.V. College of Engineering (RVCE) Bengaluru",
    degree: "B.E.",
    branch: "Electronics and Communication",
    year: "3rd Year",
    skills: ["Embedded Systems", "C++", "IoT", "Linux", "Microcontrollers", "C"],
    goal: "Embedded Systems Engineer",
    bio: "Hands-on experience with ARM Cortex microcontrollers, RTOS kernels, SPI/I2C communication, and IoT sensor meshes.",
  },
  {
    name: "Shreya Ghoshal",
    email: "shreya.ghoshal.demo@prepai.dev",
    college: "MIT World Peace University Pune",
    degree: "B.Tech",
    branch: "Computer Science (Design Specialization)",
    year: "4th Year",
    skills: ["HTML", "CSS", "JavaScript", "React", "Figma", "UI/UX"],
    goal: "UX Engineer",
    bio: "Bridging the gap between design and engineering with design systems, accessible components, and CSS animations.",
  },
  {
    name: "Manish Aggarwal",
    email: "manish.aggarwal.demo@prepai.dev",
    college: "Netaji Subhas University of Technology (NSUT) Delhi",
    degree: "B.Tech",
    branch: "Information Technology",
    year: "3rd Year",
    skills: ["JavaScript", "TypeScript", "APIs", "Web Development", "Node.js"],
    goal: "Web Solutions Engineer",
    bio: "Building robust developer tooling, public APIs, webhooks integration, and reliable enterprise web platforms.",
  },
  {
    name: "Sanjay Pillai",
    email: "sanjay.pillai.demo@prepai.dev",
    college: "PSG College of Technology Coimbatore",
    degree: "B.Tech",
    branch: "Robotics and Automation",
    year: "4th Year",
    skills: ["Python", "ROS", "Autonomous Systems", "Computer Vision", "C++", "Sensors"],
    goal: "Autonomous Systems Engineer",
    bio: "Working on sensor fusion (LiDAR/Radar/Camera), path planning algorithms, and ROS-based autonomous vehicle stacks.",
  },
  {
    name: "Deepa Krishnan",
    email: "deepa.krishnan.demo@prepai.dev",
    college: "College of Engineering Guindy (Anna University)",
    degree: "B.E.",
    branch: "Electrical and Electronics",
    year: "4th Year",
    skills: ["Smart Grid", "Green Energy", "IoT", "Python", "MATLAB", "Data Analysis"],
    goal: "Smart Grid & Energy Systems Engineer",
    bio: "Dedicated to renewable energy integration, battery management telemetry, and AI-optimized power distribution grids.",
  },
  {
    name: "Tarun Bhatia",
    email: "tarun.bhatia.demo@prepai.dev",
    college: "Thapar Institute of Engineering and Technology",
    degree: "B.Tech",
    branch: "Computer Engineering",
    year: "3rd Year",
    skills: ["Java", "Spring Boot", "REST APIs", "SQL", "Git"],
    goal: "Enterprise Backend Engineer",
    bio: "Developing Spring Boot microservices with Hibernate ORM, connection pooling, and distributed caching with Redis.",
  },
  {
    name: "Pooja Hegde",
    email: "pooja.hegde.demo@prepai.dev",
    college: "PES University Bengaluru",
    degree: "B.Tech",
    branch: "Computer Science",
    year: "4th Year",
    skills: ["AWS", "Linux", "Docker", "Python", "Kubernetes", "DevOps"],
    goal: "DevOps & Infrastructure Engineer",
    bio: "Passionate about GitOps, Helm chart automation, infrastructure as code, and continuous deployment workflows.",
  },
];

async function seedDemoApplicants() {
  console.log("==================================================");
  console.log(" POPULATING DEMO APPLICANTS FOR ALL INTERNSHIPS   ");
  console.log("==================================================");

  let totalApplicantsCreated = 0;
  let totalDuplicatesSkipped = 0;

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB Atlas.");

    // 1. Find default recruiter
    const defaultRecruiter =
      (await User.findOne({ role: "recruiter" })) ||
      (await User.findOne({ email: "mogalichandu4@gmail.com" }));

    if (!defaultRecruiter) {
      console.error("No recruiter user found in database!");
      await mongoose.disconnect();
      return;
    }

    console.log(
      `Using Recruiter: ${defaultRecruiter.name} (${defaultRecruiter.email}) [ID: ${defaultRecruiter._id}]`
    );

    // 2. Upsert / synchronize all 30 demo students
    const defaultPassword = await bcrypt.hash("DemoStudent123!", 10);
    const studentUserDocs = [];

    for (const candidate of demoCandidates) {
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
      } else {
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
      studentUserDocs.push(student);
    }

    console.log(`Synchronized ${studentUserDocs.length} demo student user profiles.`);

    // 3. Retrieve ALL internships in MongoDB
    const allInternships = await Internship.find().sort({ createdAt: 1 });
    console.log(`Found ${allInternships.length} internships across the database.\n`);

    // Target distribution array ensuring varied counts between 3 and 6
    const targetPattern = [4, 5, 3, 6, 4, 5, 3, 4, 5, 6, 3, 5, 4, 6, 3, 5, 4];
    const statusCycle = ["Shortlisted", "Reviewing", "Applied", "Rejected", "Reviewing", "Applied"];

    // 4. Populate applicants for each internship
    for (let i = 0; i < allInternships.length; i++) {
      const job = allInternships[i];
      const targetCount = targetPattern[i % targetPattern.length];

      // Get existing applications for this internship
      const existingApps = await Application.find({ internship: job._id });
      const currentCount = existingApps.length;
      const appliedStudentIds = new Set(existingApps.map((a) => a.student.toString()));

      // If already at or above target count (like AI/ML Intern with 14), preserve and skip adding more
      if (currentCount >= targetCount && currentCount >= 3) {
        totalDuplicatesSkipped += currentCount;
        continue;
      }

      const neededCount = targetCount - currentCount;
      const jobSkillsClean = (job.skills || []).map((s) => s.toLowerCase().trim());

      // Score and rank all demo students by relevance to this job
      const scoredStudents = studentUserDocs
        .filter((s) => !appliedStudentIds.has(s._id.toString()))
        .map((student) => {
          const studentSkillsClean = (student.skills || []).map((s) => s.toLowerCase().trim());
          const matchedSkills = jobSkillsClean.filter((skill) =>
            studentSkillsClean.some((s) => s.includes(skill) || skill.includes(s))
          );
          const matchScore =
            jobSkillsClean.length > 0
              ? Math.round((matchedSkills.length / jobSkillsClean.length) * 100)
              : 0;
          return { student, matchScore, matchedSkills };
        })
        .sort((a, b) => b.matchScore - a.matchScore);

      // Select top candidates
      const selected = scoredStudents.slice(0, neededCount);

      for (let sIdx = 0; sIdx < selected.length; sIdx++) {
        const item = selected[sIdx];
        const assignedStatus = statusCycle[sIdx % statusCycle.length];

        const existingApp = await Application.findOne({
          student: item.student._id,
          internship: job._id,
        });

        if (!existingApp) {
          await Application.create({
            student: item.student._id,
            internship: job._id,
            recruiter: job.postedBy || defaultRecruiter._id,
            status: assignedStatus,
          });
          totalApplicantsCreated++;
        } else {
          totalDuplicatesSkipped++;
        }
      }
    }

    // 5. Final Verification & Table Generation
    console.log("================================================================================");
    console.log(
      `${"Internship Title".padEnd(44)} | ${"Company".padEnd(16)} | ${"Applicants"}`
    );
    console.log("--------------------------------------------------------------------------------");

    let minCount = Infinity;
    let maxCount = 0;
    let internshipsWithApplicants = 0;

    for (const job of allInternships) {
      const apps = await Application.find({ internship: job._id });
      const count = apps.length;

      if (count > 0) internshipsWithApplicants++;
      if (count < minCount) minCount = count;
      if (count > maxCount) maxCount = count;

      console.log(
        `${job.title.substring(0, 42).padEnd(44)} | ${job.company.substring(0, 15).padEnd(16)} | ${count}`
      );
    }
    console.log("================================================================================");

    console.log("\n==================================================");
    console.log("               SEEDING SUMMARY                    ");
    console.log("==================================================");
    console.log(`Total internships found:            ${allInternships.length}`);
    console.log(`Total applicants created:          ${totalApplicantsCreated}`);
    console.log(`Number of internships with apps:   ${internshipsWithApplicants}`);
    console.log(`Minimum applicant count:           ${minCount}`);
    console.log(`Maximum applicant count:           ${maxCount}`);
    console.log(`Existing applications preserved:   ${totalDuplicatesSkipped}`);
    console.log("==================================================");

    await mongoose.disconnect();
    console.log("Database connection closed.");

    return {
      totalInternships: allInternships.length,
      totalApplicantsCreated,
      internshipsWithApplicants,
      minCount,
      maxCount,
      totalDuplicatesSkipped,
    };
  } catch (err) {
    console.error("Error seeding demo applicants:", err);
    process.exit(1);
  }
}

if (require.main === module) {
  seedDemoApplicants();
}

module.exports = seedDemoApplicants;
