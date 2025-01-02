const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: { type: String, required: [true, "The title field is required"] },
  content: { type: String, required: [true, "The content field is required"] },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  createdAt: { type: Date, default: Date.now() },
});

module.exports = mongoose.model("Post", postSchema);
