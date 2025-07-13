
const { poolPromise } = require("../db"); 

const createJoinRequest = async (req, res) => {
  try {
    const { tripRequestID, passengerID } = req.body;

    if (!tripRequestID || !passengerID) {
      return res.status(400).json({ message: "TripRequestID and PassengerID are required." });
    }

    const pool = await poolPromise;
    await pool.request()
      .input("TripRequestID", tripRequestID)
      .input("PassengerID", passengerID)
      .query(`
        INSERT INTO JoinRequests (TripRequestID, PassengerID) 
        VALUES (@TripRequestID, @PassengerID)
      `);

    res.status(201).json({ message: "Join request created successfully." });
  } catch (error) {
    console.error("Error creating join request:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  createJoinRequest,
};
