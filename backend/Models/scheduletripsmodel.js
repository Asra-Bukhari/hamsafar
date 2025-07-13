const { sql, poolPromise } = require('../db');

const addSeatsInfo = async ({ tripID, availableSeats }) => {
  try {
      const pool = await poolPromise;

      const result = await pool.request()
          .input('TripID', sql.Int, tripID)
          .input('AvailableSeats', sql.Int, availableSeats)
          .query(`
              INSERT INTO SeatsInfo (TripID, AvailableSeats)
              VALUES (@TripID, @AvailableSeats)
          `);

      console.log("SeatsInfo Insert Result:", result);

      return result.rowsAffected[0] > 0;
  } catch (error) {
      console.error("Error inserting into SeatsInfo:", error);
      return false;
  }
};

async function updateScheduledTrip(tripData) {
  const { TripID, AvailableSeats, DriverID, Statuss, CurrentLocation, ExpectedDuration, Travelers } = tripData;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('TripID', sql.Int, TripID)
      .input('AvailableSeats', sql.Int, AvailableSeats || null)
      .input('DriverID', sql.Int, DriverID || null)
      .input('Statuss', sql.VarChar, Statuss || null)
      .input('CurrentLocation', sql.Int, CurrentLocation || null)
      .input('ExpectedDuration', sql.Int, ExpectedDuration || null)
      .input('Travelers', sql.Text, Travelers || null)
      .execute('UpdateScheduledTrip');

    return result;
  } catch (error) {
    console.error("Error in updating scheduled trip: ", error);
    throw error;
  }
}

// No change needed
async function getallscheduletrips() {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM ScheduledTrips");
    return result.recordset;
  } catch (error) {
    throw error;
  }
}

// Changes made here
async function addScheduledTrip({
  driverID, startLocation, destination, statuss, currentLocation,
  expectedDuration, departureTime
}) {
  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input("driverID", sql.Int, driverID);
    request.input("startLocation", sql.Int, startLocation);
    request.input("destination", sql.Int, destination);
    request.input("statuss", sql.VarChar(12), statuss);
    request.input("currentLocation", sql.Int, currentLocation || startLocation);
    request.input("expectedDuration", sql.Int, expectedDuration || 45);
    request.input("departureTime", sql.DateTime, departureTime);

    const result = await request.query(`
      INSERT INTO ScheduledTrips (
        DriverID, StartLocation, Destination, Statuss,
        CurrentLocation, ExpectedDuration, DepartureTime
      )
      VALUES (
        @driverID, @startLocation, @destination, @statuss,
        @currentLocation, @expectedDuration, @departureTime
      );

      SELECT SCOPE_IDENTITY() AS TripID;
    `);

    return { tripID: result.recordset[0].TripID };
  } catch (error) {
    console.error("Error in adding scheduled trip: ", error);
    throw error;
  }
}


// Changes made here
async function addTravelers({ tripID, travelers }) {
  try {
    const pool = await poolPromise;
    const request = pool.request();

    for (const passengerID of travelers) {
      await request.input("tripID", sql.Int, tripID)
        .input("passengerID", sql.Int, passengerID)
        .query(`
          INSERT INTO ScheduledTripPassengers (TripID, PassengerID)
          VALUES (@tripID, @passengerID);
        `);
    }

    return true;
  } catch (error) {
    console.error("Error adding travelers: ", error);
    throw error;
  }
}

module.exports = {
  updateScheduledTrip,
  getallscheduletrips,
  addScheduledTrip,
  addSeatsInfo,
  addTravelers
};
