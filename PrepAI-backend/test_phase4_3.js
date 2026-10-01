require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Internship = require("./models/Internship");
const Application = require("./models/Application");

const {
  contactCandidate,
} = require("./controllers/internshipController");

const {
  contactApplicant,
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
  console.log("   PHASE 4.3 AUTOMATED VERIFICATION SUITE  ");
  console.log("==========================================");

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  // Clean up any test records
  await Application.deleteMany({
    $or: [{ "student.email": /test_p43_/ }, { "recruiter.email": /test_p43_/ }],
  });
  await Internship.deleteMany({ company: "Acme Innovations P43" });
  await User.deleteMany({ email: /test_p43_/ });

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
    const recruiter1 = await User.create({
      name: "Rachel Green",
      email: "test_p43_recruiter1@example.com",
      password: "password123",
      role: "recruiter",
      companyName: "Acme Innovations P43",
      designation: "Head of Talent",
    });

    const recruiter2 = await User.create({
      name: "Ross Geller",
      email: "test_p43_recruiter2@example.com",
      password: "password123",
      role: "recruiter",
      companyName: "Museum Corp P43",
      designation: "Curator Lead",
    });

    // Student A: Matches skills
    const studentMatched = await User.create({
      name: "Alice Matched",
      email: "test_p43_alice@example.com",
      password: "password123",
      role: "student",
      skills: ["React", "CSS", "Python"],
    });

    // Student B: 0 matching skills, but will apply
    const studentApplicant = await User.create({
      name: "Bob Applicant",
      email: "test_p43_bob@example.com",
      password: "password123",
      role: "student",
      skills: ["Go", "Rust"],
    });

    // Student C: 0 matching skills and will NOT apply
    const studentIneligible = await User.create({
      name: "Charlie Ineligible",
      email: "test_p43_charlie@example.com",
      password: "password123",
      role: "student",
      skills: ["Marketing", "Sales"],
    });

    // 2. Create test internship for recruiter1
    const internship1 = await Internship.create({
      title: "Full Stack Engineer Intern",
      company: "Acme Innovations P43",
      location: "New York, NY",
      mode: "Hybrid",
      duration: "6 Months",
      stipend: "$5,000/mo",
      skills: ["React", "Node.js"],
      status: "Active",
      postedBy: recruiter1._id,
      applyLink: "https://acme.com/apply/fs",
    });

    // 3. Create application for Bob to internship1
    const applicationBob = await Application.create({
      student: studentApplicant._id,
      internship: internship1._id,
      recruiter: recruiter1._id,
      status: "Applied",
    });

    // TEST 1: Recruiter contacts matched candidate (condition a: matching skills)
    {
      const { req, res } = createMockReqRes({
        user: { id: recruiter1._id.toString(), role: "recruiter", name: recruiter1.name },
        params: {
          internshipId: internship1._id.toString(),
          studentId: studentMatched._id.toString(),
        },
      });
      await contactCandidate(req, res);
      const status = res.getStatusCode();
      const data = res.getData();

      assert(
        status === 200 &&
          data.contact &&
          data.contact.studentEmail === "test_p43_alice@example.com" &&
          data.contact.subject.includes("Full Stack Engineer Intern") &&
          data.contact.body.includes("Alice Matched") &&
          data.contact.body.includes("Acme Innovations P43") &&
          data.contact.body.includes("Rachel Green") &&
          data.contact.mailtoUrl.startsWith("mailto:test_p43_alice@example.com"),
        "Test 1: Recruiter can contact a matched candidate (condition a: skills match)",
        `Status: ${status}, Subject: ${data?.contact?.subject}`
      );
    }

    // TEST 2: Recruiter contacts candidate who has applied (condition b: application exists)
    {
      const { req, res } = createMockReqRes({
        user: { id: recruiter1._id.toString(), role: "recruiter", name: recruiter1.name },
        params: {
          internshipId: internship1._id.toString(),
          studentId: studentApplicant._id.toString(),
        },
      });
      await contactCandidate(req, res);
      const status = res.getStatusCode();
      const data = res.getData();

      assert(
        status === 200 &&
          data.contact &&
          data.contact.isApplicant === true &&
          data.contact.subject.includes("Regarding your application for Full Stack Engineer Intern") &&
          data.contact.body.includes("Bob Applicant"),
        "Test 2: Recruiter can contact an applicant with 0 matching skills (condition b: application exists)",
        `Status: ${status}, Subject: ${data?.contact?.subject}`
      );
    }

    // TEST 3: Recruiter contacts applicant via /api/applications/:applicationId/contact
    {
      const { req, res } = createMockReqRes({
        user: { id: recruiter1._id.toString(), role: "recruiter", name: recruiter1.name },
        params: {
          applicationId: applicationBob._id.toString(),
        },
      });
      await contactApplicant(req, res);
      const status = res.getStatusCode();
      const data = res.getData();

      assert(
        status === 200 &&
          data.contact &&
          data.contact.studentEmail === "test_p43_bob@example.com" &&
          data.contact.company === "Acme Innovations P43",
        "Test 3: Recruiter can contact applicant via application contact endpoint",
        `Status: ${status}, Email: ${data?.contact?.studentEmail}`
      );
    }

    // TEST 4: Recruiter blocked from contacting ineligible student (0 matching skills, no application)
    {
      const { req, res } = createMockReqRes({
        user: { id: recruiter1._id.toString(), role: "recruiter", name: recruiter1.name },
        params: {
          internshipId: internship1._id.toString(),
          studentId: studentIneligible._id.toString(),
        },
      });
      await contactCandidate(req, res);
      const status = res.getStatusCode();
      const data = res.getData();

      assert(
        status === 403 && data.message.includes("Candidate is not eligible to be contacted"),
        "Test 4: Recruiter blocked when student has 0 matching skills and has not applied (403)",
        `Status: ${status}, Message: ${data?.message}`
      );
    }

    // TEST 5: Recruiter blocked from using another recruiter's internship to contact candidate
    {
      const { req, res } = createMockReqRes({
        user: { id: recruiter2._id.toString(), role: "recruiter", name: recruiter2.name },
        params: {
          internshipId: internship1._id.toString(),
          studentId: studentMatched._id.toString(),
        },
      });
      await contactCandidate(req, res);
      const status = res.getStatusCode();
      const data = res.getData();

      assert(
        status === 403 && data.message.includes("Forbidden"),
        "Test 5: Recruiter blocked from contacting candidates using another recruiter's internship (403)",
        `Status: ${status}, Message: ${data?.message}`
      );
    }

    // TEST 6: Recruiter blocked from contacting another recruiter's applicant
    {
      const { req, res } = createMockReqRes({
        user: { id: recruiter2._id.toString(), role: "recruiter", name: recruiter2.name },
        params: {
          applicationId: applicationBob._id.toString(),
        },
      });
      await contactApplicant(req, res);
      const status = res.getStatusCode();
      const data = res.getData();

      assert(
        status === 403 && data.message.includes("Forbidden"),
        "Test 6: Recruiter blocked from contacting another recruiter's applicant (403)",
        `Status: ${status}, Message: ${data?.message}`
      );
    }

    // TEST 7: Student blocked by RBAC middleware from calling recruiter contact endpoint
    {
      const middleware = authorizeRole("recruiter");
      const { req, res } = createMockReqRes({
        user: { id: studentMatched._id.toString(), role: "student" },
      });
      let nextCalled = false;
      middleware(req, res, () => {
        nextCalled = true;
      });

      assert(
        !nextCalled && res.getStatusCode() === 403,
        "Test 7: Student blocked by authorizeRole middleware from accessing recruiter contact endpoints",
        `nextCalled: ${nextCalled}, Status: ${res.getStatusCode()}`
      );
    }

    // TEST 8: Non-existent internship returns 404
    {
      const fakeId = new mongoose.Types.ObjectId();
      const { req, res } = createMockReqRes({
        user: { id: recruiter1._id.toString(), role: "recruiter" },
        params: {
          internshipId: fakeId.toString(),
          studentId: studentMatched._id.toString(),
        },
      });
      await contactCandidate(req, res);
      const status = res.getStatusCode();

      assert(
        status === 404,
        "Test 8: Non-existent internship returns 404 Not Found",
        `Status: ${status}`
      );
    }

    // TEST 9: Non-existent student returns 404
    {
      const fakeId = new mongoose.Types.ObjectId();
      const { req, res } = createMockReqRes({
        user: { id: recruiter1._id.toString(), role: "recruiter" },
        params: {
          internshipId: internship1._id.toString(),
          studentId: fakeId.toString(),
        },
      });
      await contactCandidate(req, res);
      const status = res.getStatusCode();

      assert(
        status === 404,
        "Test 9: Non-existent student candidate returns 404 Not Found",
        `Status: ${status}`
      );
    }

    // TEST 10: Non-student user (e.g. another recruiter) cannot be contacted as candidate
    {
      const { req, res } = createMockReqRes({
        user: { id: recruiter1._id.toString(), role: "recruiter" },
        params: {
          internshipId: internship1._id.toString(),
          studentId: recruiter2._id.toString(),
        },
      });
      await contactCandidate(req, res);
      const status = res.getStatusCode();

      assert(
        status === 404,
        "Test 10: Non-student user cannot be targeted as candidate (returns 404)",
        `Status: ${status}`
      );
    }

    // TEST 11: Personalization accurately uses recruiter profile data
    {
      const { req, res } = createMockReqRes({
        user: { id: recruiter1._id.toString(), role: "recruiter" },
        params: {
          internshipId: internship1._id.toString(),
          studentId: studentMatched._id.toString(),
        },
      });
      await contactCandidate(req, res);
      const data = res.getData();

      assert(
        data.contact.body.includes("Rachel Green") &&
          data.contact.body.includes("Head of Talent") &&
          data.contact.body.includes("Acme Innovations P43"),
        "Test 11: Contact message incorporates recruiter name, designation, and company name",
        `Body snippet: ${data?.contact?.body?.substring(0, 100)}`
      );
    }
  } catch (error) {
    console.error("Test execution encountered an error:", error);
    testsFailed++;
  } finally {
    // Cleanup
    await Application.deleteMany({
      $or: [{ "student.email": /test_p43_/ }, { "recruiter.email": /test_p43_/ }],
    });
    await Internship.deleteMany({ company: "Acme Innovations P43" });
    await User.deleteMany({ email: /test_p43_/ });
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
