const express = require("express");
const { create } = require("../controllers/postController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, create);

module.exports = router;
