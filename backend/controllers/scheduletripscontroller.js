const scheduletripsmodel = require("../Models/scheduletripsmodel");
const { sql, poolPromise } = require('../db');
const db = require('../db');  

//changes made here
const scheduleTrip = async (req, res) => {
    try {
      const { DriverID, StartLocation, Destination, DepartureTime } = req.body;
  
      
      const pool = await db.poolPromise;
  
      
      const result = await pool.request()
        .input('DriverID', sql.Int, DriverID)
        .input('StartLocation', sql.Int, StartLocation)
        .input('Destination', sql.Int, Destination)
        .input('DepartureTime', sql.DateTime, DepartureTime)
        .query(`
          INSERT INTO ScheduledTrips (DriverID, StartLocation, Destination, DepartureTime)
          OUTPUT INSERTED.TripID
          VALUES (@DriverID, @StartLocation, @Destination, @DepartureTime)
        `);
  
      const tripID = result.recordset[0].TripID;
  
     
      res.status(201).json({ tripID });
    } catch (error) {
      console.error('Error scheduling trip:', error);
      res.status(500).json({ message: 'Error scheduling trip' });
    }
  };
  

// Changes made here
async function updateScheduledTripController(req, res) {
    const TripID = req.params.TripID;
    const { AvailableSeats, DriverID, Statuss, CurrentLocation, ExpectedDuration, Travelers } = req.body;

    if (!TripID) {
        return res.status(400).json({ message: "TripID is required" });
    }

    try {
        const pool = await poolPromise;

        const tripExists = await pool.request()
            .input('TripID', sql.Int, TripID)
            .query('SELECT COUNT(*) AS count FROM ScheduledTrips WHERE TripID = @TripID');

        if (tripExists.recordset[0].count === 0) {
            return res.status(404).json({ message: "Scheduled trip not found" });
        }

        // Fetch old status for notification logic
        const oldStatusResult = await pool.request()
            .input('TripID', sql.Int, TripID)
            .query('SELECT Statuss FROM ScheduledTrips WHERE TripID = @TripID');

        const oldStatus = oldStatusResult.recordset[0]?.Statuss;

        // Update ScheduledTrips table
        await pool.request()
            .input('TripID', sql.Int, TripID)
            .input('DriverID', sql.Int, DriverID || null)
            .input('Statuss', sql.VarChar, Statuss || null)
            .input('CurrentLocation', sql.Int, CurrentLocation || null)
            .input('ExpectedDuration', sql.Int, ExpectedDuration || null)
            .query(`
                UPDATE ScheduledTrips
                SET 
                    DriverID = COALESCE(@DriverID, DriverID),
                    Statuss = COALESCE(@Statuss, Statuss),
                    CurrentLocation = COALESCE(@CurrentLocation, CurrentLocation),
                    ExpectedDuration = COALESCE(@ExpectedDuration, ExpectedDuration)
                WHERE TripID = @TripID;
            `);

        // Update AvailableSeats in SeatsInfo if provided
        if (AvailableSeats !== undefined && AvailableSeats !== null) {
            await pool.request()
                .input('TripID', sql.Int, TripID)
                .input('AvailableSeats', sql.Int, AvailableSeats)
                .query(`
                    UPDATE SeatsInfo 
                    SET AvailableSeats = @AvailableSeats 
                    WHERE TripID = @TripID;
                `);
        }

        // Update Travelers in ScheduledTripPassengers
        if (Travelers && Array.isArray(Travelers)) {
            // Delete existing passengers
            await pool.request()
                .input('TripID', sql.Int, TripID)
                .query('DELETE FROM ScheduledTripPassengers WHERE TripID = @TripID');

            // Insert new passengers
            for (const passengerID of Travelers) {
                await pool.request()
                    .input('TripID', sql.Int, TripID)
                    .input('PassengerID', sql.Int, passengerID)
                    .query(`
                        INSERT INTO ScheduledTripPassengers (TripID, PassengerID)
                        VALUES (@TripID, @PassengerID);
                    `);
            }
        }

        // Emit notification if trip just got completed
        if (oldStatus !== 'Completed' && Statuss === 'Completed') {
            const tripInfo = await pool.request()
                .input('TripID', sql.Int, TripID)
                .query('SELECT DriverID FROM ScheduledTrips WHERE TripID = @TripID');

            const { DriverID: FinalDriverID } = tripInfo.recordset[0];

            const io = req.app.get('io');
            if (io && FinalDriverID) {
                io.emit('new-notification', {
                    message: `🎉 Your trip #${TripID} has been completed. Click to rate your driver.`,
                    userid: FinalDriverID,
                    tripid: TripID,
                    driverID: FinalDriverID
                });
            }
        }

        return res.status(200).json({ message: "Scheduled Trip Updated Successfully" });

    } catch (err) {
        console.error("Error in updating scheduled trip:", err);
        return res.status(500).json({ message: 'Server Error', error: err.message });
    }
}

// No change needed
async function getallscheduletrips(req, res) {
    try {
        const scheduletrips = await scheduletripsmodel.getallscheduletrips();
        res.status(200).json(scheduletrips);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching scheduled trips', error: error.message });
    }
}

// Changes made here
async function addScheduledTrip(req, res) {
    try {
        const {
            availableSeats,
            driverID,
            startLocation,
            destination,
            statuss,
            currentLocation,
            expectedDuration,
            departureTime,
            travelers // Will be handled separately for passengers
        } = req.body;

       
        if (!driverID || !startLocation || !destination || !statuss || !departureTime) {
            return res.status(400).json({ message: "Missing required trip data" });
        }

        const tripInsertSuccess = await scheduletripsmodel.addScheduledTrip({
            driverID,
            startLocation,
            destination,
            statuss,
            currentLocation,
            expectedDuration,
            departureTime
        });

        if (tripInsertSuccess) {
            // Insert into SeatsInfo for AvailableSeats
            const seatsInsertSuccess = await scheduletripsmodel.addSeatsInfo({
                tripID: tripInsertSuccess.tripID,
                availableSeats
            });

            if (seatsInsertSuccess) {
                // Insert travelers into ScheduledTripPassengers table
                if (travelers && travelers.length > 0) {
                    await scheduletripsmodel.addTravelers({
                        tripID: tripInsertSuccess.tripID,
                        travelers
                    });
                }
                return res.status(201).json({ message: "Scheduled trip added successfully", tripID: tripInsertSuccess.tripID });
            }
        }

        return res.status(500).json({ message: "Failed to add scheduled trip" });
    } catch (error) {
        console.error("Error adding scheduled trip:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}

// No changes needed further
async function deleteScheduledTrip(req, res) {
    try {
        const tripID = parseInt(req.params.tripID, 10);
        const result = await scheduletripsmodel.deleteScheduledTrip(tripID);
        if (result > 0) {
            res.status(200).json({ message: 'Scheduled trip deleted successfully' });
        } else {
            res.status(404).json({ message: 'Scheduled trip not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting scheduled trip', error: error.message });
    }
}

async function insertScheduledTrip(req, res) {
    const { availableSeats, driverID, startLocation, destination, statuss, currentLocation, expectedDuration, departureTime, travelers } = req.body;

    
    if (!driverID || !startLocation || !destination || !statuss || !departureTime) {
        return res.status(400).json({ message: "Missing required trip data" });
    }

    try {
       
        const vehicleResult = await pool.request()
            .input('driverID', sql.Int, driverID)
            .query(`
                SELECT v.Capacity
                FROM Drivers d
                INNER JOIN Vehicles v ON d.vehicleID = v.vehicleID
                WHERE d.driverID = @driverID
            `);

        if (vehicleResult.recordset.length === 0) {
            return res.status(404).json({ message: "Driver's vehicle not found" });
        }

        const vehicleCapacity = vehicleResult.recordset[0].Capacity;

        
        const tripInsertSuccess = await scheduletripsmodel.addScheduledTrip({
            driverID,
            startLocation,
            destination,
            statuss,
            currentLocation,
            expectedDuration,
            departureTime
        });

        if (tripInsertSuccess) {
            console.log("Trip inserted with ID:", tripInsertSuccess.tripID);
        
            const seatsInsertSuccess = await scheduletripsmodel.addSeatsInfo({
                tripID: tripInsertSuccess.tripID,
                availableSeats
            });
        
            console.log("Seats Info Insertion Success:", seatsInsertSuccess);
        
            if (seatsInsertSuccess) {
                if (travelers && travelers.length > 0) {
                    await scheduletripsmodel.addTravelers({
                        tripID: tripInsertSuccess.tripID,
                        travelers
                    });
                }
                return res.status(201).json({ message: "Scheduled trip added successfully", tripID: tripInsertSuccess.tripID });
            } else {
                console.log("SeatsInfo insert failed.");
            }
        }

        return res.status(500).json({ message: "Failed to add scheduled trip" });
    } catch (error) {
        console.error("Error adding scheduled trip:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}

//changes made
const checkUserInTrip = async (req, res) => {
    const userID = req.params.userID;  

    try {
        const pool = await poolPromise;

       
        const driverResult = await pool.request()
            .input('userID', sql.Int, userID)
            .query(`
                SELECT st.TripID, st.Statuss
                FROM ScheduledTrips st
                WHERE st.DriverID = @userID AND st.Statuss IN ('Requested', 'Scheduled', 'Ongoing')
            `);

        if (driverResult.recordset.length > 0) {
            return res.json({
                inTrip: true,
                role: 'Driver',
                tripID: driverResult.recordset[0].TripID,
                tripStatus: driverResult.recordset[0].Statuss
            });
        }

        // Check if user is a Passenger in any active trip
        const passengerResult = await pool.request()
            .input('userID', sql.Int, userID)
            .query(`
                SELECT stp.TripID, st.Statuss
                FROM ScheduledTripPassengers stp
                INNER JOIN ScheduledTrips st ON stp.TripID = st.TripID
                WHERE stp.PassengerID = @userID AND st.Statuss IN ('Requested', 'Scheduled', 'Ongoing')
            `);

        if (passengerResult.recordset.length > 0) {
            return res.json({
                inTrip: true,
                role: 'Passenger',
                tripID: passengerResult.recordset[0].TripID,
                tripStatus: passengerResult.recordset[0].Statuss
            });
        }

        
        res.json({ inTrip: false });

    } catch (err) {
        console.error("Error checking user's trip status:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};


module.exports = {
    checkUserInTrip,
    insertScheduledTrip,
    getallscheduletrips,
    addScheduledTrip,
    scheduleTrip,
    deleteScheduledTrip,
    updateScheduledTripController
};
