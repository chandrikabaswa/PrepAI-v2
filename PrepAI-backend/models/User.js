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

    projects: [
      {
        title: {
          type: String,
          default: "",
        },
        description: {
          type: String,
          default: "",
        },
        techStack: {
          type: [String],
          default: [],
        },
        githubUrl: {
          type: String,
          default: "",
        },
        liveUrl: {
          type: String,
          default: "",
        },
      },
    ],

    experience: [
      {
        type: {
          type: String,
          default: "Internship",
        },
        company: {
          type: String,
          default: "",
        },
        role: {
          type: String,
          default: "",
        },
        location: {
          type: String,
          default: "",
        },
        startDate: {
          type: String,
          default: "",
        },
        endDate: {
          type: String,
          default: "",
        },
        currentlyWorking: {
          type: Boolean,
          default: false,
        },
        description: {
          type: String,
          default: "",
        },
        achievements: {
          type: String,
          default: "",
        },
        skills: {
          type: [String],
          default: [],
        },
        link: {
          type: String,
          default: "",
        },
      },
    ],

    codingProfiles: {
      github: {
        type: String,
        default: "",
      },
      leetcode: {
        type: String,
        default: "",
      },
      hackerrank: {
        type: String,
        default: "",
      },
      linkedin: {
        type: String,
        default: "",
      },
    },

    achievements: [
      {
        title: {
          type: String,
          default: "",
        },
        description: {
          type: String,
          default: "",
        },
        date: {
          type: String,
          default: "",
        },
        link: {
          type: String,
          default: "",
        },
      },
    ],

    certifications: [
      {
        name: {
          type: String,
          default: "",
        },
        organization: {
          type: String,
          default: "",
        },
        date: {
          type: String,
          default: "",
        },
        credentialUrl: {
          type: String,
          default: "",
        },
      },
    ],

    recruiterVisibility: {
      type: Boolean,
      default: true,
    },

    resume: {
      fileName: {
        type: String,
        default: "",
      },
      fileUrl: {
        type: String,
        default: "",
      },
      text: {
        type: String,
        default: "",
      },
      uploadedAt: {
        type: Date,
      },
    },

    // Recruiter profile fields
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