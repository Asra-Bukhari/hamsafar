const { sql, poolPromise } = require('../db');

async function updateScheduledTrip(tripData) {
    const { TripID, AvailableSeats, DriverID, Statuss, CurrentLocation, ExpectedDuration, Travelers } = tripData;

    try {
        const pool = await poolPromise;

        // Update ScheduledTrips
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

        // Update SeatsInfo
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

        // Update ScheduledTripPassengers
        if (Travelers && Array.isArray(Travelers)) {
            await pool.request()
                .input('TripID', sql.Int, TripID)
                .query('DELETE FROM ScheduledTripPassengers WHERE TripID = @TripID');

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

        return { success: true, message: 'Scheduled trip updated successfully' };

    } catch (error) {
        console.error("Error in updating scheduled trip: ", error);
        throw error;
    }
}


async function getalltriprequests() {
    try {
        const pool = await poolPromise;
        const request = pool.request();
        const result = await request.query("SELECT * FROM TripRequests");
        return result.recordset;
    } catch (error) {
        throw error;
    }
}

async function addtriprequest(passengerid, pickuplocation, dropofflocation, tripdatetime, statuss) {
    try {
        const pool = await poolPromise;
        const request = pool.request();
        request.input("passengerid", sql.Int, passengerid);
        request.input("pickuplocation", sql.Int, pickuplocation);
        request.input("dropofflocation", sql.Int, dropofflocation);
        request.input("tripdatetime", sql.DateTime, tripdatetime);
        request.input("statuss", sql.VarChar, statuss);

        const result = await request.query(`
            INSERT INTO TripRequests (PassengerID, PickupLocation, DropoffLocation, TripDateTime, Statuss)
            VALUES (@passengerid, @pickuplocation, @dropofflocation, @tripdatetime, @statuss)
        `);

        return result.rowsAffected > 0;
    } catch (error) {
        throw error;
    }
}

async function deleteTripRequest(requestID) {
    try {
        const pool = await poolPromise;
        const request = pool.request();
        request.input('requestID', sql.Int, requestID);
        const result = await request.query("DELETE FROM TripRequests WHERE RequestID = @requestID");
        return result.rowsAffected[0];
    } catch (error) {
        throw error;
    }
}


  
module.exports = {
    getNearbyTrips,
    getalltriprequests,
    addtriprequest,
    deleteTripRequest,
    updateTripRequest
};
