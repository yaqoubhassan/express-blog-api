# Express Blog API

This is a comprehensive and feature-rich blog API built with Express.js, MongoDB, and various other libraries to handle essential functionality such as sorting, filtering, pagination, caching, image uploads, and more. This README will guide you through the application's features, setup, and usage.

---

## Features

### User Management
- **User Registration**: Register new users with validation for name, email, and password.
- **User Login**: Authenticate users and provide a JWT token.
- **User Profile Management**: Retrieve and update user profiles, including uploading profile pictures.

### Blog Posts
- **CRUD Operations**: Create, read, update, and delete blog posts.
- **Pagination**: Retrieve posts in paginated results.
- **Sorting and Filtering**: Sort posts by fields like `createdAt` and filter by keywords or tags.

### Performance Optimization
- **Caching**: Redis is used to cache frequently accessed resources.
- **Image Uploads**: Multer handles image uploads, including user profile pictures and post-related images.

### API Documentation
- **Swagger Integration**: Comprehensive API documentation using Swagger UI.

### Testing
- **Unit and Integration Testing**: Jest and Supertest for ensuring robust functionality.
- **Code Coverage**: Generate reports using Jest for insights into untested parts of the codebase.

---

## Tech Stack

### Backend
- **Express.js**: Node.js web framework for building APIs.
- **MongoDB**: NoSQL database for storing users, posts, and related data.
- **Mongoose**: Object Data Modeling (ODM) library for MongoDB.

### Utilities and Middleware
- **bcryptjs**: Password hashing for secure storage.
- **jsonwebtoken**: JWT-based authentication.
- **multer**: File upload management.
- **Redis**: In-memory caching.
- **cors**: Enable cross-origin requests.
- **dotenv**: Manage environment variables.
- **Swagger UI**: Auto-generated API documentation.

### Testing
- **Jest**: JavaScript testing framework.
- **Supertest**: HTTP assertions and testing.

---

## Installation

### Prerequisites
- Node.js and npm
- MongoDB
- Redis

### Steps
1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```bash
   cd express-blog-api
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file:
   ```plaintext
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/express-blog-api
   JWT_SECRET=your_jwt_secret
   ```

5. Start the server:
   ```bash
   npm start
   ```

---

## API Documentation

Access Swagger UI at `http://localhost:3000/api-docs` to explore all API endpoints, their payloads, and expected responses.

---

## Testing and Coverage

### Run Tests
```bash
npm test
```

### Generate Coverage Report
```bash
npm test -- --coverage
```

## File Uploads

### Profile Picture
- Uploaded images are stored in the `/uploads` directory.
- File naming format: `<timestamp>-<original_name>`.
- If a user updates their profile picture, the previous image is deleted.

---

## Caching

### How It Works
- Redis is used to cache API responses for faster retrieval.
- Cache keys are unique to the request URL.

### Clearing Cache
- The cache is automatically cleared when resources are updated.

---

## Pagination, Sorting, and Filtering

### Pagination
- `GET /api/posts?page=<number>&limit=<number>`.
- Defaults: `page=1`, `limit=10`.

### Sorting
- Use `sort` query parameter: `GET /api/posts?sort=desc`.

### Filtering
- Use specific query parameters, e.g., `GET '/api/posts?search=<postTitle>`.

---

## Libraries Overview

| Library        | Purpose                          |
|----------------|----------------------------------|
| express        | API framework                   |
| mongoose       | MongoDB ODM                     |
| multer         | File uploads                    |
| redis          | Caching                         |
| bcryptjs       | Password hashing                |
| jsonwebtoken   | JWT authentication              |
| dotenv         | Environment variable management |
| jest           | Testing framework               |
| supertest      | HTTP request testing            |

---

## Contribution Guidelines
1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add your message here"
   ```
4. Push to the branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a Pull Request.

---

## Author
[Yakubu Alhassan]  
Feel free to reach out via email at [yaqoubdramani@gmail.com].
