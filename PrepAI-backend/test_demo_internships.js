require("dotenv").config();
const mongoose = require("mongoose");
const Internship = require("./models/Internship");
const demoInternships = require("./data/internships");
const { getAllInternships } = require("./controllers/internshipController");

async function runTests() {
  console.log("==========================================");
  console.log("   DEMO INTERNSHIPS VERIFICATION SUITE    ");
  console.log("==========================================");

  let passed = 0;
  let failed = 0;

  function assert(condition, name, details = "") {
    if (condition) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name} - ${details}`);
      failed++;
    }
  }

  // 1. Data file integrity
  assert(
    Array.isArray(demoInternships) && demoInternships.length >= 20,
    "Data Count: At least 20 demo internships defined in data/internships.js",
    `Found: ${demoInternships?.length}`
  );

  const distinctCompanies = new Set(demoInternships.map((i) => i.company));
  assert(
    distinctCompanies.size >= 20,
    "Distinct Companies: At least 20 distinct realistic company names",
    `Found ${distinctCompanies.size} unique companies`
  );

  // 2. Field compliance with Schema & UI
  const validModes = ["Remote", "Hybrid", "Onsite"];
  let allFieldsValid = true;
  let invalidFieldReason = "";

  for (let i = 0; i < demoInternships.length; i++) {
    const item = demoInternships[i];
    if (!item.company) {
      allFieldsValid = false;
      invalidFieldReason = `Item ${i} missing company`;
      break;
    }
    if (!item.title) {
      allFieldsValid = false;
      invalidFieldReason = `Item ${i} missing title`;
      break;
    }
    if (!item.location) {
      allFieldsValid = false;
      invalidFieldReason = `Item ${i} missing location`;
      break;
    }
    if (!item.mode || !validModes.includes(item.mode)) {
      allFieldsValid = false;
      invalidFieldReason = `Item ${i} invalid mode: ${item.mode}`;
      break;
    }
    if (!item.stipend) {
      allFieldsValid = false;
      invalidFieldReason = `Item ${i} missing stipend`;
      break;
    }
    if (!item.duration) {
      allFieldsValid = false;
      invalidFieldReason = `Item ${i} missing duration`;
      break;
    }
    if (!Array.isArray(item.skills) || item.skills.length === 0) {
      allFieldsValid = false;
      invalidFieldReason = `Item ${i} missing skills`;
      break;
    }
    if (!item.applyLink) {
      allFieldsValid = false;
      invalidFieldReason = `Item ${i} missing applyLink`;
      break;
    }
    if (!item.description || !item.description.includes("DEMO")) {
      allFieldsValid = false;
      invalidFieldReason = `Item ${i} description not marked as demo`;
      break;
    }
    if (item.postedBy !== null) {
      allFieldsValid = false;
      invalidFieldReason = `Item ${i} postedBy must be null for demo listings`;
      break;
    }
  }

  assert(
    allFieldsValid,
    "Schema Compliance: All 20 internships have valid fields and enum modes",
    invalidFieldReason
  );

  // 3. Domain coverage
  const titlesAndDescs = demoInternships
    .map((i) => `${i.title} ${i.description} ${i.skills.join(" ")}`.toLowerCase())
    .join(" ");

  const domains = [
    { name: "AI/ML", check: titlesAndDescs.includes("ai") || titlesAndDescs.includes("machine learning") },
    { name: "Web Development", check: titlesAndDescs.includes("frontend") || titlesAndDescs.includes("web") },
    { name: "Full Stack", check: titlesAndDescs.includes("full stack") },
    { name: "Data Science", check: titlesAndDescs.includes("data science") || titlesAndDescs.includes("analytics") },
    { name: "Cybersecurity", check: titlesAndDescs.includes("cybersecurity") || titlesAndDescs.includes("security") },
    { name: "Cloud", check: titlesAndDescs.includes("cloud") || titlesAndDescs.includes("aws") },
    { name: "IoT", check: titlesAndDescs.includes("iot") || titlesAndDescs.includes("embedded") },
    { name: "Green Energy", check: titlesAndDescs.includes("green energy") || titlesAndDescs.includes("energy") },
    { name: "Smart Mobility", check: titlesAndDescs.includes("mobility") || titlesAndDescs.includes("autonomous") },
    { name: "Smart Cities", check: titlesAndDescs.includes("smart cities") || titlesAndDescs.includes("urban") },
    { name: "Software Engineering", check: titlesAndDescs.includes("software") || titlesAndDescs.includes("systems") },
  ];

  const allDomainsCovered = domains.every((d) => d.check);
  assert(
    allDomainsCovered,
    "Domain Coverage: All requested engineering and technology domains are covered",
    domains.filter((d) => !d.check).map((d) => d.name).join(", ")
  );

  // 4. Database verification
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  const totalInDb = await Internship.countDocuments();
  const demoInDb = await Internship.countDocuments({ postedBy: null });
  const recruiterInDb = await Internship.countDocuments({ postedBy: { $ne: null } });

  assert(
    demoInDb >= 20,
    "Database: At least 20 demo internships present in MongoDB Atlas",
    `Found ${demoInDb} demo internships in database`
  );

  assert(
    totalInDb >= 20,
    "Database: Total visible internships >= 20",
    `Total in database: ${totalInDb}`
  );

  // 5. Controller verification (getAllInternships endpoint simulation)
  let mockResData = null;
  const mockReq = { user: null };
  const mockRes = {
    json(data) {
      mockResData = data;
      return this;
    },
    status() {
      return this;
    },
  };

  await getAllInternships(mockReq, mockRes);
  assert(
    Array.isArray(mockResData) && mockResData.length >= 20,
    "Controller API: getAllInternships returns at least 20 opportunities",
    `Returned ${mockResData?.length} opportunities`
  );

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");

  console.log("\n==========================================");
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================");

  if (failed > 0) process.exit(1);
}

runTests();
