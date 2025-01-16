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

    let comment = await Comment.create({
      content,
      author: req.user.id,
      post: req.params.postId,
    });

    comment = await comment.populate("author", "name email");

    post.comments.push(comment._id);
    await post.save();

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

const update = async (req, res) => {
  const { content } = req.body;

  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        status: "error",
        message: "Comment not found",
      });
    }

    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    comment.content = content || comment.content;

    const updatedComment = await comment.save();

    res.status(200).json({
      status: "success",
      data: {
        updatedComment,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: error.message,
    });
  }
};

const destroy = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        status: "error",
        message: "Comment not found",
      });
    }

    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    await comment.deleteOne();
    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: error.message,
    });
  }
};

module.exports = { store, index, update, destroy };
