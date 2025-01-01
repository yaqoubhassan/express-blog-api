const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "The name field is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "The email field is required"],
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "The password field is required"],
  },
  createdAt: { type: Date, default: Date.now() },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model("User", userSchema);
