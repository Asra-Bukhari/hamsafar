const sql = require('mssql');
const { poolPromise } = require("../db"); 

const updateDriver = async (driverID, vehicleID, driverStatus, availability) => {
  try {
    const pool = await poolPromise;
    const request = pool.request();

    request.input("DriverID", sql.Int, driverID);
    request.input("VehicleID", sql.Int, vehicleID);
    request.input("DriverStatus", sql.VarChar(12), driverStatus);
    request.input("Availability", sql.VarChar(3), availability);

    const result = await request.execute("UpdateDriver");

    return { message: "Update Completed" };
  } catch (error) {
    console.error("Database Error:", error);
    if (error.originalError && error.originalError.message) {
      throw new Error(error.originalError.message);
    }
    throw new Error("Failed to update driver");
  }
};

async function getalldrivers() {
  try {
    const pool = await poolPromise;
    const request = pool.request();
    const result = await request.query('SELECT * FROM Drivers');
    return result.recordset;
  } catch (error) {
    throw error;
  }
}

async function addDriver(driverID, vehicleID, driverStatus, availability) {
  try {
    const pool = await poolPromise;
    const request = pool.request();

    request.input("driverID", sql.Int, driverID);
    request.input("vehicleID", sql.Int, vehicleID);
    request.input("driverStatus", sql.VarChar, driverStatus);
    request.input("availability", sql.VarChar, availability);

    const result = await request.query(`
      INSERT INTO Drivers (driverID, vehicleID, DriverStatus, Availability)
      VALUES (@driverID, @vehicleID, @driverStatus, @availability)
    `);

    return result.rowsAffected > 0;
  } catch (error) {
    throw error;
  }
}

async function deleteDriver(driverID) {
  try {
    const pool = await poolPromise;

    const requestNotif = pool.request();
    requestNotif.input('driverID', sql.Int, driverID);
    await requestNotif.query(`
      DELETE FROM Notifications
      WHERE TripID IN (
        SELECT TripID FROM ScheduledTrips WHERE DriverID = @driverID
      )
    `);

    const requestTrips = pool.request();
    requestTrips.input('driverID', sql.Int, driverID);
    await requestTrips.query("DELETE FROM ScheduledTrips WHERE DriverID = @driverID");

    const requestDriver = pool.request();
    requestDriver.input('driverID', sql.Int, driverID);
    const result = await requestDriver.query("DELETE FROM Drivers WHERE driverID = @driverID");
    return result.rowsAffected[0];
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getalldrivers,
  addDriver,
  deleteDriver,
  updateDriver
};
