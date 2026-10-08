require("dotenv").config();
const mongoose = require("mongoose");
const Internship = require("./models/Internship");
const Application = require("./models/Application");
const User = require("./models/User");

async function runSeed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    // 1. ADD JOB DESCRIPTIONS TO INTERNSHIPS THAT LACK THEM
    const internshipsToUpdate = await Internship.find({
      $or: [{ description: "" }, { description: { $exists: false } }],
    });

    let descriptionUpdates = 0;
    const descriptionsMap = {
      "Frontend Intern":
        "Work with the frontend development team to build responsive web interfaces using React.js and JavaScript. The intern will work on reusable UI components, API integration, debugging, and improving application performance.",
      "Full Stack Intern":
        "Assist in developing and maintaining full-stack web applications using React.js, Node.js, Express.js, and MongoDB. Responsibilities include building REST APIs, integrating frontend and backend services, database operations, and debugging.",
      "Frontend Developer Intern":
        "Collaborate with our engineering team to design and implement responsive, accessible, and fast web applications. You will write clean HTML, CSS, and modern JavaScript (React/TypeScript).",
      "Software Engineer Intern":
        "Join our core engineering team to design, build, and optimize scalable software solutions. Responsibilities include backend services, data structures, debugging, and ensuring software reliability.",
      "Java Developer Intern":
        "Assist in developing robust backend services and REST APIs using Java and Spring Boot. Work with databases, authentication, API integration, and backend debugging.",
    };

    const fallbackMap = {
      "AI/ML Intern": "Work on machine learning projects involving data preprocessing, model development, evaluation, and experimentation using Python and common machine learning libraries. The intern will assist in building and evaluating ML solutions for real-world problems.",
      "Backend Intern": "Assist in developing backend services and REST APIs using Node.js and Express.js. Work with databases, authentication, API integration, error handling, and backend debugging."
    };

    for (let internship of internshipsToUpdate) {
      if (!internship.description || internship.description.trim() === "") {
        internship.description = descriptionsMap[internship.title] || 
            (internship.title.includes("AI") || internship.title.includes("Machine Learning") ? fallbackMap["AI/ML Intern"] :
            internship.title.includes("Backend") ? fallbackMap["Backend Intern"] : 
            "Assist the engineering team in building scalable, reliable, and performant software solutions. The intern will work with modern technologies, write clean code, and participate in code reviews.");
        
        await internship.save();
        descriptionUpdates++;
      }
    }
    console.log(`Added descriptions to ${descriptionUpdates} internships.`);

    // 2. ADD DEFAULT "MY APPLICATIONS" DATA
    // Find a recruiter to associate with
    const recruiter = await User.findOne({ role: "recruiter" });
    if (!recruiter) {
      console.log("No recruiter found. Cannot create applications.");
      process.exit(1);
    }

    // Set postedBy to recruiter for any internship that lacks it so they are valid for applying
    await Internship.updateMany({ postedBy: null }, { $set: { postedBy: recruiter._id } });

    // Find all demo students named 'chandrika'
    const demoStudents = await User.find({ name: "chandrika", role: "student" });
    if (demoStudents.length === 0) {
      console.log("No demo student 'chandrika' found.");
      process.exit(1);
    }

    let applicationsAdded = 0;

    for (const student of demoStudents) {
      // Find internships matching the example companies
      const i1 = await Internship.findOne({ title: "Frontend Intern", company: "Amazon" }) || await Internship.findOne({ company: "Amazon" });
      const i2 = await Internship.findOne({ title: "Full Stack Intern", company: "Infosys" }) || await Internship.findOne({ company: "Infosys" });
      const i3 = await Internship.findOne({ title: "Software Engineer Intern", company: "Microsoft" }) || await Internship.findOne({ company: "Microsoft" });
      // Example mentioned TCS, but we might not have it. Fallback to Adobe or Google.
      const i4 = await Internship.findOne({ company: "TCS" }) || await Internship.findOne({ company: "Adobe" }) || await Internship.findOne();

      // Using Reviewing for "Under Review", and Shortlisted for "Interview" to adhere to schema.
      const appsToCreate = [
        { internship: i1, status: "Reviewing" }, 
        { internship: i2, status: "Shortlisted" },
        { internship: i3, status: "Applied" },
        { internship: i4, status: "Reviewing" }
      ];

      for (const item of appsToCreate) {
        if (!item.internship) continue;

        // Ensure idempotency
        const existingApp = await Application.findOne({
          student: student._id,
          internship: item.internship._id
        });

        if (!existingApp) {
          await Application.create({
            student: student._id,
            internship: item.internship._id,
            recruiter: item.internship.postedBy || recruiter._id,
            status: item.status
          });
          applicationsAdded++;
        }
      }
    }

    console.log(`Added ${applicationsAdded} demo applications (duplicate safe).`);
    process.exit(0);
  } catch (error) {
    console.error("Error running seed script:", error);
    process.exit(1);
  }
}

runSeed();
