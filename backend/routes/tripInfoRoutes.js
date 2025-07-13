const express = require('express');
const router = express.Router();
const tripInfoController = require('../controllers/tripInfoController');

router.get("/trip/:tripID", tripInfoController.getTripDetails);
router.get("/trip/:tripID/pending-requests", tripInfoController.getPendingJoinRequests);
router.put("/join-request/:joinRequestID/accept", tripInfoController.acceptJoinRequest);
router.put("/join-request/:joinRequestID/reject", tripInfoController.rejectJoinRequest);

router.get('/isDriver/:tripID/:userID', tripInfoController.isDriver);
router.post('/startTrip/:tripID/:userID', tripInfoController.startTrip);
// Route to start the trip
router.put('/trip/:tripID/start', tripInfoController.startTrip);

// Route to complete the trip
router.put('/trip/:tripID/complete',tripInfoController.completeTrip);

// Route to mark payment as done
router.put('/trip/:tripID/payment-done', tripInfoController.paymentDone);
module.exports = router;
