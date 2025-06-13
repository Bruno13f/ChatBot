const express = require("express");
const router = express.Router();

const {
  login,
  signUp,
  validateToken,
} = require("../controllers/authController");
const {
  getMessages,
  postMessage,
  getJokes,
} = require("../controllers/messageController");
const {
  createGroup,
  getGroupsFromUser,
  editGroup,
  deleteGroup,
} = require("../controllers/groupController");
const authenticateToken = require("../middleware/auth");

router.post("/login", login);
router.post("/sign-up", signUp);
router.post("/validate-token", validateToken);

router.get("/messages/:userId", authenticateToken, getMessages);
router.post("/messages", authenticateToken, postMessage);

router.get("/jokes/:userId", authenticateToken, getJokes);

router.get("/users/:userId/groups", authenticateToken, getGroupsFromUser);
router.post("/groups", authenticateToken, createGroup);
router.put("/groups/:groupId", authenticateToken, editGroup);
router.delete("/groups/:groupId", authenticateToken, deleteGroup);

module.exports = router;
