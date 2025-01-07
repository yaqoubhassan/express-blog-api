const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "The title field is required"] },
    content: {
      type: String,
      required: [true, "The content field is required"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    postImage: {
      type: String,
      get: (value) => {
        // Return null if no profile picture exists
        if (!value) return null;
        // Ensure the path uses a URL-friendly format
        return `/uploads/${value.replace(/^.*[\\/]/, "")}`;
      },
    },
    createdAt: { type: Date, default: Date.now() },
  },
  {
    toJSON: { getters: true }, // Enable getters when converting to JSON
    toObject: { getters: true }, // Enable getters when converting to Object
  }
);

module.exports = mongoose.model("Post", postSchema);
