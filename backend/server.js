const express = require("express");
const bodyParser = require("body-parser");
const { poolPromise } = require("./db");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const sql = require("mssql");

const app = express();
const port = 5000;

// Create HTTP server
const server = http.createServer(app);

// Setup WebSocket server
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

// Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

// Database connection
poolPromise
    .then(pool => {
        console.log("✅ Connected to the database");
    })
    .catch(err => {
        console.error("❌ Database connection failed:", err);
        process.exit(1);
    });

// Attach io to app context so controllers can use it
app.set("io", io);

// WebSocket events
io.on("connection", (socket) => {
    console.log("🔥 Client connected via WebSocket:", socket.id);

    socket.on("disconnect", () => {
        console.log("❌ Client disconnected:", socket.id);
    });
});

// Routes
app.use("/drivers", require("./routes/driversroutes"));
app.use("/areas", require("./routes/areasroutes"));
app.use("/users", require("./Routes/usersroutes"));
app.use("/vehicles", require("./routes/vehiclesroutes"));
app.use("/scheduledtrips", require("./routes/scheduletripsroutes"));
app.use("/payments", require("./routes/paymentsroutes"));
app.use("/friendsgroup", require("./routes/friendsgrouproutes"));
app.use("/triprequests", require("./routes/triprequestsroutes"));
app.use("/ratings", require("./routes/ratingsroutes"));
app.use("/notifications", require("./routes/notificationroutes"));
app.use("/joinrequests", require("./routes/joinRequests"));

const tripInfoRoutes = require('./routes/tripInfoRoutes');
app.use('/api', tripInfoRoutes);

// Notification polling
let lastCheck = new Date();

setInterval(async () => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("lastChecked", sql.DateTime, lastCheck)
            .query(`
                SELECT * FROM Notifications
                WHERE IsRead = 0 
                AND CreatedAt > @lastChecked
                AND Message NOT LIKE '%rating%'
            `);

        const io = app.get("io");

        for (const notification of result.recordset) {
            io.emit("new-notification", {
                userid: notification.UserID,
                tripid: notification.TripID,
                message: notification.Message,
                driverID: notification.DriverID
            });

            await pool.request()
                .input("NotificationID", sql.Int, notification.NotificationID)
                .query("UPDATE Notifications SET IsRead = 1 WHERE NotificationID = @NotificationID");
        }

        lastCheck = new Date(); // move timestamp forward
    } catch (err) {
        console.error("🔴 Notification polling error:", err.message);
    }
}, 5000);

// Start the server
server.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});
