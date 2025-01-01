const express = require("express");
const {
  create,
  index,
  show,
  update,
} = require("../controllers/postController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, create);
router.get("/", index);
router.get("/:id", show);
router.patch("/:id", authMiddleware, update);

module.exports = router;
