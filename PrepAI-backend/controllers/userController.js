const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signup = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      companyName,
      companyWebsite,
      designation,
      companyLocation,
      companyBio,
      industry,
    } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    if (role && !["student", "recruiter"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role specified. Role must be 'student' or 'recruiter'",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "student",
      companyName: companyName || "",
      companyWebsite: companyWebsite || "",
      designation: designation || "",
      companyLocation: companyLocation || "",
      companyBio: companyBio || "",
      industry: industry || "",
    });

    res.status(201).json({
      message: "Account created successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // Generate JWT with role
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role || "student",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "student",
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Student fields
    user.college = req.body.college ?? user.college;
    user.degree = req.body.degree ?? user.degree;
    user.branch = req.body.branch ?? user.branch;
    user.year = req.body.year ?? user.year;
    user.skills = req.body.skills ?? user.skills;
    user.concepts = req.body.concepts ?? user.concepts;
    user.goal = req.body.goal ?? user.goal;
    user.bio = req.body.bio ?? user.bio;

    // Recruiter fields
    user.companyName = req.body.companyName ?? user.companyName;
    user.companyWebsite = req.body.companyWebsite ?? user.companyWebsite;
    user.designation = req.body.designation ?? user.designation;
    user.companyLocation = req.body.companyLocation ?? user.companyLocation;
    user.companyBio = req.body.companyBio ?? user.companyBio;
    user.industry = req.body.industry ?? user.industry;

    await user.save();

    const updatedUser = await User.findById(req.user.id).select("-password");

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  signup,
  login,
  updateProfile,
  getProfile,
};
