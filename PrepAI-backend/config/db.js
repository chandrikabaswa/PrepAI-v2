const mongoose = require("mongoose");
const Internship = require("../models/Internship");
const demoInternships = require("../data/internships");

const seedDemoInternshipsIfEmpty = async () => {
  try {
    const demoCount = await Internship.countDocuments({ postedBy: null });
    if (demoCount === 0) {
      console.log(
        "No demo internships found. Auto-seeding 20 default demo opportunities..."
      );
      await Internship.insertMany(demoInternships);
      console.log(
        `Seeded ${demoInternships.length} default demo internships successfully! ✅`
      );
    }
  } catch (error) {
    console.error("Auto-seeding demo internships error:", error.message);
  }
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected ✅");

    // Automatically seed default demo opportunities if none exist
    await seedDemoInternshipsIfEmpty();
  } catch (error) {
    console.error("MongoDB Connection Failed ❌");
    console.error(error);

    process.exit(1);
  }
};

module.exports = connectDB;