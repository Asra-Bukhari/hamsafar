const express = require("express");
const router = express.Router();
const {
  addNotification,
  getAllNotifications,
  getUserNotifications,
  updateNotification,
  deleteNotification
} = require("../controllers/notificationcontroller");

const { authenticateToken } = require("../controllers/authMiddleware");

// CREATE
router.post("/", authenticateToken, addNotification);

// READ
router.get("/", authenticateToken, getAllNotifications);
router.get("/:userid", authenticateToken, getUserNotifications);

// UPDATE
router.patch("/:NotificationID", authenticateToken, updateNotification);
router.put("/:id/read", authenticateToken, updateNotification); // optional second route

// DELETE
router.delete("/:id", authenticateToken, deleteNotification);

module.exports = router;