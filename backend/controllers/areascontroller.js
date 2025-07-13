const areasmodel = require('../models/areasmodel');
const { sql,poolPromise } = require("../db"); 
const { insertArea ,updateAreaUsingSP } = require('../models/areasmodel');
const { CreateArea, getNextAreaCode } = require('../models/areasmodel');
const axios = require('axios');
const mapboxApiKey = 'pk.eyJ1IjoiYXNyYWJ1a2hhcmkiLCJhIjoiY204aXk0enoyMDhlZzJpcjR2ODNvZm51NyJ9.aOF8rIy52nwgEhRnGzmvsw';

async function validateFromMapbox(city, town, place) {
  try {
    const query = [town, place, city].filter(Boolean).join(", ");
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxApiKey}&country=PK&limit=1`;

    const response = await axios.get(url);
    const feature = response.data.features[0];
    if (!feature) return false;

    const context = feature.context || [];
    const featureText = feature.text?.toLowerCase() || "";
    const placeName = feature.place_name?.toLowerCase() || "";

    const contextObj = {};
    for (const ctx of context) {
      const [type] = ctx.id.split(".");
      contextObj[type] = ctx.text.toLowerCase();
    }

    const cityMatch = city ? (
      placeName.includes(city.toLowerCase()) ||
      contextObj.place === city.toLowerCase() ||
      contextObj.region === city.toLowerCase()
    ) : true;

    const townMatch = town ? (
      placeName.includes(town.toLowerCase()) ||
      contextObj.neighborhood === town.toLowerCase() ||
      contextObj.locality === town.toLowerCase()
    ) : true;

    const placeMatch = place ? (
      placeName.includes(place.toLowerCase()) ||
      featureText.includes(place.toLowerCase())
    ) : true;

    return cityMatch && townMatch && placeMatch;
  } catch (error) {
    console.error("Mapbox Validation Error:", error.message);
    return false;
  }
}

async function insertAreaHandler(req, res) {
  try {
    const {
      City,
      Town,
      Road,
      Block,
      Sector,
      Place,
      NearbyAreas
    } = req.body;

    if (!City || !Town || !Place) {
      return res.status(400).json({ message: 'City, Town, and Place are required' });
    }

    const isValid = await validateFromMapbox(City, Town, Place);

    if (!isValid) {
      return res.status(400).json({ message: 'Provided area is not valid according to Mapbox' });
    }

    const nextAreaCode = await getNextAreaCode();

    const mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(Place)}.json?access_token=${mapboxApiKey}&country=PK&proximity=74.3587,31.5204&limit=1`;
    const mapboxResponse = await axios.get(mapboxUrl);
    const feature = mapboxResponse.data.features[0];

    const latitude = feature.center[1];
    const longitude = feature.center[0];

    await CreateArea({
      AreaCode: nextAreaCode,
      City,
      Town,
      Road,
      Block,
      Sector,
      Place,
      NearbyAreas,
      Latitude: latitude,
      Longitude: longitude
    });

    return res.status(201).json({
      message: 'Area inserted successfully',
      AreaCode: nextAreaCode
    });
  } catch (error) {
    console.error('Insert Error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}


const insertAreaFromMapbox = async (req, res) => {
  try {
    const { areaname } = req.body;

    if (!areaname) {
      return res.status(400).json({ message: "areaname is required" });
    }

    // Call Mapbox API with country filter = Pakistan
    const mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      areaname
    )}.json?access_token=${mapboxApiKey}&country=PK&proximity=74.3587,31.5204&limit=1`;

    const response = await axios.get(mapboxUrl);
    const data = response.data;

    if (!data.features || data.features.length === 0) {
      return res.status(404).json({ message: "Location not found in Pakistan" });
    }

    const feature = data.features[0];
    const context = feature.context || [];

    let city = "";
    let town = "";

    // Extract city and town from context
    context.forEach((item) => {
      if (item.id.includes("place")) {
        city = item.text;
      }
      if (item.id.includes("locality") || item.id.includes("neighborhood")) {
        town = item.text;
      }
    });

    // Fallback: use feature.text if city is still empty
    if (!city && feature.place_type.includes("place")) {
      city = feature.text;
    }

    const latitude = feature.center[1];
    const longitude = feature.center[0];

    // Insert into database using model
    await insertArea({
      city,
      town,
      place: areaname,
      latitude,
      longitude,
    });

    return res.status(201).json({
      message: "Area inserted successfully",
      data: {
        city,
        town,
        place: areaname,
        latitude,
        longitude,
      },
    });
  } catch (error) {
    console.error("Insert Area Error:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};



async function patchAreaController(req, res) {
  try {
    const areaCode = parseInt(req.params.areaCode);
    const { City, Town, Road, Block, Sector, Place, NearbyAreas } = req.body;

    const isValid = await validateFromMapbox(City, Town, Place);

    if (!isValid) {
      return res.status(400).json({ message: "Provided area is not valid according to Mapbox" });
    }

    await updateAreaUsingSP(areaCode, City, Town, Road, Block, Sector, Place, NearbyAreas);
    res.status(200).json({ message: "Area updated successfully" });
  } catch (error) {
    console.error("PATCH Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

async function getallareas(req, res) {
  try {
    const areas = await areasmodel.getallareas();
    res.status(200).json(areas);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching areas', error: error.message });
  }
}


async function deleteAreaByCode(req, res) {
  try {
    const areaCode = parseInt(req.params.areaCode, 10);
    const result = await areasmodel.deleteAreaByCode(areaCode);
    if (result > 0) {
      res.status(200).json({ message: 'Area deleted successfully' });
    } else {
      res.status(404).json({ message: 'Area not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting area', error: error.message });
  }
}

const getAreaDropdownValues = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT AreaCode,City, Town, Place FROM Areas");
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error("Error fetching dropdown areas:", err);
    res.status(500).json({ message: "Error fetching areas" });
  }
};

const getCoordinatesByAreaCode = async (req, res) => {
  const { areaCode } = req.params;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("areaCode", sql.Int, areaCode)
      .query("SELECT latitude, longitude FROM Areas WHERE AreaCode = @areaCode");

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Area code not found" });
    }

    const { latitude, longitude } = result.recordset[0];
    res.json({ latitude, longitude });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAreaInfoByCode = async (req, res) => {
  const { areaCode } = req.params;

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input("areaCode", sql.Int, areaCode)
      .query("SELECT * FROM Areas WHERE AreaCode = @areaCode");

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Area not found" });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error("Error fetching area info:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


module.exports = {
  getAreaInfoByCode,
  getCoordinatesByAreaCode,
  getAreaDropdownValues,
  getallareas,
  deleteAreaByCode,
  patchAreaController,
  insertAreaFromMapbox,
  insertAreaHandler
};
