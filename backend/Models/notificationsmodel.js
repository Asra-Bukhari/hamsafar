const { sql, poolPromise } = require('../db');  

async function getallnotifications() {
    try {
        const pool = await poolPromise;  
        const request = pool.request();  
        const result = await request.query("SELECT * FROM Notifications"); 
        return result.recordset;  
    } catch (error) {
        throw error;  
    }
}

async function addnotification(userid, tripid, message, isread) {
    try {
        const pool = await poolPromise; 
        const request = pool.request();  
        request.input("userid", sql.Int, userid); 
        request.input("tripid", sql.Int, tripid);
        request.input("message", sql.VarChar, message);
        request.input("isread", sql.Bit, isread);

        const result = await request.query(`
          INSERT INTO Notifications (UserID, TripID, Message, IsRead)
          VALUES (@userid, @tripid, @message, @isread)
        `);  

        return result.rowsAffected > 0;
    } catch (error) {
        throw error; 
    }
}
async function deleteNotification(notificationID) {
    try {
        const pool = await poolPromise; 
        const request = pool.request();  
        request.input('notificationID', sql.Int, notificationID); 
        const result = await request.query("DELETE FROM Notifications WHERE NotificationID = @notificationID");  
        return result.rowsAffected[0];  
    } catch (error) {
        throw error;  
    }
}

module.exports = {
    getallnotifications,
    addnotification,
    deleteNotification,
};
