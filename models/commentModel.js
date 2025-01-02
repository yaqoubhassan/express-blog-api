const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  content: { type: String, required: [true, "The content field is required"] },
  post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now() },
});

module.exports = mongoose.model("Comment", commentSchema);
