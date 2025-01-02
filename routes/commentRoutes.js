const express = require("express");
const {
  store,
  index,
  update,
  destroy,
} = require("../controllers/commentController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/:postId", authMiddleware, store);
router.get("/:postId", index);
router.patch("/:commentId", authMiddleware, update);
router.delete("/:commentId", authMiddleware, destroy);

module.exports = router;
