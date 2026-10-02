require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Internship = require("./models/Internship");
const Application = require("./models/Application");

async function testDemoApplicants() {
  console.log("==================================================");
  console.log("   VERIFYING DEMO APPLICANTS FOR RECRUITER POSTING");
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

    // 1. Find recruiter internship
    const recruiterInternships = await Internship.find({ postedBy: { $ne: null } });
    assert(recruiterInternships.length > 0, `Found ${recruiterInternships.length} recruiter-posted internship(s)`);

    const targetJob = recruiterInternships.find(
      (job) => job.title.toLowerCase().includes("ai") || job.company.toLowerCase().includes("google")
    ) || recruiterInternships[0];
    assert(!!targetJob, `Target recruiter internship identified: "${targetJob?.title}" at "${targetJob?.company}"`);

    // 2. Fetch applicants with student population
    const applications = await Application.find({ internship: targetJob._id })
      .populate("student", "name email college degree branch year skills concepts goal bio")
      .sort({ createdAt: -1 });

    assert(
      applications.length >= 10 && applications.length <= 20,
      `Applicant count is within desired demo range (Found: ${applications.length}, expected: 10-15)`
    );

    // 3. Verify status variety
    const statusCounts = { Applied: 0, Reviewing: 0, Shortlisted: 0, Rejected: 0 };
    applications.forEach((app) => {
      if (statusCounts[app.status] !== undefined) {
        statusCounts[app.status]++;
      }
    });

    console.log("\nApplicant Status Breakdown:", statusCounts);
    assert(statusCounts.Applied > 0, `Status 'Applied' has ${statusCounts.Applied} candidate(s)`);
    assert(statusCounts.Reviewing > 0, `Status 'Reviewing' has ${statusCounts.Reviewing} candidate(s)`);
    assert(statusCounts.Shortlisted > 0, `Status 'Shortlisted' has ${statusCounts.Shortlisted} candidate(s)`);
    assert(statusCounts.Rejected > 0, `Status 'Rejected' has ${statusCounts.Rejected} candidate(s)`);

    // 4. Verify candidate fields realism
    let validStudentProfiles = 0;
    applications.forEach((app) => {
      const student = app.student;
      if (
        student &&
        student.name &&
        student.email &&
        student.college &&
        Array.isArray(student.skills) &&
        student.skills.length > 0
      ) {
        validStudentProfiles++;
      }
    });
    assert(
      validStudentProfiles === applications.length,
      `All ${applications.length} applications have fully populated student profiles (name, email, college, skills)`
    );

    // 5. Verify real student is preserved
    const realStudentApp = applications.find(
      (app) => app.student?.email === "mogalilakshmichandu3@gmail.com"
    );
    assert(!!realStudentApp, `Real student application (mogalilakshmichandu3@gmail.com) is intact`);

    // 6. Verify recruiter ownership relation
    const allBelongToRecruiter = applications.every(
      (app) => app.recruiter?.toString() === targetJob.postedBy?.toString()
    );
    assert(allBelongToRecruiter, `All applications correctly map to recruiter ID: ${targetJob.postedBy}`);

    // Summary
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

testDemoApplicants();
