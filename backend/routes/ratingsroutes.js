const express = require('express');
const router = express.Router();
const ratingsController = require('../controllers/ratingscontrollers');
const { authenticateToken } = require("../controllers/authMiddleware"); // for protected routes we are importing this
router.get('/', authenticateToken,ratingsController.getAllRatings);
router.post('/',authenticateToken, ratingsController.addRating);
router.delete('/:ratingID',authenticateToken, ratingsController.deleteRating);
router.patch('/:RatingID',authenticateToken, ratingsController.updateRating);
router.get("/driver-rating/:driverID",authenticateToken, ratingsController.getDriverRating);
router.get('/user/:userId', authenticateToken, ratingsController.getRatingsByUser);
module.exports = router;