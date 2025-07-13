const express = require("express");
const router = express.Router();
const driverscontroller = require("../controllers/driverscontroller");
const { authenticateToken} = require("../controllers/authMiddleware"); // for protected routes we are importing this
router.get('/', authenticateToken,driverscontroller.getalldrivers);
router.post('/', driverscontroller.addDriver);
router.delete('/:driverID',authenticateToken, driverscontroller.deleteDriver);
router.patch("/:driverID",authenticateToken, driverscontroller.updateDriverDetails);

module.exports = router;
