const Post = require("../models/postModel");

const store = async (req, res) => {
  const { title, content } = req.body;

  try {
    const post = await Post.create({
      title,
      content,
      author: req.user.id,
    });

    if (req.file) {
      post.postImage = req.file.path;
      await post.save();
    }

    // const baseUrl = `${req.protocol}://${req.get("host")}`;
    // const postData = post.toObject();
    // if (postData.postImage) {
    //   postData.postImage = `${baseUrl.replace(
    //     /\/$/,
    //     ""
    //   )}${postData.postData.replace(/\\/g, "/")}`;
    // }

    res.status(201).json({
      status: "success",
      data: {
        post,
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
        from: "users", // Replace 'users' with your actual collection name for authors
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
    { $unwind: "$author" }, // Decompose author array into individual objects
    {
      $lookup: {
        from: "comments", // Replace 'comments' with your actual collection name for comments
        localField: "_id",
        foreignField: "post", // Assuming each comment references the `Post` it belongs to via a `post` field
        as: "comments",
        pipeline: [
          {
            $lookup: {
              from: "users", // Replace 'users' with your actual collection name for comment authors
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
          { $unwind: "$author" }, // Decompose comment author array into individual objects
          {
            $project: {
              _id: 1,
              content: 1,
              createdAt: 1,
              author: 1, // Include the populated author fields for each comment
            },
          },
        ],
      },
    },
    { $match: filters }, // Apply combined filters
    { $sort: { createdAt: sortOrder } }, // Sort posts
    { $skip: skip }, // Pagination: Skip posts
    { $limit: limit }, // Pagination: Limit posts
    {
      $project: {
        title: 1, // Include post title
        content: 1, // Include post content
        createdAt: 1, // Include post creation time
        author: 1, // Include populated author fields
        comments: 1, // Include populated comments with authors
        postImage: 1,
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
        post,
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
  const { title, content } = req.body;

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

    if (post.author.id.toString() !== req.user.id) {
      return res.status(403).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    post.title = title || post.title;
    post.content = content || post.content;

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

module.exports = { store, index, show, update, destroy };
