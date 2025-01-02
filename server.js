const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");

dotenv.config({ path: "./config.env" });

let app = express();

app.use(express.json());

mongoose
  .connect(process.env.LOCAL_CONN_STR)
  .then((conn) => {
    console.log("MongoDB Connected!");
  })
  .catch((err) => {
    console.log("MongoDB connection error: ", err);
  });

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
