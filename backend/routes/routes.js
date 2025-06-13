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
  addMemberToGroup,
  leaveGroup,
  removeMemberFromGroup,
} = require("../controllers/groupController");
const { getAllUsers } = require("../controllers/userController");
const authenticateToken = require("../middleware/auth");

router.post("/login", login);
router.post("/sign-up", signUp);
router.post("/validate-token", validateToken);

router.get("/messages/:userId", authenticateToken, getMessages);
router.post("/messages", authenticateToken, postMessage);

router.get("/jokes/:userId", authenticateToken, getJokes);

router.get("/users/:userId/groups", authenticateToken, getGroupsFromUser);
router.get("/users", authenticateToken, getAllUsers);

router.post("/groups", authenticateToken, createGroup);
router.put("/groups/:groupId", authenticateToken, editGroup);
router.delete("/groups/:groupId", authenticateToken, deleteGroup);
router.post("/groups/:groupId/members", authenticateToken, addMemberToGroup);
router.post("/groups/:groupId/members/:memberId", authenticateToken, removeMemberFromGroup);
router.post("/groups/:groupId/leave", authenticateToken, leaveGroup);


module.exports = router;
