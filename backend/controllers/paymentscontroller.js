const paymentsModel = require('../models/paymentsModel');
const { sql, poolPromise } = require('../db');

const createPayment = async (req, res) => {
  try {
    const { TripID, EarnedAmount, Statuss } = req.body;
    const pool = await poolPromise;

    await pool.request()
      .input('TripID', sql.Int, TripID)
      .input('EarnedAmount', sql.Int, EarnedAmount)
      .input('Statuss', sql.VarChar(6), Statuss)
      .query(`
        INSERT INTO Payments (TripID, EarnedAmount, Statuss)
        VALUES (@TripID, @EarnedAmount, @Statuss)
      `);

    res.status(201).json({ message: "Payment record created successfully." });
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).send("Failed to create payment.");
  }
};

const updatePayment = async (req, res) => {
  const { PaymentID } = req.params;
  const { EarnedAmount, Statuss, PaymentDate } = req.body;

  try {
    const pool = await poolPromise;
    const request = pool.request();

    request.input('PaymentID', sql.Int, PaymentID);
    request.input('EarnedAmount', sql.Int, EarnedAmount);
    request.input('Statuss', sql.VarChar(6), Statuss);
    request.input('PaymentDate', sql.Date, PaymentDate);

    const result = await request.execute('UpdatePayment'); 
    res.status(200).json({ message: 'Payment updated successfully', result: result.recordsets });
  } catch (err) {
    console.error('Error during database operation:', err);
    res.status(500).json({ error: 'Failed to update payment' });
  }
};

const getAllPayments = async (req, res) => {
  try {
    const payments = await paymentsModel.getAllPayments();
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
};

const addPayment = async (req, res) => {
  try {
    const { tripID, earnedAmount, statuss, paymentDate } = req.body;

    if (!tripID || !earnedAmount || !statuss) {
      return res.status(400).json({ message: 'Missing required payment data' });
    }

    const success = await paymentsModel.addPayment(
      tripID,
      earnedAmount,
      statuss,
      paymentDate
    );

    if (success) {
      res.status(201).json({ message: 'Payment added successfully' });
    } else {
      res.status(500).json({ message: 'Failed to add payment' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error adding payment', error: error.message });
  }
};

const deletePayment = async (req, res) => {
  try {
    const paymentID = parseInt(req.params.paymentID, 10);
    const result = await paymentsModel.deletePayment(paymentID);
    if (result > 0) {
      res.status(200).json({ message: 'Payment deleted successfully' });
    } else {
      res.status(404).json({ message: 'Payment not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting payment', error: error.message });
  }
};

module.exports = {
  getAllPayments,
  addPayment,
  deletePayment,
  updatePayment,
  createPayment
};
