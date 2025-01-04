// db.js
const mongoose = require("mongoose");

const connectDB = async (connectionString) => {
  try {
    await mongoose.connect(connectionString);
    console.log("MongoDB Connected!");
  } catch (error) {
    console.error("MongoDB connection error: ", error);
    process.exit(1);
  }
};

module.exports = connectDB;
