const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    internship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Internship",
      required: true,
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["Applied", "Reviewing", "Shortlisted", "Rejected"],
      default: "Applied",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications by the same student to the same internship
applicationSchema.index({ student: 1, internship: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
