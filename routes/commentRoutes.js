const express = require("express");
const { store, index } = require("../controllers/commentController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/:postId", authMiddleware, store);
router.get("/:postId", index);

module.exports = router;
