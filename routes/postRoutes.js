const express = require("express");
const {
  store,
  index,
  show,
  update,
  destroy,
} = require("../controllers/postController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, store);
router.get("/", index);
router.get("/:id", show);
router.patch("/:id", authMiddleware, update);
router.delete("/:id", authMiddleware, destroy);

module.exports = router;
