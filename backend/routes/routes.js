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
  getOpenAI,
  getWeather,
} = require("../controllers/messageController");
const {
  createGroup,
  getGroupsFromUser,
  editGroup,
  deleteGroup,
  deleteGroupPicture,
  addMemberToGroup,
  leaveGroup,
  removeMemberFromGroup,
} = require("../controllers/groupController");
const {
  getAllUsers,
  getUserById,
  updateUser,
} = require("../controllers/userController");
const authenticateToken = require("../middleware/auth");
const upload = require("../middleware/upload");

router.post("/login", login);
router.post("/sign-up", signUp);
router.post("/validate-token", validateToken);

router.get("/jokes/:userId", authenticateToken, getJokes);

router.post("/groups/:groupId/messages", authenticateToken, postMessage);
router.get("/groups/:groupId/messages", authenticateToken, getMessages);
router.get("/groups/:groupId/jokes", authenticateToken, getJokes);
router.get("/groups/:groupId/openAI", authenticateToken, getOpenAI);
router.get("/groups/:groupId/weather", authenticateToken, getWeather);
router.get("/users/:userId/groups", authenticateToken, getGroupsFromUser);
router.get("/users", authenticateToken, getAllUsers);
router.get("/users/:userId", authenticateToken, getUserById);
router.put(
  "/users/:userId",
  authenticateToken,
  upload.single("profilePicture"),
  updateUser
);

router.post(
  "/groups",
  authenticateToken,
  upload.single("groupPicture"),
  createGroup
);
router.put(
  "/groups/:groupId",
  authenticateToken,
  upload.single("groupPicture"),
  editGroup
);
router.delete("/groups/:groupId", authenticateToken, deleteGroup);
router.delete(
  "/groups/:groupId/picture",
  authenticateToken,
  deleteGroupPicture
);
router.post("/groups/:groupId/members", authenticateToken, addMemberToGroup);
router.post(
  "/groups/:groupId/members/:memberId",
  authenticateToken,
  removeMemberFromGroup
);
router.post("/groups/:groupId/leave", authenticateToken, leaveGroup);

module.exports = router;
