const Comment = require("../models/commentModel");
const Post = require("../models/postModel");

const store = async (req, res) => {
  const { content } = req.body;

  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        status: "error",
        message: "Post not found",
      });
    }

    const comment = await Comment.create({
      content,
      author: req.user.id,
      post: req.params.postId,
    });

    res.status(201).json({
      status: "success",
      data: {
        comment,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: error.message,
    });
  }
};

const index = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      data: {
        comments,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: error.message,
    });
  }
};

module.exports = { store, index };
