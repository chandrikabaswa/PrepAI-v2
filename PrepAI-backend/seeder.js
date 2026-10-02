const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Project = require("./models/Project");
const Internship = require("./models/Internship");

const projects = require("./data/projects");
const internships = require("./data/internships");

const Learning = require("./models/Learning");
const learning = require("./data/learning");

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected");

    // Delete existing default data (preserves recruiter-created postings)
    await Project.deleteMany();
    await Internship.deleteMany({ postedBy: null });
    await Learning.deleteMany();

    await Project.insertMany(projects);
    await Internship.insertMany(internships);
    await Learning.insertMany(learning);

    console.log("Projects, Internships & Learning Topics Seeded Successfully!");

    process.exit();
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
