const express = require("express");
const { store } = require("../controllers/commentController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/:postId", authMiddleware, store);

module.exports = router;
