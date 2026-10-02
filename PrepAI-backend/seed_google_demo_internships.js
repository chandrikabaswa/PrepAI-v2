require("dotenv").config();
const mongoose = require("mongoose");
const Internship = require("./models/Internship");
const User = require("./models/User");

const commonDescription =
  "Work with engineering teams to design, develop, test, and improve scalable technology solutions. Collaborate with engineers and product teams, participate in code reviews, solve technical problems, and contribute to real-world projects.\n\nDemo internship posting. Candidates should search Google Careers for the relevant internship title and verify current availability, eligibility, and application deadline.";

const googleInternshipsData = [
  {
    title: "Software Engineering Intern",
    company: "Google",
    location: "Bengaluru",
    mode: "Hybrid",
    duration: "6 Months",
    stipend: "₹80,000/month",
    skills: ["Java", "Python", "DSA", "Git"],
    applyLink: "https://careers.google.com",
    status: "Active",
    description: commonDescription,
  },
  {
    title: "AI/ML Engineering Intern",
    company: "Google",
    location: "Bengaluru",
    mode: "Hybrid",
    duration: "6 Months",
    stipend: "₹85,000/month",
    skills: ["Python", "Machine Learning", "TensorFlow"],
    applyLink: "https://careers.google.com",
    status: "Active",
    description: commonDescription,
  },
  {
    title: "Full Stack Developer Intern",
    company: "Google",
    location: "Hyderabad",
    mode: "Hybrid",
    duration: "6 Months",
    stipend: "₹75,000/month",
    skills: ["React", "Node.js", "JavaScript", "MongoDB"],
    applyLink: "https://careers.google.com",
    status: "Active",
    description: commonDescription,
  },
  {
    title: "Data Engineering Intern",
    company: "Google",
    location: "Bengaluru",
    mode: "Hybrid",
    duration: "6 Months",
    stipend: "₹80,000/month",
    skills: ["Python", "SQL", "Big Data", "Spark"],
    applyLink: "https://careers.google.com",
    status: "Active",
    description: commonDescription,
  },
  {
    title: "Cloud Engineering Intern",
    company: "Google",
    location: "Hyderabad",
    mode: "Hybrid",
    duration: "6 Months",
    stipend: "₹85,000/month",
    skills: ["Google Cloud", "Python", "Linux", "Docker"],
    applyLink: "https://careers.google.com",
    status: "Active",
    description: commonDescription,
  },
  {
    title: "Android Development Intern",
    company: "Google",
    location: "Bengaluru",
    mode: "Hybrid",
    duration: "6 Months",
    stipend: "₹75,000/month",
    skills: ["Kotlin", "Android", "Java", "APIs"],
    applyLink: "https://careers.google.com",
    status: "Active",
    description: commonDescription,
  },
  {
    title: "Web Solutions Engineering Intern",
    company: "Google",
    location: "Hyderabad",
    mode: "Hybrid",
    duration: "6 Months",
    stipend: "₹78,000/month",
    skills: ["JavaScript", "TypeScript", "APIs", "Web Development"],
    applyLink: "https://careers.google.com",
    status: "Active",
    description: commonDescription,
  },
  {
    title: "Application Engineering Intern",
    company: "Google",
    location: "Bengaluru",
    mode: "Hybrid",
    duration: "6 Months",
    stipend: "₹80,000/month",
    skills: ["Java", "Python", "SQL", "REST APIs"],
    applyLink: "https://careers.google.com",
    status: "Active",
    description: commonDescription,
  },
  {
    title: "Cybersecurity Engineering Intern",
    company: "Google",
    location: "Bengaluru",
    mode: "Hybrid",
    duration: "6 Months",
    stipend: "₹85,000/month",
    skills: ["Python", "Cybersecurity", "Linux", "Networking"],
    applyLink: "https://careers.google.com",
    status: "Active",
    description: commonDescription,
  },
  {
    title: "Site Reliability Engineering Intern",
    company: "Google",
    location: "Bengaluru",
    mode: "Hybrid",
    duration: "6 Months",
    stipend: "₹82,000/month",
    skills: ["Linux", "Python", "Kubernetes", "Cloud"],
    applyLink: "https://careers.google.com",
    status: "Active",
    description: commonDescription,
  },
  {
    title: "Machine Learning Research Intern",
    company: "Google",
    location: "Bengaluru",
    mode: "Hybrid",
    duration: "6 Months",
    stipend: "₹90,000/month",
    skills: ["Python", "Machine Learning", "Deep Learning", "Algorithms"],
    applyLink: "https://careers.google.com",
    status: "Active",
    description: commonDescription,
  },
  {
    title: "Data Science Intern",
    company: "Google",
    location: "Bengaluru",
    mode: "Hybrid",
    duration: "6 Months",
    stipend: "₹75,000/month",
    skills: ["Python", "SQL", "Statistics", "Pandas"],
    applyLink: "https://careers.google.com",
    status: "Active",
    description: commonDescription,
  },
  {
    title: "UX Engineering Intern",
    company: "Google",
    location: "Bengaluru",
    mode: "Hybrid",
    duration: "6 Months",
    stipend: "₹70,000/month",
    skills: ["HTML", "CSS", "JavaScript", "React"],
    applyLink: "https://careers.google.com",
    status: "Active",
    description: commonDescription,
  },
  {
    title: "Cloud AI Engineering Intern",
    company: "Google",
    location: "Hyderabad",
    mode: "Hybrid",
    duration: "6 Months",
    stipend: "₹85,000/month",
    skills: ["Python", "AI", "Google Cloud", "APIs"],
    applyLink: "https://careers.google.com",
    status: "Active",
    description: commonDescription,
  },
  {
    title: "Software Systems Intern",
    company: "Google",
    location: "Bengaluru",
    mode: "Hybrid",
    duration: "6 Months",
    stipend: "₹80,000/month",
    skills: ["C++", "Linux", "Algorithms", "Systems"],
    applyLink: "https://careers.google.com",
    status: "Active",
    description: commonDescription,
  },
];

async function seedGoogleInternships() {
  console.log("==================================================");
  console.log("    SEEDING GOOGLE DEMO INTERNSHIPS (PREPAI)      ");
  console.log("==================================================");

  let addedCount = 0;
  let skippedCount = 0;

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    // Find the recruiter user to attach recruiter-side demo postings
    const recruiter =
      (await User.findOne({ role: "recruiter" })) ||
      (await User.findOne({ email: "mogalichandu4@gmail.com" }));

    const recruiterId = recruiter ? recruiter._id : null;
    console.log(
      `Associating postings with Recruiter: ${recruiter?.name || "None"} (${
        recruiter?.companyName || "Google"
      }) [ID: ${recruiterId}]`
    );

    for (const item of googleInternshipsData) {
      // Reliable unique combination: company + title + location (case-insensitive)
      const existing = await Internship.findOne({
        company: new RegExp(`^${item.company.trim()}$`, "i"),
        title: new RegExp(`^${item.title.trim()}$`, "i"),
        location: new RegExp(`^${item.location.trim()}$`, "i"),
      });

      if (existing) {
        console.log(
          `[SKIPPED] Already exists: "${item.title}" at ${item.company} (${item.location}) - ID: ${existing._id}`
        );
        skippedCount++;
      } else {
        const created = await Internship.create({
          company: item.company,
          title: item.title,
          location: item.location,
          mode: item.mode,
          duration: item.duration,
          stipend: item.stipend,
          skills: item.skills,
          applyLink: item.applyLink,
          status: item.status,
          description: item.description,
          postedBy: recruiterId,
        });

        console.log(
          `[ADDED] Created: "${created.title}" at ${created.company} (${created.location}) - ID: ${created._id}`
        );
        addedCount++;
      }
    }

    console.log("\n==================================================");
    console.log("               SEEDING SUMMARY                    ");
    console.log("==================================================");
    console.log(`Number of Google internships added:               ${addedCount}`);
    console.log(`Number skipped because they already existed:      ${skippedCount}`);
    console.log(`Total target Google demo records:                 ${googleInternshipsData.length}`);

    // Verify all Google internships currently in database
    const totalGoogleJobs = await Internship.find({
      company: new RegExp("^Google$", "i"),
    });
    console.log(`Total Google internships now in database:         ${totalGoogleJobs.length}`);
    console.log("==================================================");

    await mongoose.disconnect();
    console.log("Database disconnected.");

    return {
      addedCount,
      skippedCount,
      totalCount: googleInternshipsData.length,
      totalInDb: totalGoogleJobs.length,
    };
  } catch (err) {
    console.error("Error seeding Google internships:", err);
    process.exit(1);
  }
}

if (require.main === module) {
  seedGoogleInternships();
}

module.exports = {
  seedGoogleInternships,
  googleInternshipsData,
};
