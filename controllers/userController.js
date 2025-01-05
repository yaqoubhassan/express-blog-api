const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

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
    const user = await User.findOne({ email }).select("+password");
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

// const getUserProfile = async (req, res) => {
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    // Add absolute URL for profilePicture
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const userData = user.toObject();
    if (userData.profilePicture) {
      userData.profilePicture = `${baseUrl.replace(
        /\/$/,
        ""
      )}${userData.profilePicture.replace(/\\/g, "/")}`;
    }

    res.json({
      status: "success",
      data: {
        id: userData._id,
        name: userData.name,
        email: userData.email,
        profilePicture: userData.profilePicture,
        createdAt: userData.createdAt,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "An unexpected error occurred" });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;

    // Find the user to check for an existing profile picture
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Delete the old profile picture if it exists
    if (user.profilePicture) {
      const oldProfilePicturePath = path.join(
        __dirname,
        "..",
        user.profilePicture
      );
      fs.unlink(oldProfilePicturePath, (err) => {
        if (err) {
          console.error("Error deleting old profile picture:", err.message);
        }
      });
    }

    // Update user details
    const updatedUser = {
      name: name || user.name,
      email: email || user.email,
    };

    // Add the new profile picture if uploaded
    if (req.file) {
      updatedUser.profilePicture = req.file.path;
    }

    const updatedUserData = await User.findByIdAndUpdate(userId, updatedUser, {
      new: true,
    });

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    res.status(200).json({
      status: "success",
      data: {
        id: updatedUserData._id,
        name: updatedUserData.name,
        email: updatedUserData.email,
        profilePicture: updatedUserData.profilePicture
          ? `${baseUrl}/${updatedUserData.profilePicture.replace(/\\/g, "/")}`
          : null,
        createdAt: updatedUserData.createdAt,
      },
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({
      status: "failed",
      message: error.message,
    });
  }
};

module.exports = { registerUser, loginUser, getUserProfile, updateUserProfile };
