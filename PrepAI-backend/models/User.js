const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["student", "recruiter"],
      default: "student",
    },

    college: {
      type: String,
      default: "",
    },

    degree: {
      type: String,
      default: "",
    },

    branch: {
      type: String,
      default: "",
    },

    year: {
      type: String,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    concepts: {
      type: [String],
      default: [],
    },

    goal: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
    },

    companyName: {
      type: String,
      default: "",
    },

    companyWebsite: {
      type: String,
      default: "",
    },

    designation: {
      type: String,
      default: "",
    },

    companyLocation: {
      type: String,
      default: "",
    },

    companyBio: {
      type: String,
      default: "",
    },

    industry: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);