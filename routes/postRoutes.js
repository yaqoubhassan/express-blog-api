const express = require("express");
const { create, index } = require("../controllers/postController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, create);
router.get("/", index);

module.exports = router;
