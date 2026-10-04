require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Internship = require("./models/Internship");
const Application = require("./models/Application");

const {
  applyToInternship,
  getStudentApplications,
  withdrawApplication,
  updateApplicationStatus,
} = require("./controllers/applicationController");

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
  console.log("   PHASE 4.4 AUTOMATED VERIFICATION SUITE  ");
  console.log("==========================================");

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  // Clean up any old test records
  await Application.deleteMany({
    $or: [
      { "student.email": /test_p44_/ },
      { "recruiter.email": /test_p44_/ },
    ],
  });
  await Internship.deleteMany({ company: "Nova Labs P44" });
  await User.deleteMany({ email: /test_p44_/ });

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
    // 1. Setup Test Users: 1 Recruiter, 2 Students
    const recruiter = await User.create({
      name: "Marcus Vance",
      email: "test_p44_recruiter@example.com",
      password: "password123",
      role: "recruiter",
      companyName: "Nova Labs P44",
      designation: "Senior Technical Talent Lead",
    });

    const student1 = await User.create({
      name: "Alice Walker",
      email: "test_p44_alice@example.com",
      password: "password123",
      role: "student",
      college: "Stanford University",
      skills: ["React", "Node.js", "TypeScript"],
    });

    const student2 = await User.create({
      name: "Bob Stone",
      email: "test_p44_bob@example.com",
      password: "password123",
      role: "student",
      college: "Berkeley",
      skills: ["Python", "Docker"],
    });

    // 2. Setup Test Recruiter Internship
    const internship = await Internship.create({
      title: "Full Stack Engineer Intern",
      company: "Nova Labs P44",
      location: "San Francisco, CA",
      mode: "Hybrid",
      duration: "3 Months",
      stipend: "$4,500/month",
      skills: ["React", "Node.js", "MongoDB"],
      description: "Exciting opportunity to build real-time web products.",
      status: "Active",
      postedBy: recruiter._id,
      applyLink: "https://novalabs.io/careers/fullstack-intern",
    });

    console.log("\n--- TEST GROUP 1: RBAC & Role Authorization ---");

    // Recruiter trying to access student endpoint should be rejected by authorizeRole
    let rbacPassed = false;
    const rbacReq = { user: { id: recruiter._id.toString(), role: "recruiter" } };
    const rbacRes = {
      status(code) {
        if (code === 403) rbacPassed = true;
        return this;
      },
      json() {},
    };
    const rbacMiddleware = authorizeRole("student");
    rbacMiddleware(rbacReq, rbacRes, () => {
      rbacPassed = false;
    });
    assert(
      rbacPassed,
      "RBAC: Recruiter is blocked with 403 from student application endpoints",
      "Expected status 403"
    );

    // Student permitted by student authorizeRole
    let studentAllowed = false;
    const studentRbacReq = { user: { id: student1._id.toString(), role: "student" } };
    rbacMiddleware(studentRbacReq, {}, () => {
      studentAllowed = true;
    });
    assert(
      studentAllowed,
      "RBAC: Student is allowed through student application endpoints",
      "Expected next() to be called"
    );

    console.log("\n--- TEST GROUP 2: Application Submission & Initial Fetch ---");

    // Student 1 applies to Nova Labs internship
    const applyMock = createMockReqRes({
      user: { id: student1._id.toString(), role: "student" },
      params: { internshipId: internship._id.toString() },
    });
    await applyToInternship(applyMock.req, applyMock.res);
    assert(
      applyMock.res.getStatusCode() === 201,
      "Apply: Student successfully submits application to recruiter opening (status 201)",
      JSON.stringify(applyMock.res.getData())
    );

    // Student 1 fetches applications list
    const getAppsMock = createMockReqRes({
      user: { id: student1._id.toString(), role: "student" },
    });
    await getStudentApplications(getAppsMock.req, getAppsMock.res);
    const studentApps = getAppsMock.res.getData();

    assert(
      getAppsMock.res.getStatusCode() === 200 && Array.isArray(studentApps) && studentApps.length === 1,
      "Get Applications: Student retrieves their submitted applications array",
      `Expected array of 1, got ${studentApps?.length}`
    );

    const appRecord = studentApps[0];

    assert(
      appRecord.status === "Applied",
      "Tracking: Initial application status is 'Applied'",
      `Status was ${appRecord?.status}`
    );

    assert(
      appRecord.internship &&
        appRecord.internship.title === "Full Stack Engineer Intern" &&
        appRecord.internship.company === "Nova Labs P44" &&
        appRecord.internship.location === "San Francisco, CA" &&
        appRecord.internship.mode === "Hybrid" &&
        appRecord.internship.stipend === "$4,500/month",
      "Populate: Internship details are populated correctly for student tracking card",
      JSON.stringify(appRecord?.internship)
    );

    assert(
      appRecord.recruiter &&
        appRecord.recruiter.name === "Marcus Vance" &&
        appRecord.recruiter.companyName === "Nova Labs P44" &&
        appRecord.recruiter.designation === "Senior Technical Talent Lead" &&
        !appRecord.recruiter.password,
      "Populate: Recruiter details are populated without exposing sensitive fields (password)",
      JSON.stringify(appRecord?.recruiter)
    );

    console.log("\n--- TEST GROUP 3: Real-Time Status Tracking Across Lifecycle ---");

    // Step A: Recruiter changes status to "Reviewing"
    const updateReviewMock = createMockReqRes({
      user: { id: recruiter._id.toString(), role: "recruiter" },
      params: { applicationId: appRecord._id.toString() },
      body: { status: "Reviewing" },
    });
    await updateApplicationStatus(updateReviewMock.req, updateReviewMock.res);
    assert(
      updateReviewMock.res.getStatusCode() === 200,
      "Status Update: Recruiter updates application status to 'Reviewing'",
      JSON.stringify(updateReviewMock.res.getData())
    );

    // Student 1 fetches applications again
    const getAppsReviewMock = createMockReqRes({
      user: { id: student1._id.toString(), role: "student" },
    });
    await getStudentApplications(getAppsReviewMock.req, getAppsReviewMock.res);
    const updatedReviewApps = getAppsReviewMock.res.getData();
    assert(
      updatedReviewApps[0].status === "Reviewing",
      "Tracking: Student application reflects updated status 'Reviewing'",
      `Status was ${updatedReviewApps[0]?.status}`
    );

    // Step B: Recruiter changes status to "Shortlisted"
    const updateShortlistMock = createMockReqRes({
      user: { id: recruiter._id.toString(), role: "recruiter" },
      params: { applicationId: appRecord._id.toString() },
      body: { status: "Shortlisted" },
    });
    await updateApplicationStatus(updateShortlistMock.req, updateShortlistMock.res);
    assert(
      updateShortlistMock.res.getStatusCode() === 200,
      "Status Update: Recruiter updates application status to 'Shortlisted'",
      JSON.stringify(updateShortlistMock.res.getData())
    );

    // Student 1 fetches applications again
    const getAppsShortlistMock = createMockReqRes({
      user: { id: student1._id.toString(), role: "student" },
    });
    await getStudentApplications(getAppsShortlistMock.req, getAppsShortlistMock.res);
    const updatedShortlistApps = getAppsShortlistMock.res.getData();
    assert(
      updatedShortlistApps[0].status === "Shortlisted",
      "Tracking: Student application reflects updated status 'Shortlisted' with celebration eligibility",
      `Status was ${updatedShortlistApps[0]?.status}`
    );

    console.log("\n--- TEST GROUP 4: Application Withdrawal & Security ---");

    // Student 2 attempts to withdraw Student 1's application (Security Check)
    const unauthorizedWithdrawMock = createMockReqRes({
      user: { id: student2._id.toString(), role: "student" },
      params: { applicationId: appRecord._id.toString() },
    });
    await withdrawApplication(unauthorizedWithdrawMock.req, unauthorizedWithdrawMock.res);
    assert(
      unauthorizedWithdrawMock.res.getStatusCode() === 403,
      "Security: Non-owner student is blocked with 403 when attempting to withdraw another student's application",
      JSON.stringify(unauthorizedWithdrawMock.res.getData())
    );

    // Verify application still exists
    const appStillExists = await Application.findById(appRecord._id);
    assert(
      Boolean(appStillExists),
      "Security: Application was not deleted by unauthorized attempt",
      "Application should still exist in database"
    );

    // Student 1 withdraws their own application
    const validWithdrawMock = createMockReqRes({
      user: { id: student1._id.toString(), role: "student" },
      params: { applicationId: appRecord._id.toString() },
    });
    await withdrawApplication(validWithdrawMock.req, validWithdrawMock.res);
    assert(
      validWithdrawMock.res.getStatusCode() === 200,
      "Withdrawal: Student successfully withdraws their own application (status 200)",
      JSON.stringify(validWithdrawMock.res.getData())
    );

    // Verify application is removed from database
    const appAfterWithdraw = await Application.findById(appRecord._id);
    assert(
      appAfterWithdraw === null,
      "Withdrawal: Application record is deleted from MongoDB",
      "Application should be null"
    );

    // Student 1 fetches applications again -> should be empty
    const getAppsEmptyMock = createMockReqRes({
      user: { id: student1._id.toString(), role: "student" },
    });
    await getStudentApplications(getAppsEmptyMock.req, getAppsEmptyMock.res);
    const emptyApps = getAppsEmptyMock.res.getData();
    assert(
      emptyApps.length === 0,
      "Withdrawal: Student application list is now empty after withdrawal",
      `Expected 0, got ${emptyApps.length}`
    );

    // Re-apply verification: Student 1 can re-apply to the internship after withdrawal
    const reapplyMock = createMockReqRes({
      user: { id: student1._id.toString(), role: "student" },
      params: { internshipId: internship._id.toString() },
    });
    await applyToInternship(reapplyMock.req, reapplyMock.res);
    assert(
      reapplyMock.res.getStatusCode() === 201,
      "Re-application: Student can successfully re-apply to the internship after withdrawing",
      JSON.stringify(reapplyMock.res.getData())
    );

  } catch (err) {
    console.error("Test execution threw error:", err);
    testsFailed++;
  } finally {
    // Cleanup
    await Application.deleteMany({
      $or: [
        { "student.email": /test_p44_/ },
        { "recruiter.email": /test_p44_/ },
      ],
    });
    await Internship.deleteMany({ company: "Nova Labs P44" });
    await User.deleteMany({ email: /test_p44_/ });
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
