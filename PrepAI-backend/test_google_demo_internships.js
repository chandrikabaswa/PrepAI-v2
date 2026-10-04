require("dotenv").config();
const mongoose = require("mongoose");
const Internship = require("./models/Internship");
const User = require("./models/User");
const { googleInternshipsData } = require("./seed_google_demo_internships");

async function testGoogleDemoInternships() {
  console.log("==================================================");
  console.log("  VERIFYING GOOGLE DEMO INTERNSHIPS (RECRUITER & STUDENT)");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.\n");

    // 1. Recruiter user verification
    const recruiter =
      (await User.findOne({ role: "recruiter" })) ||
      (await User.findOne({ email: "mogalichandu4@gmail.com" }));

    assert(!!recruiter, `Recruiter account found: ${recruiter?.name} (${recruiter?.email})`);

    // 2. Verify all 15 target Google roles exist in the database
    let foundCount = 0;
    for (const target of googleInternshipsData) {
      const match = await Internship.findOne({
        company: new RegExp(`^${target.company}$`, "i"),
        title: new RegExp(`^${target.title}$`, "i"),
        location: new RegExp(`^${target.location}$`, "i"),
      });

      if (match) {
        foundCount++;
      } else {
        console.error(`[MISSING] Target internship not found: ${target.title} (${target.location})`);
      }
    }

    assert(
      foundCount === 15,
      `All 15 Google demo internships exist in database (Found ${foundCount}/15)`
    );

    // 3. Verify recruiter Manage Postings query (postedBy: recruiter._id)
    const recruiterPostings = await Internship.find({ postedBy: recruiter._id });
    assert(
      recruiterPostings.length >= 15,
      `Recruiter has at least 15 postings in Manage Internships (Found: ${recruiterPostings.length})`
    );

    // 4. Verify fields compliance for all 15 Google demo internships
    let validFieldsCount = 0;
    for (const target of googleInternshipsData) {
      const job = await Internship.findOne({
        company: new RegExp(`^${target.company}$`, "i"),
        title: new RegExp(`^${target.title}$`, "i"),
        location: new RegExp(`^${target.location}$`, "i"),
      });

      if (
        job &&
        job.mode === "Hybrid" &&
        job.duration === "6 Months" &&
        job.stipend &&
        job.status === "Active" &&
        Array.isArray(job.skills) &&
        job.skills.length >= 3 &&
        job.description &&
        job.applyLink
      ) {
        validFieldsCount++;
      }
    }

    assert(
      validFieldsCount === 15,
      `All 15 Google internships have valid fields (Hybrid mode, 6 Months duration, stipend, skills, description, applyLink)`
    );

    // 5. Verify Student visibility query: Internship.find({ status: { $ne: "Closed" } })
    const studentVisibleJobs = await Internship.find({ status: { $ne: "Closed" } });
    assert(
      studentVisibleJobs.length >= 35,
      `Student internship browsing query returns >= 35 active opportunities (Found: ${studentVisibleJobs.length})`
    );

    // 6. Verify duplicate prevention: Ensure unique (company + title + location)
    const allGoogleJobs = await Internship.find({ company: new RegExp("^Google$", "i") });
    const keys = new Set();
    let hasDuplicate = false;

    for (const job of allGoogleJobs) {
      const key = `${job.company.toLowerCase()}|${job.title.toLowerCase()}|${job.location.toLowerCase()}`;
      if (keys.has(key)) {
        hasDuplicate = true;
        console.error(`[DUPLICATE DETECTED] Key: ${key}`);
      }
      keys.add(key);
    }

    assert(!hasDuplicate, `Zero duplicates found across Google internships in database (Unique count: ${keys.size})`);

    // 7. Verify existing original Google AI/ML Intern posting is intact
    const originalJob = await Internship.findById("6abe6de661fc2d563ac0724a");
    assert(
      !!originalJob && originalJob.title === "AI/ML Intern",
      `Original Google recruiter internship (AI/ML Intern) remains completely intact`
    );

    console.log("\n==================================================");
    console.log(`TEST SUMMARY: ${passed} passed, ${failed} failed`);
    console.log("==================================================");

    await mongoose.disconnect();
    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error("Test execution error:", err);
    process.exit(1);
  }
}

testGoogleDemoInternships();
