const sql = require('mssql');
const { poolPromise } = require("../db");

async function getallvehicles() {
    try {
        const pool = await poolPromise; 
        const result = await pool.request().query("SELECT * FROM vehicles");
        return result.recordset;
    } catch (error) {
        throw error;
    }
}


async function addVehicle(name, color, company, typee, capacity) {
    try {
      const pool = await poolPromise;
      const request = pool.request();
  
      request.input("name", sql.VarChar, name);
      request.input("color", sql.VarChar, color);
      request.input("company", sql.VarChar, company);
      request.input("typee", sql.VarChar, typee);
      request.input("capacity", sql.Int, capacity);
  
      const result = await request.query(`
        INSERT INTO Vehicles (Name, Color, Company, Typee, Capacity)
        OUTPUT INSERTED.vehicleID
        VALUES (@name, @color, @company, @typee, @capacity)
      `);
  
      return result.recordset[0].vehicleID;
    } catch (error) {
      throw error;
    }
  }
async function deleteVehicle(vehicleID) {
    try {
        const pool = await poolPromise;
        const request = pool.request();
        request.input('vehicleID', sql.Int, vehicleID);

        await request.query(`
            DELETE FROM Notifications WHERE TripID IN (
                SELECT TripID FROM ScheduledTrips WHERE DriverID IN (
                    SELECT driverID FROM Drivers WHERE vehicleID = @vehicleID
                )
            )
        `);

        await request.query(`
            DELETE FROM ScheduledTrips WHERE DriverID IN (
                SELECT driverID FROM Drivers WHERE vehicleID = @vehicleID
            )
        `);

        const result = await request.query("DELETE FROM Vehicles WHERE vehicleID = @vehicleID");
        return result.rowsAffected[0];
    } catch (error) {
        throw error;
    }
}


async function updateVehicle(vehicleID, vehicleData) {
    try {
        const pool = await poolPromise;  
        const request = pool.request();  

        request.input('VehicleID', sql.Int, vehicleID);
        request.input('Name', sql.VarChar(20), vehicleData.Name || null);
        request.input('Color', sql.VarChar(10), vehicleData.Color || null);
        request.input('Company', sql.VarChar(15), vehicleData.Company || null);
        request.input('Typee', sql.VarChar(7), vehicleData.Typee || null);
        request.input('Capacity', sql.Int, vehicleData.Capacity || null);

        const result = await request.execute('UpdateVehicle');

        return result.rowsAffected[0] > 0;
    } catch (error) {
        throw new Error('Error updating vehicle: ' + error.message);
    }
}

module.exports = {
    getallvehicles,
    addVehicle,
    deleteVehicle,
    updateVehicle
};
