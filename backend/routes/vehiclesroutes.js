const express = require("express");
const router = express.Router();
const vehiclescontrollers = require("../controllers/vehiclescontrollers");
const { authenticateToken } = require("../controllers/authMiddleware"); // for protected routes we are importing this
router.get("/",vehiclescontrollers.getallvehicles);
router.post('/',vehiclescontrollers.addVehicle);
router.delete('/:vehicleID', authenticateToken,vehiclescontrollers.deleteVehicle);
router.patch('/:vehicleID', authenticateToken,vehiclescontrollers.updateVehicle);

module.exports = router;
