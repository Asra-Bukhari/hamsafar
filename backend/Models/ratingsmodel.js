const sql = require('mssql');
const { poolPromise } = require('../db');

// Get All Ratings
async function getAllRatings() {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Ratings');
    return result.recordset;
  } catch (error) {
    throw error;
  }
}

// Add Rating
async function addRating(tripid, passengerid, driverid, rating, review) {
  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input('tripid', sql.Int, tripid);
    request.input('passengerid', sql.Int, passengerid);
    request.input('driverid', sql.Int, driverid);
    request.input('rating', sql.Int, rating);
    request.input('review', sql.Text, review);

    const result = await request.query(`
      INSERT INTO Ratings (TripID, PassengerID, DriverID, Rating, Review)
      VALUES (@tripid, @passengerid, @driverid, @rating, @review)
    `);

    return result.rowsAffected > 0;
  } catch (error) {
    throw error;
  }
}

// Delete Rating
async function deleteRating(tripid, passengerid) {
  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input('TripID', sql.Int, tripid);
    request.input('PassengerID', sql.Int, passengerid);

    const result = await request.query(`
      DELETE FROM Ratings WHERE TripID = @TripID AND PassengerID = @PassengerID
    `);
    return result.rowsAffected[0];
  } catch (error) {
    throw error;
  }
}

// Get Driver Rating
async function getDriverRating(driverID) {
  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input("driverID", sql.Int, driverID);

    const result = await request.execute("GetDriverAverageRating");

    if (result.recordset.length === 0 || result.recordset[0].TotalRatings === 0) {
      return { success: true, averageRating: null, totalRatings: 0 };
    }

    return {
      success: true,
      averageRating: parseFloat(result.recordset[0].AverageRating).toFixed(2),
      totalRatings: result.recordset[0].TotalRatings,
    };
  } catch (error) {
    console.error("Error fetching driver rating:", error);
    return { success: false, message: "Internal server error" };
  }
}

module.exports = {
  getAllRatings,
  addRating,
  deleteRating,
  getDriverRating
};
