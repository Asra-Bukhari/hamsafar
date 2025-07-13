const driversmodel = require("../Models/driversmodel");
const { updateDriver } = require("../Models/driversmodel");

const updateDriverDetails = async (req, res) => {
  try {
    const { driverID } = req.params;
    const { vehicleID, driverStatus, availability } = req.body;

    if (!driverID) {
      return res.status(400).json({ error: "DriverID is required" });
    }

    const result = await updateDriver(driverID, vehicleID, driverStatus, availability);
    res.status(200).json(result);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(400).json({ error: error.message });
  }
};

async function getalldrivers(req, res) {
  try {
    const drivers = await driversmodel.getalldrivers();
    res.status(200).json(drivers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching drivers', error: error.message });
  }
}

async function addDriver(req, res) {
  try {
    const { driverID, vehicleID, driverStatus, availability } = req.body;

    if (!driverID || !vehicleID || !driverStatus || !availability) {
      return res.status(400).json({ message: "Missing required driver data" });
    }

    const success = await driversmodel.addDriver(
      driverID,
      vehicleID,
      driverStatus,
      availability
    );

    if (success) {
      res.status(201).json({ message: "Driver added successfully" });
    } else {
      res.status(500).json({ message: "Failed to add driver" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error adding driver", error: error.message });
  }
}


async function deleteDriver(req, res) {
  try {
    const driverID = parseInt(req.params.driverID, 10);
    const result = await driversmodel.deleteDriver(driverID);
    if (result > 0) {
      res.status(200).json({ message: 'Driver deleted successfully' });
    } else {
      res.status(404).json({ message: 'Driver not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting driver', error: error.message });
  }
}

module.exports = {
  getalldrivers,
  addDriver,
  deleteDriver,
  updateDriverDetails
};
