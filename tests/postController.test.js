const request = require("supertest");
const app = require("../server"); // Assuming `app` is exported in server.js
const mongoose = require("mongoose");
const connectDB = require("../connectDB");
const User = require("../models/userModel");
const Post = require("../models/postModel");
const jwt = require("jsonwebtoken");
const {
  redis,
  closeRedisConnection,
} = require("../middleware/cacheMiddleware");

describe("Post Controller", () => {
  let server;

  beforeAll(async () => {
    await connectDB(process.env.LOCAL_CONN_STR);
  });

  afterAll(async () => {
    // Clean up and close the database connection
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await closeRedisConnection();
  });

  afterEach(async () => {
    await redis.flushall();
    await User.deleteMany({});
    await Post.deleteMany({});
  });

  describe("POST /posts", () => {
    it("should create a new post", async () => {
      const userData = {
        name: "John Doe",
        email: "yaqoub@example.com",
        password: "password123",
      };
      const user = await User.create(userData);

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

      const postData = {
        title: "Test Post",
        content: "Test Content",
      };

      const response = await request(app)
        .post("/api/posts")
        .send(postData)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe("success");
      expect(response.body.data.post).toHaveProperty("title", "Test Post");
    });
  });

  describe("GET /posts", () => {
    it("should return a list of posts", async () => {
      const userData = {
        name: "John Admin",
        email: "admin@example.com",
        password: "password123",
      };
      const user = await User.create(userData);

      const mockPosts = [
        {
          _id: new mongoose.Types.ObjectId(),
          title: "Post 1",
          content: "Content 1",
          createdAt: new Date(),
          author: user._id,
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: "Post 2",
          content: "Content 2",
          createdAt: new Date(),
          author: user._id,
        },
      ];

      await Post.insertMany(mockPosts);

      const response = await request(app).get("/api/posts");

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data.posts).toHaveLength(2);
    });
  });

  describe("GET /posts/:id", () => {
    it("should fetch a single post by ID", async () => {
      const userData = {
        name: "John Admin",
        email: "admin@example.com",
        password: "password123",
      };
      const user = await User.create(userData);

      const post = await Post.create({
        title: "Test Title",
        content: "Some Content",
        author: user._id,
      });

      const response = await request(app).get(`/api/posts/${post._id}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data.post).toHaveProperty("title", "Test Title");
    });

    // it("should return 404 if post is not found", async () => {
    //   const response = await request(app).get(
    //     "/api/posts/67755ed2e08e204da8e7494c"
    //   );

    //   expect(response.status).toBe(404);
    //   expect(response.body.status).toBe("error");
    //   expect(response.body.message).toBe("Post not found");
    // });
  });

  describe("PATCH /api/posts/:id", () => {
    it("should update a post", async () => {
      const userData = {
        name: "John Doe",
        email: "ali@example.com",
        password: "password123",
      };
      const user = await User.create(userData);

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

      const post = await Post.create({
        title: "New Title",
        content: "Some content",
        author: user._id,
      });

      const response = await request(app)
        .patch(`/api/posts/${post._id}`)
        .send({ title: "Updated Title", content: "Updated Content" })
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data.updatedPost).toHaveProperty(
        "title",
        "Updated Title"
      );
    });

    //  it("should return 403 if user is unauthorized", async () => {
    //    authMiddleware.mockImplementation((req, res, next) => {
    //      req.user = { id: "differentUserId" };
    //      next();
    //    });

    //    Post.findById.mockResolvedValue({
    //      _id: "mockPostId",
    //      title: "Old Title",
    //      content: "Old Content",
    //      author: { _id: "mockUserId" },
    //    });

    //    const response = await request(app)
    //      .patch("/posts/mockPostId")
    //      .send({ title: "New Title" })
    //      .set("Authorization", "Bearer mockToken");

    //    expect(response.status).toBe(403);
    //    expect(response.body.status).toBe("error");
    //    expect(response.body.message).toBe("Unauthorized");
    //  });
  });

  describe("DELETE /api/posts/:id", () => {
    it("should delete a post", async () => {
      const userData = {
        name: "John Doe",
        email: "hassan@example.com",
        password: "password123",
      };
      const user = await User.create(userData);

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

      const post = await Post.create({
        title: "New Title",
        content: "Some content",
        author: user._id,
      });

      const response = await request(app)
        .delete(`/api/posts/${post._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(204);
    });
  });
});
