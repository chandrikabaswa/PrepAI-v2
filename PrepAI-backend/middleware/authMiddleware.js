const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Not authorized",
    });
  }

  try {
    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
};

const authorizeRole = (...roles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    let role = req.user.role;

    // Fallback: If role wasn't embedded in the JWT token (e.g. legacy token), fetch from DB
    if (!role && req.user.id) {
      try {
        const user = await User.findById(req.user.id).select("role");
        role = user ? user.role : "student";
        req.user.role = role;
      } catch (err) {
        return res.status(500).json({
          message: "Authorization check failed",
        });
      }
    }

    if (!roles.includes(role)) {
      return res.status(403).json({
        message: `Forbidden: role '${role}' cannot access this resource`,
      });
    }

    next();
  };
};

protect.protect = protect;
protect.authorizeRole = authorizeRole;

module.exports = protect;