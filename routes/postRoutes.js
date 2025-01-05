const express = require("express");
const {
  store,
  index,
  show,
  update,
  destroy,
} = require("../controllers/postController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { cacheMiddleware } = require("../middleware/cacheMiddleware");

const router = express.Router();

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Get all posts
 *     description: Retrieve a list of all posts
 *     tags:
 *       - Posts
 *     responses:
 *       200:
 *         description: Successfully fetched posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                   content:
 *                     type: string
 */
router.post("/", authMiddleware, store);
router.get("/", index);
// router.get("/", cacheMiddleware, index);
router.get("/:id", show);
router.patch("/:id", authMiddleware, update);
router.delete("/:id", authMiddleware, destroy);

module.exports = router;
