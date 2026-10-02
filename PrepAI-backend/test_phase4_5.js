require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Internship = require("./models/Internship");
const Application = require("./models/Application");

const {
  applyToInternship,
  getRecruiterAnalytics,
  updateApplicationStatus,
} = require("./controllers/applicationController");

const {
  getRecruiterInternships,
} = require("./controllers/internshipController");

const { authorizeRole } = require("./middleware/authMiddleware");

function createMockReqRes({ user, params = {}, body = {} }) {
  const req = {
    user,
    params,
    body,
  };

  let statusCode = 200;
  let responseData = null;

  const res = {
    status(code) {
      statusCode = code;
      return res;
    },
    json(data) {
      responseData = data;
      return res;
    },
    send(data) {
      responseData = data;
      return res;
    },
    getStatusCode: () => statusCode,
    getData: () => responseData,
  };

  return { req, res };
}

async function runTests() {
  console.log("==========================================");
  console.log("   PHASE 4.5 AUTOMATED VERIFICATION SUITE  ");
  console.log("==========================================");

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  // Clean up previous test artifacts
  const oldUsers = await User.find({ email: /test_p45_/ });
  const oldUserIds = oldUsers.map((u) => u._id);
  await Application.deleteMany({
    $or: [
      { student: { $in: oldUserIds } },
      { recruiter: { $in: oldUserIds } },
    ],
  });
  await Internship.deleteMany({
    company: { $in: ["Apex Innovations P45", "Zenith Systems P45"] },
  });
  await User.deleteMany({ email: /test_p45_/ });

  let testsPassed = 0;
  let testsFailed = 0;

  function assert(condition, testName, details = "") {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      testsPassed++;
    } else {
      console.error(`[FAIL] ${testName} - ${details}`);
      testsFailed++;
    }
  }

  try {
    // 1. Setup Test Users
    const recruiterA = await User.create({
      name: "Arthur Pendelton",
      email: "test_p45_recruiterA@example.com",
      password: "password123",
      role: "recruiter",
      companyName: "Apex Innovations P45",
      designation: "Talent Director",
    });

    const recruiterB = await User.create({
      name: "Beatrice Bell",
      email: "test_p45_recruiterB@example.com",
      password: "password123",
      role: "recruiter",
      companyName: "Zenith Systems P45",
      designation: "Lead Recruiter",
    });

    const student1 = await User.create({
      name: "Clara Oswald",
      email: "test_p45_clara@example.com",
      password: "password123",
      role: "student",
      college: "MIT",
      degree: "B.Tech",
      branch: "CSE",
      skills: ["React", "Node.js"],
    });

    const student2 = await User.create({
      name: "David Tennant",
      email: "test_p45_david@example.com",
      password: "password123",
      role: "student",
      college: "Oxford",
      degree: "B.Sc",
      branch: "CS",
      skills: ["Python", "Machine Learning"],
    });

    const student3 = await User.create({
      name: "Eleanor Vance",
      email: "test_p45_eleanor@example.com",
      password: "password123",
      role: "student",
      college: "Caltech",
      degree: "B.Tech",
      branch: "ECE",
      skills: ["C++", "Embedded Systems"],
    });

    // 2. Setup Postings: Recruiter A has 1 active and 1 closed; Recruiter B has 1 active
    const jobA1 = await Internship.create({
      title: "Frontend Developer Intern",
      company: "Apex Innovations P45",
      location: "San Jose, CA",
      mode: "Remote",
      stipend: "$3,500/mo",
      duration: "3 Months",
      skills: ["React", "JavaScript"],
      status: "Active",
      postedBy: recruiterA._id,
      applyLink: "https://apex.io/careers/frontend",
    });

    const jobA2 = await Internship.create({
      title: "DevOps Engineer Intern",
      company: "Apex Innovations P45",
      location: "San Jose, CA",
      mode: "Hybrid",
      stipend: "$4,000/mo",
      duration: "6 Months",
      skills: ["Docker", "Kubernetes"],
      status: "Closed",
      postedBy: recruiterA._id,
      applyLink: "https://apex.io/careers/devops",
    });

    const jobB1 = await Internship.create({
      title: "Backend Engineer Intern",
      company: "Zenith Systems P45",
      location: "New York, NY",
      mode: "Onsite",
      stipend: "$5,000/mo",
      duration: "4 Months",
      skills: ["Go", "Distributed Systems"],
      status: "Active",
      postedBy: recruiterB._id,
      applyLink: "https://zenith.io/careers/backend",
    });

    console.log("\n--- TEST GROUP 1: RBAC & Authorization ---");

    // Student blocked from recruiter analytics
    let studentBlocked = false;
    const studentRbacReq = { user: { id: student1._id.toString(), role: "student" } };
    const studentRbacRes = {
      status(code) {
        if (code === 403) studentBlocked = true;
        return this;
      },
      json() {},
    };
    const recruiterRbac = authorizeRole("recruiter");
    recruiterRbac(studentRbacReq, studentRbacRes, () => {
      studentBlocked = false;
    });
    assert(
      studentBlocked,
      "RBAC: Student role is blocked with 403 from recruiter analytics endpoint",
      "Expected status 403"
    );

    // Recruiter allowed through
    let recruiterAllowed = false;
    const recruiterRbacReq = { user: { id: recruiterA._id.toString(), role: "recruiter" } };
    recruiterRbac(recruiterRbacReq, {}, () => {
      recruiterAllowed = true;
    });
    assert(
      recruiterAllowed,
      "RBAC: Recruiter role is authorized to access analytics",
      "Expected next() to be called"
    );

    console.log("\n--- TEST GROUP 2: Applications Setup & Status Transitions ---");

    // Student 1 applies to Job A1
    const applyMock1 = createMockReqRes({
      user: { id: student1._id.toString(), role: "student" },
      params: { internshipId: jobA1._id.toString() },
    });
    await applyToInternship(applyMock1.req, applyMock1.res);
    assert(applyMock1.res.getStatusCode() === 201, "Application 1 submitted (status Applied)");

    // Student 2 applies to Job A1
    const applyMock2 = createMockReqRes({
      user: { id: student2._id.toString(), role: "student" },
      params: { internshipId: jobA1._id.toString() },
    });
    await applyToInternship(applyMock2.req, applyMock2.res);
    assert(applyMock2.res.getStatusCode() === 201, "Application 2 submitted (status Applied)");

    // Recruiter A updates Student 2 application status to 'Reviewing'
    const app2Id = applyMock2.res.getData().application._id.toString();
    const updateReviewMock = createMockReqRes({
      user: { id: recruiterA._id.toString(), role: "recruiter" },
      params: { applicationId: app2Id },
      body: { status: "Reviewing" },
    });
    await updateApplicationStatus(updateReviewMock.req, updateReviewMock.res);
    assert(updateReviewMock.res.getStatusCode() === 200, "Application 2 updated to 'Reviewing'");

    // Student 3 applies to Job A1
    const applyMock3 = createMockReqRes({
      user: { id: student3._id.toString(), role: "student" },
      params: { internshipId: jobA1._id.toString() },
    });
    await applyToInternship(applyMock3.req, applyMock3.res);
    assert(applyMock3.res.getStatusCode() === 201, "Application 3 submitted (status Applied)");

    // Recruiter A updates Student 3 application status to 'Shortlisted'
    const app3Id = applyMock3.res.getData().application._id.toString();
    const updateShortlistMock = createMockReqRes({
      user: { id: recruiterA._id.toString(), role: "recruiter" },
      params: { applicationId: app3Id },
      body: { status: "Shortlisted" },
    });
    await updateApplicationStatus(updateShortlistMock.req, updateShortlistMock.res);
    assert(updateShortlistMock.res.getStatusCode() === 200, "Application 3 updated to 'Shortlisted'");

    // Student 1 also applies to Recruiter B's Job B1
    const applyMockB = createMockReqRes({
      user: { id: student1._id.toString(), role: "student" },
      params: { internshipId: jobB1._id.toString() },
    });
    await applyToInternship(applyMockB.req, applyMockB.res);
    assert(applyMockB.res.getStatusCode() === 201, "Application to Job B1 submitted for Recruiter B");

    console.log("\n--- TEST GROUP 3: Recruiter Analytics Endpoint Verification ---");

    // Recruiter A calls getRecruiterAnalytics
    const analyticsMockA = createMockReqRes({
      user: { id: recruiterA._id.toString(), role: "recruiter" },
    });
    await getRecruiterAnalytics(analyticsMockA.req, analyticsMockA.res);
    const dataA = analyticsMockA.res.getData();

    assert(
      analyticsMockA.res.getStatusCode() === 200,
      "Analytics: Recruiter A receives 200 OK from analytics endpoint",
      `Status code was ${analyticsMockA.res.getStatusCode()}`
    );

    assert(
      dataA && dataA.metrics && dataA.metrics.totalPostings === 2,
      "Metrics: Total postings count is accurate (2 postings)",
      `Expected 2, got ${dataA?.metrics?.totalPostings}`
    );

    assert(
      dataA.metrics.activePostings === 1 && dataA.metrics.closedPostings === 1,
      "Metrics: Active (1) and Closed (1) postings distribution is accurate",
      JSON.stringify(dataA?.metrics)
    );

    assert(
      dataA.metrics.totalApplicants === 3,
      "Metrics: Total applicants count is strictly scoped to Recruiter A (3 applicants)",
      `Expected 3, got ${dataA?.metrics?.totalApplicants}`
    );

    assert(
      dataA.metrics.statusCounts &&
        dataA.metrics.statusCounts.Applied === 1 &&
        dataA.metrics.statusCounts.Reviewing === 1 &&
        dataA.metrics.statusCounts.Shortlisted === 1 &&
        dataA.metrics.statusCounts.Rejected === 0,
      "Metrics: Status breakdown is accurate (1 Applied, 1 Reviewing, 1 Shortlisted, 0 Rejected)",
      JSON.stringify(dataA?.metrics?.statusCounts)
    );

    assert(
      Array.isArray(dataA.postingsBreakdown) && dataA.postingsBreakdown.length === 2,
      "Breakdown: Per-posting breakdown contains both recruiter postings",
      `Length was ${dataA?.postingsBreakdown?.length}`
    );

    const jobA1Breakdown = dataA.postingsBreakdown.find((p) => p._id.toString() === jobA1._id.toString());
    assert(
      jobA1Breakdown &&
        jobA1Breakdown.applicantCount === 3 &&
        jobA1Breakdown.statusCounts.Applied === 1 &&
        jobA1Breakdown.statusCounts.Reviewing === 1 &&
        jobA1Breakdown.statusCounts.Shortlisted === 1,
      "Breakdown: Job A1 breakdown reflects 3 applicants with exact status counts",
      JSON.stringify(jobA1Breakdown)
    );

    assert(
      Array.isArray(dataA.recentApplications) && dataA.recentApplications.length === 3,
      "Recent Activity: Returns 3 recent applications stream",
      `Length was ${dataA?.recentApplications?.length}`
    );

    assert(
      dataA.recentApplications[0].student &&
        dataA.recentApplications[0].student.name &&
        dataA.recentApplications[0].internship &&
        dataA.recentApplications[0].internship.title,
      "Recent Activity: Applications are properly populated with student and internship info",
      JSON.stringify(dataA?.recentApplications[0])
    );

    console.log("\n--- TEST GROUP 4: Data Isolation & Recruiter B Check ---");

    // Recruiter B calls getRecruiterAnalytics
    const analyticsMockB = createMockReqRes({
      user: { id: recruiterB._id.toString(), role: "recruiter" },
    });
    await getRecruiterAnalytics(analyticsMockB.req, analyticsMockB.res);
    const dataB = analyticsMockB.res.getData();

    assert(
      dataB.metrics.totalPostings === 1 && dataB.metrics.totalApplicants === 1,
      "Isolation: Recruiter B only sees their 1 posting and 1 applicant, completely isolated from Recruiter A",
      JSON.stringify(dataB?.metrics)
    );

    console.log("\n--- TEST GROUP 5: Enriched getRecruiterInternships Verification ---");

    // Recruiter A calls getRecruiterInternships
    const postingsMockA = createMockReqRes({
      user: { id: recruiterA._id.toString(), role: "recruiter" },
    });
    await getRecruiterInternships(postingsMockA.req, postingsMockA.res);
    const postingsDataA = postingsMockA.res.getData();

    assert(
      postingsMockA.res.getStatusCode() === 200 && Array.isArray(postingsDataA) && postingsDataA.length === 2,
      "Postings: getRecruiterInternships returns 2 postings for Recruiter A",
      `Length was ${postingsDataA?.length}`
    );

    const activeJobPosting = postingsDataA.find((p) => p._id.toString() === jobA1._id.toString());
    assert(
      activeJobPosting &&
        activeJobPosting.applicantCount === 3 &&
        activeJobPosting.statusCounts &&
        activeJobPosting.statusCounts.Shortlisted === 1,
      "Enrichment: Active posting has applicantCount (3) and statusCounts attached",
      JSON.stringify(activeJobPosting)
    );

  } catch (err) {
    console.error("Test execution threw error:", err);
    testsFailed++;
  } finally {
    // Cleanup test data
    const p45Users = await User.find({ email: /test_p45_/ });
    const p45UserIds = p45Users.map((u) => u._id);
    await Application.deleteMany({
      $or: [
        { student: { $in: p45UserIds } },
        { recruiter: { $in: p45UserIds } },
      ],
    });
    await Internship.deleteMany({
      company: { $in: ["Apex Innovations P45", "Zenith Systems P45"] },
    });
    await User.deleteMany({ email: /test_p45_/ });
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");

    console.log("\n==========================================");
    console.log(`TEST RESULTS: ${testsPassed} PASSED, ${testsFailed} FAILED`);
    console.log("==========================================");

    if (testsFailed > 0) {
      process.exit(1);
    }
  }
}

runTests();
