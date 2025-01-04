const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("./connectDB");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");

const env = process.env.NODE_ENV || "development";
const configFile = `config.env.${env}`;
dotenv.config({ path: configFile });

let app = express();

app.use(express.json());

if (process.env.NODE_ENV !== "test") {
  connectDB(process.env.LOCAL_CONN_STR);
}

// mongoose
//   .connect(process.env.LOCAL_CONN_STR)
//   .then((conn) => {
//     console.log("MongoDB Connected!");
//   })
//   .catch((err) => {
//     console.log("MongoDB connection error: ", err);
//   });

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);

const port = process.env.PORT || 3000;

// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });

if (process.env.NODE_ENV !== "test") {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

module.exports = app;
