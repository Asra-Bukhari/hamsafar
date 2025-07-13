const express = require('express');
const router = express.Router();
const triprequestcontroller = require('../controllers/triprequestscontroller');
const { updateTripRequestController } = require('../controllers/triprequestscontroller');
const { authenticateToken } = require("../controllers/authMiddleware"); // for protected routes we are importing this
router.patch('/:RequestID', authenticateToken,updateTripRequestController);

router.get('/',authenticateToken, triprequestcontroller.getalltriprequests);

router.post('/',authenticateToken, triprequestcontroller.addtriprequest);

router.delete('/:requestID',authenticateToken, triprequestcontroller.deleteTripRequest);
router.get("/nearby-trips", triprequestcontroller.getNearbyTrips);
router.post('/create-with-group', authenticateToken, triprequestcontroller.createTripWithGroup);

router.get('/passenger/:passengerID', triprequestcontroller.getTripsForPassenger);

router.patch('/respond/:requestID', triprequestcontroller.respondToTripInvite);
module.exports = router;
