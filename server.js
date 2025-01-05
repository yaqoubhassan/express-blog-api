const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("./connectDB");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

const env = process.env.NODE_ENV || "development";
const configFile = `config.env.${env}`;
dotenv.config({ path: configFile });

let app = express();

app.use(express.json());

if (process.env.NODE_ENV !== "test") {
  connectDB(process.env.LOCAL_CONN_STR);
}

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const port = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "test") {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

module.exports = app;
