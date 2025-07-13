const express = require("express");
const router = express.Router();
const scheduletripscontroller = require("../controllers/scheduletripscontroller");
const { authenticateToken } = require("../controllers/authMiddleware");
//router.get('/trips/matching-preferences', authenticateToken, scheduletripscontroller.getTripsByUserPreferences);
router.patch('/:TripID',scheduletripscontroller.updateScheduledTripController);
router.get('/', authenticateToken,scheduletripscontroller.getallscheduletrips);
router.post('/',authenticateToken, scheduletripscontroller.addScheduledTrip);
router.delete('/:tripID',authenticateToken, scheduletripscontroller.deleteScheduledTrip);
//router.get("/filter", authenticateToken,scheduletripscontroller.getTripsByFilter);
//router.get("/nearby",authenticateToken, scheduletripscontroller.getTripsByUserLocation);
//router.get("/same-gender",authenticateToken, scheduletripscontroller.getSameGenderTrips);
router.post("/schedule-a-trip", scheduletripscontroller.scheduleTrip);
router.get("/check-in-trip/:userID", scheduletripscontroller.checkUserInTrip);

router.get('/user-completed/:userId', authenticateToken, async (req, res) => {
    const { userId } = req.params;
    const { poolPromise } = require("../db");

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('UserID', userId)
            .query(`
          SELECT st.*, r.RatingID
          FROM ScheduledTrips st
          LEFT JOIN Ratings r ON st.TripID = r.TripID AND r.PassengerID = @UserID
          WHERE st.RequesterID = @UserID AND st.Statuss = 'Completed'
        `);

        res.status(200).json(result.recordset);
    } catch (error) {
        console.error("Error fetching completed trips with ratings:", error);
        res.status(500).json({ message: "Failed to fetch trips." });
    }
});

module.exports = router;
