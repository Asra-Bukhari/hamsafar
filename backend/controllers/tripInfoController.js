// controllers/tripInfoController.js

const { sql, poolPromise } = require("../db");

exports.getTripDetails = async (req, res) => {
  const { tripID } = req.params;
  try {
    const pool = await poolPromise;

    const tripResult = await pool.request()
      .input('tripID', sql.Int, tripID)
      .query(`
        SELECT t.TripID, t.DriverID, t.StartLocation, t.Destination, t.Statuss, t.DepartureTime, 
               a1.City AS StartCity, a1.Town AS StartTown, a1.Place AS StartPlace,
               a2.City AS DestCity, a2.Town AS DestTown, a2.Place AS DestPlace
        FROM ScheduledTrips t
        JOIN Areas a1 ON t.StartLocation = a1.AreaCode
        JOIN Areas a2 ON t.Destination = a2.AreaCode
        WHERE t.TripID = @tripID
      `);

    const seatsResult = await pool.request()
      .input('tripID', sql.Int, tripID)
      .query(`SELECT AvailableSeats FROM SeatsInfo WHERE TripID = @tripID`);

    const membersResult = await pool.request()
      .input('tripID', sql.Int, tripID)
      .query(`
        SELECT u.Name, u.UserID 
        FROM ScheduledTripPassengers stp
        JOIN Users u ON stp.PassengerID = u.UserID
        WHERE stp.TripID = @tripID
      `);

    const paymentResult = await pool.request()
      .input('tripID', sql.Int, tripID)
      .query(`SELECT SUM(EarnedAmount) AS TotalEarned FROM Payments WHERE TripID = @tripID`);

    res.json({
      trip: tripResult.recordset[0],
      availableSeats: seatsResult.recordset[0]?.AvailableSeats || 0,
      members: membersResult.recordset,
      totalEarned: paymentResult.recordset[0]?.TotalEarned || 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch trip details" });
  }
};

exports.getPendingJoinRequests = async (req, res) => {
  const { tripID } = req.params;
  try {
    const pool = await poolPromise;

    const pendingResult = await pool.request()
      .input('tripID', sql.Int, tripID)
      .query(`
        SELECT jr.JoinRequestID, u.Name, jr.PassengerID
        FROM JoinRequests jr
        JOIN Users u ON jr.PassengerID = u.UserID
        WHERE jr.TripRequestID = @tripID AND jr.Status = 'Pending'
      `);

    res.json(pendingResult.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch pending join requests" });
  }
};

exports.rejectJoinRequest = async (req, res) => {
    const { joinRequestID } = req.params;
    try {
      const pool = await poolPromise;
  
      // First, get the TripID and RequesterID from JoinRequests
      const result = await pool.request()
        .input('joinRequestID', sql.Int, joinRequestID)
        .query(`
          SELECT TripID, RequesterID FROM JoinRequests WHERE JoinRequestID = @joinRequestID
        `);
  
      if (result.recordset.length === 0) {
        return res.status(404).json({ error: "Join request not found" });
      }
  
      const { TripID, RequesterID } = result.recordset[0];
  
      // 1. Update the JoinRequest status
      await pool.request()
        .input('joinRequestID', sql.Int, joinRequestID)
        .query(`
          UPDATE JoinRequests SET Status = 'Rejected' WHERE JoinRequestID = @joinRequestID
        `);
  
      res.json({ message: "Join request rejected" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to reject join request" });
    }
  };

  
exports.acceptJoinRequest = async (req, res) => {
    const { joinRequestID } = req.params;
    try {
      const pool = await poolPromise;
  
      // First, get the TripID and RequesterID from JoinRequests
      const result = await pool.request()
        .input('joinRequestID', sql.Int, joinRequestID)
        .query(`
          SELECT TripRequestID, PassengerID FROM JoinRequests WHERE JoinRequestID = @joinRequestID
        `);
  
      if (result.recordset.length === 0) {
        return res.status(404).json({ error: "Join request not found" });
      }
  
      const { TripRequestID, PassengerID } = result.recordset[0];
  
      // 1. Update the JoinRequest status
      await pool.request()
        .input('joinRequestID', sql.Int, joinRequestID)
        .query(`
          UPDATE JoinRequests SET Status = 'Approved' WHERE JoinRequestID = @joinRequestID
        `);
  
      // 2. Insert into ScheduledTripPassengers
      await pool.request()
        .input('tripID', sql.Int, TripRequestID)
        .input('passengerID', sql.Int, PassengerID)
        .query(`
          INSERT INTO ScheduledTripPassengers (TripID, PassengerID)
          VALUES (@tripID, @passengerID)
        `);
  
      res.json({ message: "Join request accepted and passenger added to trip" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to accept join request" });
    }
  };
  
// controllers/tripInfoController.js

exports.isDriver = async (req, res) => {
    const { tripID, userID } = req.params;
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('tripID', sql.Int, tripID)
        .query(`SELECT DriverID FROM ScheduledTrips WHERE TripID = @tripID`);
  
      if (result.recordset.length === 0) {
        return res.status(404).json({ error: "Trip not found" });
      }
  
      const isDriver = result.recordset[0].DriverID === parseInt(userID);
      res.json({ isDriver });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to verify driver status" });
    }
  };

  // controllers/tripInfoController.js

exports.startTrip = async (req, res) => {
    const { tripID, userID } = req.params;
    try {
      const pool = await poolPromise;
  
      // Verify if the user is the driver
      const result = await pool.request()
        .input('tripID', sql.Int, tripID)
        .query(`SELECT DriverID FROM ScheduledTrips WHERE TripID = @tripID`);
  
      if (result.recordset.length === 0) {
        return res.status(404).json({ error: "Trip not found" });
      }
  
      if (result.recordset[0].DriverID !== parseInt(userID)) {
        return res.status(403).json({ error: "Unauthorized" });
      }
  
      // Update trip status to 'Started'
      await pool.request()
        .input('tripID', sql.Int, tripID)
        .query(`UPDATE ScheduledTrips SET Statuss = 'Ongoing' WHERE TripID = @tripID`);
  
      res.json({ message: "Trip started successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to start trip" });
    }
  };

  exports.startTrip = async (req, res) => {
    const { tripID, userID } = req.params;
    try {
      const pool = await poolPromise;
  
      // Verify if the user is the driver
      const driverResult = await pool.request()
        .input('tripID', sql.Int, tripID)
        .query(`SELECT DriverID FROM ScheduledTrips WHERE TripID = @tripID`);
  
      if (driverResult.recordset.length === 0) {
        return res.status(404).json({ error: "Trip not found" });
      }
  
      if (driverResult.recordset[0].DriverID !== parseInt(userID)) {
        return res.status(403).json({ error: "Unauthorized" });
      }
  
      // Update trip status to 'Ongoing'
      await pool.request()
        .input('tripID', sql.Int, tripID)
        .query(`UPDATE ScheduledTrips SET Statuss = 'Ongoing' WHERE TripID = @tripID`);
  
      res.json({ message: "Trip started successfully" });
    } catch (err) {
      console.error('Error starting trip:', err);
      res.status(500).json({ error: "Failed to start trip" });
    }
  };
  
  // Complete Trip
  exports.completeTrip = async (req, res) => {
    const { tripID } = req.params;
    try {
      const pool = await poolPromise;
  
      const tripResult = await pool.request()
        .input('tripID', sql.Int, tripID)
        .query(`SELECT * FROM ScheduledTrips WHERE TripID = @tripID`);
  
      if (tripResult.recordset.length === 0) {
        return res.status(404).json({ error: "Trip not found" });
      }
  
      await pool.request()
        .input('tripID', sql.Int, tripID)
        .query(`UPDATE ScheduledTrips SET Statuss = 'Completed' WHERE TripID = @tripID`);
  
      res.json({ message: "Trip completed successfully" });
    } catch (err) {
      console.error('Error completing trip:', err);
      res.status(500).json({ error: "Failed to complete trip" });
    }
  };
  
  
  // Mark Payment as Done
  exports.paymentDone = async (req, res) => {
    const { tripID } = req.params;
    try {
      const pool = await poolPromise;
  
      // Check if the payment record exists
      const paymentResult = await pool.request()
        .input('tripID', sql.Int, tripID)
        .query(`SELECT * FROM Payments WHERE TripID = @tripID`);
  
      if (paymentResult.recordset.length === 0) {
        return res.status(404).json({ error: "Payment record not found" });
      }
  
      // Update the Payments table, set Statuss = 'Paid'
      await pool.request()
        .input('tripID', sql.Int, tripID)
        .query(`UPDATE Payments SET Statuss = 'Paid', PaymentDate = GETDATE() WHERE TripID = @tripID`);
  
      res.json({ message: "Payment status updated to Paid" });
    } catch (err) {
      console.error('Error updating payment status:', err);
      res.status(500).json({ error: "Failed to update payment status" });
    }
  };
  
  

  