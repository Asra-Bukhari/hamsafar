const ratingsModel = require('../models/ratingsModel');
const { sql, poolPromise } = require('../db');


const updateRating = async (req, res) => {
  const { tripid, passengerid } = req.params; 
  const { rating, review, ratedAt } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('TripID', sql.Int, tripid)
      .input('PassengerID', sql.Int, passengerid)
      .input('Rating', sql.Int, rating || null)
      .input('Review', sql.Text, review || null)
      .input('RatedAt', sql.DateTime, ratedAt || null)
      .query(`
        UPDATE Ratings
        SET Rating = @Rating, Review = @Review, RatedAt = @RatedAt
        WHERE TripID = @TripID AND PassengerID = @PassengerID
      `);

    if (result.rowsAffected[0] > 0) {
      res.status(200).json({ message: 'Rating updated successfully' });
    } else {
      res.status(404).json({ message: 'Rating not found' });
    }
  } catch (err) {
    console.error('Error during database operation:', err);
    res.status(500).json({ error: 'Failed to update rating' });
  }
};

// Get All Ratings
const getAllRatings = async (req, res) => {
  try {
    const ratings = await ratingsModel.getAllRatings();
    res.status(200).json(ratings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ratings', error: error.message });
  }
};


const addRating = async (req, res) => {
  try {
    const { tripid, passengerid, driverid, rating, review } = req.body;

    const success = await ratingsModel.addRating(tripid, passengerid, driverid, rating, review);

    if (success) {
      
      const pool = await poolPromise;
      const tripResult = await pool.request()
        .input("TripID", sql.Int, tripid)
        .query("SELECT DriverID FROM ScheduledTrips WHERE TripID = @TripID");

      res.status(201).json({ message: "Rating submitted successfully" });
    } else {
      res.status(500).json({ message: "Failed to submit rating" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error submitting rating", error: error.message });
  }
};


const deleteRating = async (req, res) => {
  const { tripid, passengerid } = req.params; 

  try {
    const result = await ratingsModel.deleteRating(tripid, passengerid);
    if (result > 0) {
      res.status(200).json({ message: 'Rating deleted successfully' });
    } else {
      res.status(404).json({ message: 'Rating not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting rating', error: error.message });
  }
};

const getDriverRating = async (req, res) => {
  const { driverID } = req.params;

  try {
    const response = await ratingsModel.getDriverRating(driverID);

    if (response.success) {
      return res.json(response);
    } else {
      return res.status(404).json(response);
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


const getRatingsByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserID', sql.Int, userId)
      .query(`
        SELECT * FROM Ratings WHERE PassengerID = @UserID
      `);

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error("Error fetching ratings by user:", err);
    res.status(500).json({ message: "Failed to fetch ratings." });
  }
};

module.exports = {
  getAllRatings,
  addRating,
  deleteRating,
  updateRating,
  getDriverRating,
  getRatingsByUser
};
