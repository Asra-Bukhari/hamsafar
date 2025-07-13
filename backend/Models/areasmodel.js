const sql = require('mssql');
const { poolPromise } = require('../db');  



async function updateAreaUsingSP(areaCode, city, town, road, block, sector, place, nearbyAreas) {
  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input("AreaCode", sql.Int, areaCode)
      .input("City", sql.VarChar(500), city)
      .input("Town", sql.VarChar(500), town)
      .input("Road", sql.VarChar(500), road)
      .input("Block", sql.Int, block)
      .input("Sector", sql.VarChar(500), sector)
      .input("Place", sql.VarChar(500), place)
      .input("NearbyAreas", sql.Text, nearbyAreas)
      .execute("UpdateArea");

    return result;
  } catch (error) {
    throw error;
  }
}

async function CreateArea(area) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('AreaCode', sql.Int, area.AreaCode)
    .input('City', sql.VarChar(500), area.City)
    .input('Town', sql.VarChar(500), area.Town)
    .input('Road', sql.VarChar(500), area.Road || null)
    .input('Block', sql.Int, area.Block || null)
    .input('Sector', sql.VarChar(500), area.Sector || null)
    .input('Place', sql.VarChar(500), area.Place)
    .input('NearbyAreas', sql.Text, area.NearbyAreas || null)
    .input('Latitude', sql.Float, area.Latitude)
    .input('Longitude', sql.Float, area.Longitude)
    .query(`INSERT INTO Areas (AreaCode, City, Town, Road, Block, Sector, Place, NearbyAreas, latitude, longitude)
            VALUES (@AreaCode, @City, @Town, @Road, @Block, @Sector, @Place, @NearbyAreas, @Latitude, @Longitude)`);
  return result;
}

async function getNextAreaCode() {
  const pool = await poolPromise;
  const result = await pool.request().query("SELECT ISNULL(MAX(AreaCode), 0) + 1 AS NextCode FROM Areas");
  return result.recordset[0].NextCode;
}


const insertArea = async ({ city, town, place, latitude, longitude }) => {
  const pool = await poolPromise;

  // Get max AreaCode first
  const maxResult = await pool.request().query(`SELECT ISNULL(MAX(AreaCode), 0) AS MaxCode FROM Areas`);
  const maxCode = maxResult.recordset[0].MaxCode;
  const nextCode = maxCode + 1;

  // Now insert using nextCode
  const result = await pool
    .request()
    .input("AreaCode", sql.Int, nextCode)
    .input("City", sql.VarChar(500), city)
    .input("Town", sql.VarChar(500), town || place || null)
    .input("Place", sql.VarChar(500), place)
    .input("Latitude", sql.Float, latitude)
    .input("Longitude", sql.Float, longitude)
    .query(`
      INSERT INTO Areas (AreaCode, City, Town, Place, Latitude, Longitude)
      VALUES (@AreaCode, @City, @Town, @Place, @Latitude, @Longitude)
    `);

  return result;
};


async function getAreaByCode(areaCode) {
  const pool = await poolPromise;
  const result = await pool.request()
      .input('AreaCode', sql.Int, areaCode)
      .query('SELECT * FROM Areas WHERE AreaCode = @AreaCode');

  return result.recordset.length ? result.recordset[0] : null;
}


async function getallareas() {
  try {
    const pool = await poolPromise;
    const request = pool.request();
    const result = await request.query("SELECT * FROM Areas");
    return result.recordset;
  } catch (error) {
    console.error("Error fetching areas:", error);
    throw error;
  }
}


async function deleteAreaByCode(areaCode) {
  try {
    const pool = await poolPromise;

    const reqUsers = pool.request();
    reqUsers.input('areaCode', sql.Int, areaCode);
    const usersResult = await reqUsers.query(`
      SELECT userID 
      FROM Users
      WHERE CurrentArea = @areaCode
         OR Preference1 = @areaCode
         OR Preference2 = @areaCode
         OR Preference3 = @areaCode
         OR RecentTrip = @areaCode
    `);

    const userIDs = usersResult.recordset.map(row => row.userID);

    if (userIDs.length > 0) {
      const reqDrivers = pool.request();
      const driversResult = await reqDrivers.query(`
        SELECT driverID 
        FROM Drivers 
        WHERE driverID IN (${userIDs.join(',')})
      `);

      const driverIDs = driversResult.recordset.map(row => row.driverID);

      if (driverIDs.length > 0) {
        const driverIDsStr = driverIDs.join(',');
        const reqNotifs = pool.request();
        await reqNotifs.query(`
          DELETE FROM Notifications
          WHERE TripID IN (
            SELECT TripID FROM ScheduledTrips 
            WHERE DriverID IN (${driverIDsStr})
          )
        `);

        const reqTrips = pool.request();
        await reqTrips.query(`
          DELETE FROM ScheduledTrips 
          WHERE DriverID IN (${driverIDsStr})
        `);
      }

      const reqDelUsers = pool.request();
      await reqDelUsers.query(`
        DELETE FROM Users
        WHERE CurrentArea = @areaCode
           OR Preference1 = @areaCode
           OR Preference2 = @areaCode
           OR Preference3 = @areaCode
           OR RecentTrip = @areaCode
      `);
    }
    const reqArea = pool.request();
    reqArea.input('areaCode', sql.Int, areaCode);
    const result = await reqArea.query("DELETE FROM Areas WHERE AreaCode = @areaCode");

    return result.rowsAffected[0];
  } catch (error) {
    throw error;
  }
}



module.exports = {
 
  getallareas,
  deleteAreaByCode,
  getAreaByCode,
  updateAreaUsingSP,
  insertArea,
  CreateArea,
  getNextAreaCode,
};
