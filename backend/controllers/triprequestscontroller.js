const triprequestsmodel = require('../models/triprequestsmodel');
const { poolPromise } = require("../db");
const sql = require("mssql");

const getNearbyTrips = async (req, res) => {
  const { latitude, longitude } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({ error: "Latitude and Longitude are required." });
  }

  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT 
        tr.*,
        a.City AS PickupCity,
        a.Town AS PickupTown,
        a.latitude AS PickupLat,
        a.longitude AS PickupLng,
        u.Name AS DriverName
      FROM ScheduledTrips tr
      JOIN Areas a ON tr.StartLocation = a.AreaCode
      JOIN Users u ON tr.DriverID = u.UserID
      WHERE 
        (
          6371 * ACOS(
            COS(RADIANS(31.5204))
            * COS(RADIANS(a.latitude))
            * COS(RADIANS(a.longitude) - RADIANS(74.3587))
            + SIN(RADIANS(31.5204)) * SIN(RADIANS(a.latitude))
          )
        ) <= 4
        AND tr.Statuss = 'Requested'
    `);

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error("Error fetching nearby trips:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

async function getalltriprequests(req, res) {
    try {
        const triprequests = await triprequestsmodel.getalltriprequests();
        res.status(200).json(triprequests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching trip requests', error: error.message });
    }
}

async function addtriprequest(req, res) {
    try {
        const { passengerid, pickuplocation, dropofflocation, tripdatetime, statuss } = req.body;

        if (!passengerid || !pickuplocation || !dropofflocation || !tripdatetime) {
            return res.status(400).json({ message: 'Missing required trip request data' });
        }

        const success = await triprequestsmodel.addtriprequest(passengerid, pickuplocation, dropofflocation, tripdatetime, statuss);

        if (success) {
            res.status(201).json({ message: 'Trip request created successfully' });
        } else {
            res.status(500).json({ message: 'Failed to create trip request' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error creating trip request', error: error.message });
    }
}

async function deleteTripRequest(req, res) {
    try {
        const requestID = parseInt(req.params.requestID, 10);
        const result = await triprequestsmodel.deleteTripRequest(requestID);
        if (result > 0) {
            res.status(200).json({ message: 'Trip request deleted successfully' });
        } else {
            res.status(404).json({ message: 'Trip request not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting trip request', error: error.message });
    }
}

const updateTripRequestController = async (req, res) => {
    const { RequestID } = req.params;
    const { PickupLocation, DropoffLocation, TripDateTime, Statuss } = req.body;

    try {
        const result = await triprequestsmodel.updateTripRequest({
            RequestID,
            PickupLocation,
            DropoffLocation,
            TripDateTime,
            Statuss
        });

        if (result.rowsAffected[0] > 0) {
            res.status(200).json({
                message: 'Trip Request Updated Successfully',
                result
            });
        } else {
            res.status(404).json({ message: 'Trip Request not found or no changes made' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

exports.getNearbyTrips = async (req, res) => {
    const { latitude, longitude } = req.query;
  
    if (!latitude || !longitude) {
      return res.status(400).json({ error: "Latitude and Longitude are required." });
    }
  
    try {
      const pool = await poolPromise;
  
      // Haversine formula to calculate distance between points
      const result = await pool.request().query(`
        SELECT 
          tr.*,
          a.City AS PickupCity,
          a.Town AS PickupTown,
          a.latitude AS PickupLat,
          a.longitude AS PickupLng,
          u.Name AS PassengerName
        FROM TripRequests tr
        JOIN Areas a ON tr.PickupLocation = a.AreaCode
        JOIN Users u ON tr.PassengerID = u.UserID
        WHERE 
          (
            6371 * ACOS(
              COS(RADIANS(${latitude}))
              * COS(RADIANS(a.latitude))
              * COS(RADIANS(a.longitude) - RADIANS(${longitude}))
              + SIN(RADIANS(${latitude})) * SIN(RADIANS(a.latitude))
            )
          ) <= 4
          AND tr.Statuss = 'Pending'
      `);
  
      res.status(200).json(result.recordset);
    } catch (err) {
      console.error("Error fetching nearby trips:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  const respondToTripInvite = async (req, res) => {
    const { requestID } = req.params;
    const { response } = req.body; // should be 'Accepted' or 'Declined'

    if (!['Accepted', 'Declined'].includes(response)) {
        return res.status(400).json({ message: 'Invalid response value' });
    }

    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .input('requestID', sql.Int, requestID)
            .input('response', sql.VarChar, response)
            .query(`
                UPDATE TripRequests
                SET Statuss = @response
                WHERE RequestID = @requestID
            `);

        if (result.rowsAffected[0] > 0) {
            res.status(200).json({ message: "Trip ${ response.toLowerCase() } successfully." });
    } else {
        res.status(404).json({ message: 'Trip request not found' });
    }

} catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
}
};

const createTripWithGroup = async (req, res) => {
  const { adminID, groupNo, pickuplocation, dropofflocation, tripdatetime } = req.body;

  if (!adminID || groupNo === undefined || !pickuplocation || !dropofflocation || !tripdatetime) {
      return res.status(400).json({
          message: "Missing required trip data.",
          debug: {
              adminID, groupNo, pickuplocation, dropofflocation, tripdatetime
          }
      });
  }

  try {
      const pool = await poolPromise;

      // 1. Get group members
      const groupResult = await pool.request()
          .input('groupNo', sql.Int, groupNo)
          .query('SELECT OtherMembers FROM FriendsGroup WHERE GroupNo = @groupNo');

      if (groupResult.recordset.length === 0) {
          return res.status(404).json({ message: 'Group not found' });
      }

      const membersCSV = groupResult.recordset[0].OtherMembers;
      const memberIDs = membersCSV ? membersCSV.split(',').map(id => parseInt(id.trim())) : [];

      // 2. Insert the trip (as a request by admin)
      const insertTrip = await pool.request()
          .input('passengerid', sql.Int, adminID)
          .input('pickuplocation', sql.Int, pickuplocation)
          .input('dropofflocation', sql.Int, dropofflocation)
          .input('tripdatetime', sql.DateTime, tripdatetime)
          .input('statuss', sql.VarChar, 'Pending')
          .query(`
              INSERT INTO TripRequests (PassengerID, PickupLocation, DropoffLocation, TripDateTime, Statuss)
              OUTPUT INSERTED.RequestID
              VALUES (@passengerid, @pickuplocation, @dropofflocation, @tripdatetime, @statuss)
          `);

      const mainRequestID = insertTrip.recordset[0].RequestID;

      // 3. Add trip requests for all group members
      for (const memberID of memberIDs) {
          await pool.request()
              .input('passengerid', sql.Int, memberID)
              .input('pickuplocation', sql.Int, pickuplocation)
              .input('dropofflocation', sql.Int, dropofflocation)
              .input('tripdatetime', sql.DateTime, tripdatetime)
              .input('statuss', sql.VarChar, 'Pending')
              .query(`
                  INSERT INTO TripRequests (PassengerID, PickupLocation, DropoffLocation, TripDateTime, Statuss)
                  VALUES (@passengerid, @pickuplocation, @dropofflocation, @tripdatetime, @statuss)
              `);
      }

      res.status(201).json({
          message: 'Trip created and group members invited',
          tripRequestID: mainRequestID
      });

  } catch (err) {
      console.error("❌ Error creating trip with group:", err);
      res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getTripsForPassenger = async (req, res) => {
  const passengerID = parseInt(req.params.passengerID);

  try {
      const pool = await poolPromise;

      const result = await pool.request()
          .input('passengerID', sql.Int, passengerID)
          .query(`
              SELECT * FROM TripRequests
              WHERE PassengerID = @passengerID
              ORDER BY TripDateTime DESC
          `);

      res.status(200).json(result.recordset);
  } catch (err) {
      res.status(500).json({ message: 'Failed to fetch trip requests', error: err.message });
  }
};

module.exports = {
    getNearbyTrips,
    getalltriprequests,
    addtriprequest,
    deleteTripRequest,
    updateTripRequestController,
    createTripWithGroup,
    getTripsForPassenger,
    respondToTripInvite,
};
