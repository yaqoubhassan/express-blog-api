const express = require("express");
const { create, index, show } = require("../controllers/postController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, create);
router.get("/", index);
router.get("/:id", show);

module.exports = router;
