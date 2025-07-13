const vehiclesmodel = require("../models/vehiclesmodel");
const { poolPromise } = require('../db'); // Use poolPromise directly

async function getallvehicles(req, res) {
    try {
        const vehicles = await vehiclesmodel.getallvehicles();
        res.status(200).json(vehicles);
    } catch (error) {
        res.status(500).json({ message: "Error fetching vehicles", error: error.message });
    }
}
async function addVehicle(req, res) {
    try {
      const { name, color, company, typee, capacity } = req.body;
  
      if (!name || !color || !company || !typee || !capacity) {
        return res.status(400).json({ message: "Missing required vehicle data" });
      }
  
      const vehicleID = await vehiclesmodel.addVehicle(name, color, company, typee, capacity);
  
      if (vehicleID) {
        res.status(201).json({ message: "Vehicle added successfully", vehicleID });
      } else {
        res.status(500).json({ message: "Failed to add vehicle" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error adding vehicle", error: error.message });
    }
  }

async function deleteVehicle(req, res) {
    try {
        const vehicleID = parseInt(req.params.vehicleID, 10);
        const result = await vehiclesmodel.deleteVehicle(vehicleID);
        if (result > 0) {
            res.status(200).json({ message: 'Vehicle deleted successfully' });
        } else {
            res.status(404).json({ message: 'Vehicle not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting vehicle', error: error.message });
    }
}


const updateVehicle = async (req, res) => {
    try {
        console.log("Request Params:", req.params);  
        console.log("Request Body:", req.body);     

        const vehicleID = req.params.vehicleID;
        const vehicleData = req.body;

        if (!vehicleID) {
            return res.status(400).json({ error: "VehicleID is required" });
        }

        const success = await vehiclesmodel.updateVehicle(vehicleID, vehicleData);
        if (success) {
            res.status(200).json({ message: "Vehicle updated successfully" });
        } else {
            res.status(404).json({ message: "Vehicle not found" });
        }
    } catch (err) {
        console.error("Error updating vehicle:", err);
        res.status(500).json({ error: "Error updating vehicle", message: err.message });
    }
};

module.exports = {
    getallvehicles,
    addVehicle,
    deleteVehicle,
    updateVehicle
};
