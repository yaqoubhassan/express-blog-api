const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const authMiddleware = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      res.status(401).json({
        status: "failed",
        message: "Unauthorized, token failed",
      });
    }
  }

  if (!token) {
    res.status(401).json({
      status: "error",
      message: "Unauthorized, no token",
    });
  }
};

module.exports = { authMiddleware };