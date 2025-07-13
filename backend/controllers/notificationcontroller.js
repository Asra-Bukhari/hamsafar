const { poolPromise } = require("../db");
const sql = require("mssql");

// CREATE
exports.addNotification = async (req, res) => {
  try {
    const { userid, message, tripid } = req.body;
    const io = req.app.get("io");

    const pool = await poolPromise; // ✅ FIXED
    await pool.request()
      .input("UserID", sql.Int, userid)
      .input("TripID", sql.Int, tripid || null)
      .input("Message", sql.VarChar(500), message)
      .input("IsRead", sql.Bit, 0)
      .query(`INSERT INTO Notifications (UserID, TripID, Message, IsRead)
              VALUES (@UserID, @TripID, @Message, @IsRead)`);

    if (io) {
      io.emit("new-notification", { userid, message, tripid });
      console.log("🔥 Emitted notification to user:", userid);
    }

    res.status(200).json({ message: "Notification created and sent" });
  } catch (err) {
    console.error("❌ Error creating notification:", err);
    res.status(500).json({ error: "Failed to create notification" });
  }
};

// GET ALL
exports.getAllNotifications = async (req, res) => {
  try {
    const pool = await poolPromise; // ✅ FIXED
    const result = await pool.request()
      .query("SELECT * FROM Notifications");

    res.status(200).json({ notifications: result.recordset });
  } catch (err) {
    console.error("❌ Error fetching notifications:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

// GET BY USER ID
exports.getUserNotifications = async (req, res) => {
  try {
    const { userid } = req.params;
    const pool = await poolPromise; // ✅ FIXED

    const result = await pool.request()
      .input("UserID", sql.Int, userid)
      .query("SELECT * FROM Notifications WHERE UserID = @UserID");

    res.status(200).json({ notifications: result.recordset });
  } catch (err) {
    console.error("❌ Error fetching user notifications:", err);
    res.status(500).json({ error: "Failed to fetch user notifications" });
  }
};

// UPDATE (PATCH)
exports.updateNotification = async (req, res) => {
  try {
    const { NotificationID } = req.params;
    const pool = await poolPromise; // ✅ FIXED

    await pool.request()
      .input("NotificationID", sql.Int, NotificationID)
      .query("UPDATE Notifications SET IsRead = 1 WHERE NotificationID = @NotificationID");

    res.status(200).json({ message: "Notification marked as read" });
  } catch (err) {
    console.error("❌ Error updating notification:", err);
    res.status(500).json({ error: "Failed to update notification" });
  }
};

// DELETE
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise; // ✅ FIXED

    await pool.request()
      .input("NotificationID", sql.Int, id)
      .query("DELETE FROM Notifications WHERE NotificationID = @NotificationID");

    res.status(200).json({ message: "Notification deleted" });
  } catch (err) {
    console.error("❌ Error deleting notification:", err);
    res.status(500).json({ error: "Failed to delete notification" });
  }
};