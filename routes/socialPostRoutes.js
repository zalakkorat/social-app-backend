const express = require("express");
const router = express.Router();
const socialPostController = require("../controllers/socialPostController");

router.post("/createSocialPost", socialPostController.createSocialPost);
router.post("/like", socialPostController.likePost);
router.get("/:postId", socialPostController.getPost);
router.get("/", socialPostController.getPosts);
router.post("/comment", socialPostController.addComment);
router.delete("/delete", socialPostController.deletePost);
router.post("/verifyPost", socialPostController.verifyEmailAndCreatePost);

module.exports = router;
