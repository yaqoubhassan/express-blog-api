const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const user = await User.create({ name, email, password });
    if (user) {
      res.status(201).json({
        status: "success",
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          token: generateToken(user._id),
          createdAt: user.createdAt,
        },
      });
    } else {
      res.status(400).json({
        status: "error",
        message: "Invalid user",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      res.status(200).json({
        status: "success",
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: error.message,
    });
  }
};

const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    res.status(200).json({
      status: "succes",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } else {
    res.status(404).json({
      status: "error",
      message: "User not found",
    });
  }
};

module.exports = { registerUser, loginUser, getUserProfile };
