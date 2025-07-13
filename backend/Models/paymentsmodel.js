const { sql, poolPromise } = require('../db');

async function getAllPayments() {
  try {
    const pool = await poolPromise; 
    const result = await pool.request().query('SELECT * FROM Payments'); 
    return result.recordsets; 
  } catch (error) {
    throw new Error('Error fetching payments: ' + error.message);
  }
}

async function addPayment(tripID, earnedAmount, statuss, paymentDate) {
  try {
    const pool = await poolPromise; 
    const request = pool.request();
    request.input("tripID", sql.Int, tripID);
    request.input("earnedAmount", sql.Int, earnedAmount);
    request.input("statuss", sql.VarChar(50), statuss);
    request.input("paymentDate", sql.Date, paymentDate);

    const result = await request.query(`
      INSERT INTO Payments (TripID, EarnedAmount, Statuss, PaymentDate)
      VALUES (@tripID, @earnedAmount, @statuss, @paymentDate)
    `);

    return result.rowsAffected > 0;
  } catch (error) {
    throw new Error('Error adding payment: ' + error.message);
  }
}

async function deletePayment(paymentID) {
  try {
    const pool = await poolPromise;  
    const request = pool.request();
    request.input('paymentID', sql.Int, paymentID);
    const result = await request.query('DELETE FROM Payments WHERE PaymentID = @paymentID');
    return result.rowsAffected[0];
  } catch (error) {
    throw new Error('Error deleting payment: ' + error.message);
  }
}

module.exports = {
  getAllPayments,
  addPayment,
  deletePayment,
};
