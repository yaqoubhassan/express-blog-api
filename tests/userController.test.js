const request = require("supertest");
const app = require("../server"); // Import your Express app
const connectDB = require("../connectDB");
const mongoose = require("mongoose");
const User = require("../models/userModel"); // Adjust the path if needed
const jwt = require("jsonwebtoken");
const { redis } = require("../middleware/cacheMiddleware");

describe("User Controller", () => {
  let server;

  beforeAll(async () => {
    // Connect to a test database
    await connectDB(process.env.LOCAL_CONN_STR);
  });

  afterAll(async () => {
    // Clean up and close the database connection
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await redis.quit();
  });

  afterEach(async () => {
    // Clean up users after each test
    await User.deleteMany({});
  });

  describe("POST /api/users/register", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      };

      const res = await request(app).post("/api/users/register").send(userData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("data");
      expect(res.body.data).toHaveProperty("id");
      expect(res.body.data).toHaveProperty("token");
      expect(res.body.data.email).toBe(userData.email);
    });

    it("should return an error when email already exists", async () => {
      const userData = {
        name: "Jane Doe",
        email: "jane@example.com",
        password: "password123",
      };

      // Create a user first
      await User.create(userData);

      const res = await request(app).post("/api/users/register").send(userData);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("User already exists");
    });
  });

  describe("POST /api/users/login", () => {
    it("should login a user successfully", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      };
      const user = await User.create(userData);

      const res = await request(app).post("/api/users/login").send({
        email: user.email,
        password: userData.password,
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("data");
      expect(res.body.data).toHaveProperty("token");
      expect(res.body.data.email).toBe(user.email);
    });

    it("should return an error for invalid credentials", async () => {
      const res = await request(app).post("/api/users/login").send({
        email: "invalid@example.com",
        password: "wrongpassword",
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid email or password");
    });
  });

  describe("GET /api/users/profile", () => {
    it("should return user profile for authenticated user", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      };
      const user = await User.create(userData);

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

      const res = await request(app)
        .get("/api/users/profile")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("data");
      expect(res.body.data.email).toBe(user.email);
    });

    it("should return an error for unauthorized access", async () => {
      const res = await request(app).get("/api/users/profile");

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Unauthenticated, no token");
    });
  });
});
