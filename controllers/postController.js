const Post = require("../models/postModel");

// Helper function to build image URLs
const buildImageUrl = (filePath, req) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  return filePath
    ? `${baseUrl.replace(/\/$/, "")}${filePath.replace(/\\/g, "/")}`
    : null;
};

const store = async (req, res) => {
  const { title, content } = req.body;

  try {
    const post = await Post.create({
      title,
      content,
      author: req.user.id,
    });

    if (req.file) {
      // Save the relative path in the database
      post.postImage = `/uploads/${req.file.filename}`;
      await post.save();
    }

    const postData = post.toObject();

    // Build the full URL dynamically for the response
    postData.postImage = post.postImage
      ? `${req.protocol}://${req.get("host")}${post.postImage}`
      : null;

    res.status(201).json({
      status: "success",
      data: {
        id: postData._id,
        title: postData.title,
        content: postData.content,
        author: postData.author,
        comments: postData.comments,
        postImage: postData.postImage,
        createdAt: postData.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: error.message,
    });
  }
};

const buildAuthorFilter = (author) => {
  if (!author) return {};
  return {
    $or: [
      { "author.name": { $regex: author, $options: "i" } },
      { "author.email": { $regex: author, $options: "i" } },
      { "author._id": author },
    ],
  };
};

const buildSearchFilter = (search) => {
  if (!search) return {};
  return {
    $or: [
      { title: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } },
    ],
  };
};

const buildAggregationPipeline = (filters, sortOrder, skip, limit) => {
  return [
    {
      $lookup: {
        from: "users",
        localField: "author",
        foreignField: "_id",
        as: "author",
        pipeline: [
          {
            $project: {
              _id: 1,
              name: 1,
              email: 1,
            },
          },
        ],
      },
    },
    { $unwind: "$author" },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "post",
        as: "comments",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "author",
              foreignField: "_id",
              as: "author",
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    name: 1,
                    email: 1,
                  },
                },
              ],
            },
          },
          { $unwind: "$author" },
          {
            $project: {
              _id: 1,
              content: 1,
              createdAt: 1,
              author: 1,
            },
          },
        ],
      },
    },
    { $match: filters },
    { $sort: { createdAt: sortOrder } },
    { $skip: skip },
    { $limit: limit },
    {
      $project: {
        title: 1,
        content: 1,
        createdAt: 1,
        author: 1,
        comments: 1,
        postImage: {
          $ifNull: ["$postImage", "/uploads/default.jpg"], // Default image path
        },
      },
    },
  ];
};

const countTotalPosts = async (authorFilter, searchFilter) => {
  const totalPosts = await Post.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "author",
        foreignField: "_id",
        as: "author",
      },
    },
    { $unwind: "$author" },
    {
      $match: {
        $and: [authorFilter, searchFilter],
      },
    },
    { $count: "total" },
  ]);
  return totalPosts.length > 0 ? totalPosts[0].total : 0;
};

const index = async (req, res) => {
  try {
    const sortOrder = req.query.sort === "asc" ? 1 : -1;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const authorFilter = buildAuthorFilter(req.query.author);
    const searchFilter = buildSearchFilter(req.query.search);
    const combinedFilters = { $and: [authorFilter, searchFilter] };

    const posts = await Post.aggregate(
      buildAggregationPipeline(combinedFilters, sortOrder, skip, limit)
    );

    posts.forEach((post) => {
      post.postImage = post.postImage
        ? `${req.protocol}://${req.get("host")}${post.postImage}`
        : null;
    });

    const total = await countTotalPosts(authorFilter, searchFilter);

    res.status(200).json({
      status: "success",
      data: {
        posts,
      },
      metadata: {
        totalPosts: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: error.message,
    });
  }
};

const show = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "author",
      "name email"
    );

    if (!post) {
      return res.status(404).json({
        status: "error",
        message: "Post not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        post: {
          _id: post._id,
          title: post.title,
          content: post.content,
          author: {
            name: post.author.name,
            email: post.author.email,
          },
          comments: post.comments,
          postImage: post.postImage
            ? `${req.protocol}://${req.get("host")}${post.postImage}`
            : null,
          createdAt: post.createdAt,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: error.message,
    });
  }
};

const fs = require("fs"); // To handle file deletion if needed

const update = async (req, res) => {
  const { title, content } = req.body;

  try {
    // Find the post by ID
    const post = await Post.findById(req.params.id).populate(
      "author",
      "name email"
    );

    if (!post) {
      return res.status(404).json({
        status: "error",
        message: "Post not found",
      });
    }

    // Check if the authenticated user is the author
    if (post.author.id.toString() !== req.user.id) {
      return res.status(403).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    // Update title and content if provided
    post.title = title || post.title;
    post.content = content || post.content;

    // Handle post image update
    if (req.file) {
      // Assuming `req.file` contains the uploaded image (handled by multer)
      const newImagePath = req.file.path;

      // Optionally delete the old image if one exists
      if (post.image) {
        fs.unlink(post.image, (err) => {
          if (err) {
            console.error("Failed to delete old image:", err);
          }
        });
      }

      // Update the post's image field
      post.image = newImagePath;
    }

    // Save the updated post
    const updatedPost = await post.save();

    res.status(200).json({
      status: "success",
      data: {
        updatedPost,
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
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        status: "error",
        message: "Post not found",
      });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    await post.deleteOne();
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

const getUserPosts = async (req, res) => {
  try {
    // Extract pagination parameters from query
    const page = parseInt(req.query.page, 10) || 1; // Default to page 1
    const limit = parseInt(req.query.limit, 10) || 10; // Default to 10 posts per page
    const skip = (page - 1) * limit;

    // Fetch paginated posts
    const totalPosts = await Post.countDocuments({ author: req.user.id });
    const posts = await Post.find({ author: req.user.id })
      .sort({ createdAt: -1 }) // Sort by most recent
      .skip(skip)
      .limit(limit)
      .lean();

    // Map and adjust the response
    const updatedPosts = posts.map((post) => ({
      _id: post._id,
      title: post.title,
      content: post.content,
      author: post.author,
      comments: post.comments || [],
      createdAt: post.createdAt,
      postImage: post.postImage
        ? `${req.protocol}://${req.get("host")}${post.postImage}`
        : null,
    }));

    res.status(200).json({
      status: "success",
      data: {
        posts: updatedPosts,
        pagination: {
          totalPosts,
          currentPage: page,
          totalPages: Math.ceil(totalPosts / limit),
          hasNextPage: page * limit < totalPosts,
          hasPreviousPage: page > 1,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: error.message,
    });
  }
};

module.exports = { store, index, show, update, destroy, getUserPosts };
