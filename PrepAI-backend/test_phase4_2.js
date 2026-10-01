require("dotenv").config();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const Internship = require("./models/Internship");
const Application = require("./models/Application");

const {
  applyToInternship,
  getStudentApplications,
  getInternshipApplicants,
  updateApplicationStatus,
} = require("./controllers/applicationController");

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
  console.log("   PHASE 4.2 AUTOMATED VERIFICATION SUITE  ");
  console.log("==========================================");

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  // Cleanup past test data if exists
  await Application.deleteMany({
    $or: [
      { "student.email": /test_p42_/ },
      { "recruiter.email": /test_p42_/ },
    ],
  });
  await Internship.deleteMany({ company: "TestCorp P42" });
  await User.deleteMany({ email: /test_p42_/ });

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
    // 1. Create test users
    const studentUser = await User.create({
      name: "Alice Student",
      email: "test_p42_student@example.com",
      password: "password123",
      role: "student",
      college: "Stanford University",
      degree: "B.S.",
      branch: "Computer Science",
      year: "3rd Year",
      skills: ["React", "Node.js", "Python"],
    });

    const recruiter1 = await User.create({
      name: "Bob Recruiter",
      email: "test_p42_recruiter1@example.com",
      password: "password123",
      role: "recruiter",
      company: "TestCorp P42",
    });

    const recruiter2 = await User.create({
      name: "Carol Recruiter",
      email: "test_p42_recruiter2@example.com",
      password: "password123",
      role: "recruiter",
      company: "OtherCorp P42",
    });

    // 2. Create test internships
    const activeInternship = await Internship.create({
      title: "Frontend Engineering Intern",
      company: "TestCorp P42",
      location: "San Francisco, CA",
      mode: "Remote",
      duration: "3 Months",
      stipend: "$4,000/mo",
      skills: ["React", "JavaScript"],
      status: "Active",
      postedBy: recruiter1._id,
      applyLink: "https://testcorp.com/apply/frontend",
    });

    const closedInternship = await Internship.create({
      title: "Closed Backend Intern",
      company: "TestCorp P42",
      location: "New York, NY",
      mode: "Onsite",
      duration: "6 Months",
      stipend: "$5,000/mo",
      skills: ["Node.js"],
      status: "Closed",
      postedBy: recruiter1._id,
      applyLink: "https://testcorp.com/apply/closed-backend",
    });

    const seededInternship = await Internship.create({
      title: "Seeded Platform Intern",
      company: "TestCorp P42",
      location: "Remote",
      mode: "Remote",
      duration: "3 Months",
      stipend: "Unpaid",
      skills: ["Python"],
      status: "Active",
      postedBy: null,
      applyLink: "https://external.com/jobs/123",
    });

    // TEST 1: Student applying to Active recruiter internship
    {
      const { req, res } = createMockReqRes({
        user: { id: studentUser._id.toString(), role: "student" },
        params: { internshipId: activeInternship._id.toString() },
      });
      await applyToInternship(req, res);
      const status = res.getStatusCode();
      const data = res.getData();

      assert(
        status === 201 &&
          data.application &&
          data.application.status === "Applied" &&
          data.application.recruiter.toString() === recruiter1._id.toString(),
        "Test 1: Student can apply to an active recruiter-posted internship",
        `Got status ${status}, message: ${data?.message}`
      );
    }

    // TEST 2: Duplicate application protection
    {
      const { req, res } = createMockReqRes({
        user: { id: studentUser._id.toString(), role: "student" },
        params: { internshipId: activeInternship._id.toString() },
      });
      await applyToInternship(req, res);
      const status = res.getStatusCode();
      const data = res.getData();

      assert(
        status === 400 && data.message.includes("already applied"),
        "Test 2: Duplicate application blocked with 400 status",
        `Got status ${status}, message: ${data?.message}`
      );
    }

    // TEST 3: Applying to Closed internship blocked
    {
      const { req, res } = createMockReqRes({
        user: { id: studentUser._id.toString(), role: "student" },
        params: { internshipId: closedInternship._id.toString() },
      });
      await applyToInternship(req, res);
      const status = res.getStatusCode();
      const data = res.getData();

      assert(
        status === 400 && data.message.includes("closed"),
        "Test 3: Application to closed internship blocked with 400",
        `Got status ${status}, message: ${data?.message}`
      );
    }

    // TEST 4: Applying to Seeded platform listing (postedBy: null) blocked from internal application
    {
      const { req, res } = createMockReqRes({
        user: { id: studentUser._id.toString(), role: "student" },
        params: { internshipId: seededInternship._id.toString() },
      });
      await applyToInternship(req, res);
      const status = res.getStatusCode();
      const data = res.getData();

      assert(
        status === 400 && data.message.includes("external platform listing"),
        "Test 4: Application to seeded listing blocked with informative message",
        `Got status ${status}, message: ${data?.message}`
      );
    }

    // TEST 5: Student viewing their own applications
    {
      const { req, res } = createMockReqRes({
        user: { id: studentUser._id.toString(), role: "student" },
      });
      await getStudentApplications(req, res);
      const status = res.getStatusCode();
      const data = res.getData();

      assert(
        status === 200 &&
          Array.isArray(data) &&
          data.length === 1 &&
          data[0].internship?.title === "Frontend Engineering Intern",
        "Test 5: Student can retrieve their own application history",
        `Got status ${status}, length: ${data?.length}`
      );
    }

    // TEST 6: Recruiter 1 viewing applicants for their own internship
    let createdAppId = null;
    {
      const { req, res } = createMockReqRes({
        user: { id: recruiter1._id.toString(), role: "recruiter" },
        params: { internshipId: activeInternship._id.toString() },
      });
      await getInternshipApplicants(req, res);
      const status = res.getStatusCode();
      const data = res.getData();

      if (data?.applications?.length > 0) {
        createdAppId = data.applications[0]._id.toString();
      }

      assert(
        status === 200 &&
          data.applicantCount === 1 &&
          data.applications[0].student.name === "Alice Student" &&
          data.applications[0].student.college === "Stanford University",
        "Test 6: Recruiter can view applicants for their own internship with student profile details",
        `Got status ${status}, count: ${data?.applicantCount}`
      );
    }

    // TEST 7: Recruiter 2 attempting to view Recruiter 1's internship applicants -> 403 Forbidden
    {
      const { req, res } = createMockReqRes({
        user: { id: recruiter2._id.toString(), role: "recruiter" },
        params: { internshipId: activeInternship._id.toString() },
      });
      await getInternshipApplicants(req, res);
      const status = res.getStatusCode();
      const data = res.getData();

      assert(
        status === 403 && data.message.includes("Forbidden"),
        "Test 7: Recruiter cannot view another recruiter's applicants (403 Forbidden)",
        `Got status ${status}, message: ${data?.message}`
      );
    }

    // TEST 8: Recruiter 1 updating application status to "Shortlisted"
    {
      const { req, res } = createMockReqRes({
        user: { id: recruiter1._id.toString(), role: "recruiter" },
        params: { applicationId: createdAppId },
        body: { status: "Shortlisted" },
      });
      await updateApplicationStatus(req, res);
      const status = res.getStatusCode();
      const data = res.getData();

      assert(
        status === 200 && data.application.status === "Shortlisted",
        "Test 8: Recruiter can update application status to 'Shortlisted'",
        `Got status ${status}, new status: ${data?.application?.status}`
      );
    }

    // TEST 9: Updating status with invalid status value rejected with 400
    {
      const { req, res } = createMockReqRes({
        user: { id: recruiter1._id.toString(), role: "recruiter" },
        params: { applicationId: createdAppId },
        body: { status: "HiredPermanently" },
      });
      await updateApplicationStatus(req, res);
      const status = res.getStatusCode();
      const data = res.getData();

      assert(
        status === 400 && data.message.includes("Invalid status"),
        "Test 9: Invalid application status rejected with 400",
        `Got status ${status}, message: ${data?.message}`
      );
    }

    // TEST 10: Recruiter 2 attempting to update Recruiter 1's application status -> 403 Forbidden
    {
      const { req, res } = createMockReqRes({
        user: { id: recruiter2._id.toString(), role: "recruiter" },
        params: { applicationId: createdAppId },
        body: { status: "Rejected" },
      });
      await updateApplicationStatus(req, res);
      const status = res.getStatusCode();
      const data = res.getData();

      assert(
        status === 403 && data.message.includes("Forbidden"),
        "Test 10: Non-owner recruiter blocked from modifying application status (403 Forbidden)",
        `Got status ${status}, message: ${data?.message}`
      );
    }

    // TEST 11: Application status update to "Reviewing" and then "Rejected"
    {
      const { req: req1, res: res1 } = createMockReqRes({
        user: { id: recruiter1._id.toString(), role: "recruiter" },
        params: { applicationId: createdAppId },
        body: { status: "Reviewing" },
      });
      await updateApplicationStatus(req1, res1);

      const { req: req2, res: res2 } = createMockReqRes({
        user: { id: recruiter1._id.toString(), role: "recruiter" },
        params: { applicationId: createdAppId },
        body: { status: "Rejected" },
      });
      await updateApplicationStatus(req2, res2);

        assert(
        res1.getStatusCode() === 200 &&
          res1.getData().application.status === "Reviewing" &&
          res2.getStatusCode() === 200 &&
          res2.getData().application.status === "Rejected",
        "Test 11: Full status transition cycle (Reviewing -> Rejected)",
        `Status 1: ${res1.getData().application.status}, Status 2: ${res2.getData().application.status}`
      );
    }

    // TEST 12: Student blocked from recruiter endpoints via authorizeRole middleware
    {
      const { authorizeRole } = require("./middleware/authMiddleware");
      const middleware = authorizeRole("recruiter");
      const { req, res } = createMockReqRes({
        user: { id: studentUser._id.toString(), role: "student" },
      });
      let nextCalled = false;
      middleware(req, res, () => {
        nextCalled = true;
      });

      assert(
        !nextCalled && res.getStatusCode() === 403,
        "Test 12: Student cannot access recruiter applicant endpoints (blocked by authorizeRole with 403)",
        `nextCalled: ${nextCalled}, status: ${res.getStatusCode()}`
      );
    }

    // TEST 13: Recruiter blocked from student application endpoints via authorizeRole middleware
    {
      const { authorizeRole } = require("./middleware/authMiddleware");
      const middleware = authorizeRole("student");
      const { req, res } = createMockReqRes({
        user: { id: recruiter1._id.toString(), role: "recruiter" },
      });
      let nextCalled = false;
      middleware(req, res, () => {
        nextCalled = true;
      });

      assert(
        !nextCalled && res.getStatusCode() === 403,
        "Test 13: Recruiter cannot submit student applications (blocked by authorizeRole with 403)",
        `nextCalled: ${nextCalled}, status: ${res.getStatusCode()}`
      );
    }
  } catch (error) {
    console.error("Test execution encountered an error:", error);
    testsFailed++;
  } finally {
    // Cleanup created test records
    await Application.deleteMany({
      $or: [
        { "student.email": /test_p42_/ },
        { "recruiter.email": /test_p42_/ },
      ],
    });
    await Internship.deleteMany({ company: "TestCorp P42" });
    await User.deleteMany({ email: /test_p42_/ });
    await mongoose.connection.close();
    console.log("Database connection closed and test records cleaned up.");

    console.log("==========================================");
    console.log(`TOTAL TESTS: ${testsPassed + testsFailed}`);
    console.log(`PASSED: ${testsPassed}`);
    console.log(`FAILED: ${testsFailed}`);
    console.log("==========================================");

    process.exit(testsFailed === 0 ? 0 : 1);
  }
}

runTests();
