require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Internship = require("./models/Internship");
const Application = require("./models/Application");

async function testDemoApplicants() {
  console.log("==================================================");
  console.log("   VERIFYING DEMO APPLICANTS ACROSS ALL POSTINGS  ");
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

    // 1. Find recruiter internships
    const recruiterInternships = await Internship.find({ postedBy: { $ne: null } });
    assert(recruiterInternships.length >= 15, `Found ${recruiterInternships.length} recruiter-posted internship(s)`);

    const targetJob = recruiterInternships.find(
      (job) => job.title.toLowerCase().includes("ai") || job.company.toLowerCase().includes("google")
    ) || recruiterInternships[0];
    assert(!!targetJob, `Target recruiter internship identified: "${targetJob?.title}" at "${targetJob?.company}"`);

    // 2. Fetch applicants for target job with student population
    const targetApplications = await Application.find({ internship: targetJob._id })
      .populate("student", "name email college degree branch year skills concepts goal bio")
      .sort({ createdAt: -1 });

    assert(
      targetApplications.length >= 10 && targetApplications.length <= 20,
      `Target applicant count is within desired demo range (Found: ${targetApplications.length}, expected: 10-15)`
    );

    // 3. Verify status variety for target job
    const statusCounts = { Applied: 0, Reviewing: 0, Shortlisted: 0, Rejected: 0 };
    targetApplications.forEach((app) => {
      if (statusCounts[app.status] !== undefined) {
        statusCounts[app.status]++;
      }
    });

    console.log("\nApplicant Status Breakdown for target job:", statusCounts);
    assert(statusCounts.Applied > 0, `Status 'Applied' has ${statusCounts.Applied} candidate(s)`);
    assert(statusCounts.Reviewing > 0, `Status 'Reviewing' has ${statusCounts.Reviewing} candidate(s)`);
    assert(statusCounts.Shortlisted > 0, `Status 'Shortlisted' has ${statusCounts.Shortlisted} candidate(s)`);
    assert(statusCounts.Rejected > 0, `Status 'Rejected' has ${statusCounts.Rejected} candidate(s)`);

    // 4. Verify candidate fields realism
    let validStudentProfiles = 0;
    targetApplications.forEach((app) => {
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
      validStudentProfiles === targetApplications.length,
      `All ${targetApplications.length} applications have fully populated student profiles (name, email, college, skills)`
    );

    // 5. Verify real student is preserved
    const realStudentApp = targetApplications.find(
      (app) => app.student?.email === "mogalilakshmichandu3@gmail.com"
    );
    assert(!!realStudentApp, `Real student application (mogalilakshmichandu3@gmail.com) is intact`);

    // 6. Verify recruiter ownership relation
    const allBelongToRecruiter = targetApplications.every(
      (app) => app.recruiter?.toString() === targetJob.postedBy?.toString()
    );
    assert(allBelongToRecruiter, `All target applications correctly map to recruiter ID: ${targetJob.postedBy}`);

    // 7. Verify EVERY internship in MongoDB has at least 3 applicants
    const allInternships = await Internship.find();
    let allMeetMinimum = true;
    let minApplicants = Infinity;
    let maxApplicants = 0;

    for (const job of allInternships) {
      const apps = await Application.find({ internship: job._id });
      if (apps.length < 3) {
        allMeetMinimum = false;
        console.error(`[UNDERFLOW] Internship "${job.title}" has only ${apps.length} applicants!`);
      }
      if (apps.length < minApplicants) minApplicants = apps.length;
      if (apps.length > maxApplicants) maxApplicants = apps.length;
    }

    assert(
      allMeetMinimum,
      `Every internship in database (${allInternships.length} total) has at least 3 applicants (Min: ${minApplicants}, Max: ${maxApplicants})`
    );

    // 8. Verify EVERY recruiter posting has applicantCount > 0
    let allRecruiterJobsHaveApplicants = true;
    for (const job of recruiterInternships) {
      const count = await Application.countDocuments({ internship: job._id });
      if (count === 0) {
        allRecruiterJobsHaveApplicants = false;
        console.error(`[ZERO APPLICANTS] Recruiter job "${job.title}" has 0 applicants!`);
      }
    }

    assert(
      allRecruiterJobsHaveApplicants,
      `All ${recruiterInternships.length} recruiter postings have applicantCount > 0`
    );

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
