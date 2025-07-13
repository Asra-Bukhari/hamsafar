const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/paymentsController');
const { authenticateToken } = require("../controllers/authMiddleware"); // for protected routes we are importing this
router.patch('/:PaymentID', authenticateToken,paymentsController.updatePayment);
router.get('/',authenticateToken, paymentsController.getAllPayments);
router.post('/',authenticateToken, paymentsController.addPayment);
router.delete('/:paymentID',authenticateToken, paymentsController.deletePayment);
router.post('/create-payment', paymentsController.createPayment);
module.exports = router;
