const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const usersmodel = require("../models/usersmodel");
const { poolPromise } = require("../db");


async function getallusers(req, res) {
  try {
   
    const users = await usersmodel.getallusers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
}
async function adduser(req, res) {
  try {
    const {
      name, email, password, gender, age, city, userstatus,
      contact, emergencycontact, currentarea, preference1, preference2, preference3
    } = req.body;

    if (!email || !password || !city || !contact || !emergencycontact) {
      return res.status(400).json({ success: false, message: "Missing user details" });
    }

    if (typeof age !== "number" || age < 18) {
      return res.status(400).json({ success: false, message: "Age must be a number ≥ 18" });
    }

    const insertedUserID = await usersmodel.adduser(
      name, email, password, gender, age, city, userstatus, contact, emergencycontact,
      currentarea, preference1, preference2, preference3
    );

    if (insertedUserID) {
      return res.status(201).json({
        success: true,
        message: 'Signup successful',
        userID: insertedUserID
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to sign up user'
      });
    }

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error adding user",
      error: error.message
    });
  }
}


async function deleteUser(req, res) {
  try {
    const userID = parseInt(req.params.userID, 10);
    const result = await usersmodel.deleteUser(userID);
    if (result > 0) {
      res.status(200).json({ message: "User deleted successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
}

async function deleteUser(req, res) {
  try {
    const userID = parseInt(req.params.userID, 10);
    const result = await usersmodel.deleteUser(userID);
    if (result > 0) {
      res.status(200).json({ message: "User deleted successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
}
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await usersmodel.loginUser(email, password);

    if (!result.success) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.user;
    console.log("User logging in:", user); 

    const token = jwt.sign(
      {
        userID: user.userID,
        isAdmin: user.isAdmin,
      },
      "mySuperSecretKey12345!",
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      userID: user.userID, 
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


const getUserProfile = async (req, res) => {
  try {
    const targetUserID = parseInt(req.params.userID, 10);
    const requesterID = req.user.userID;
    const isAdmin = req.user.isAdmin === 1;

    console.log("Requester ID:", requesterID, "Target User ID:", targetUserID, "Is Admin:", isAdmin);

    if (!targetUserID) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const result = await usersmodel.getUserProfile(requesterID, targetUserID, isAdmin);

    if (!result.success) {
      return res.status(404).json({ message: result.message });
    }

    res.status(200).json({ user: result.user });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user profile", error: error.message });
  }
};
const updateUserController = async (req, res) => {
  try {
    
    const userID = parseInt(req.user.userID);
    const updates = req.body;
    if (!userID) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const result = await usersmodel.updateUser(userID, updates);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
async function getUserLocation(req, res) {
  const userID = req.params.userID;


  try {
      const result = await usersmodel.getUserLocation(userID);


      if (result.success) {
          return res.status(200).json({
              success: true,
              message: "User location retrieved successfully",
              location: result.location,
          });
      } else {
          return res.status(404).json({ success: false, message: "User not found" });
      }
  } catch (error) {
      return res.status(500).json({ success: false, message: "Error retrieving user location", error });
  }
}

const getFriendGroupController = async (req, res) => {
  try {
    const userName = req.params.userName;
    const result = await usersmodel.getFriendGroup(userName);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error getting friend group", error: error.message });
  }
};

const getRecentTripsController = async (req, res) => {
  try {
    const userID = parseInt(req.params.userID);
    const result = await usersmodel.getRecentTrips(userID);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching recent trips", error: error.message });
  }
};

const getPreferredAreasController = async (req, res) => {
  try {
    const userID = parseInt(req.params.userID);
    const result = await usersmodel.getPreferredAreas(userID);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching preferred areas", error: error.message });
  }
};
const getOwnProfile = async (req, res) => {
  try {
    const requesterID = req.user.userID;
    const isAdmin = req.user.isAdmin === 1;
    const targetUserID = req.user.userID; 
    console.log("inside getyourown profile");
    console.log("Decoded Token:", req.user);
    console.log("Requester ID:", requesterID, "Target User ID:", targetUserID, "Is Admin:", isAdmin);

    const result = await usersmodel.getUserProfile(requesterID, targetUserID, isAdmin);

    if (!result.success) {
      return res.status(404).json({ message: result.message });
    }

    res.status(200).json({ user: result.user });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user profile", error: error.message });
  }
};

const getUsercurrLocation = async (req, res) => {
  const { userID } = req.params;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("userID", Number(userID))
      .query(`
        SELECT A.latitude, A.longitude
        FROM Users U
        INNER JOIN Areas A ON U.CurrentArea = A.AreaCode
        WHERE U.userID = @userID
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "User or location not found" });
    }

    const { latitude, longitude } = result.recordset[0];
    res.status(200).json({ latitude, longitude });

  } catch (error) {
    console.error("Error fetching user location:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getUserName = async (req, res) => {
  const { userID } = req.params;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("UserID", userID)
      .query("SELECT Name FROM Users WHERE userID = @UserID AND IsActive = 1");

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const { Name } = result.recordset[0];
    res.status(200).json({ name: Name });
  } catch (error) {
    console.error("Error fetching user name:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getUserEmail = async (req, res) => {
  const { userID } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("userID", userID)
      .query("SELECT Email FROM Users WHERE userID = @userID");

    if (result.recordset.length > 0) {
      res.json({ email: result.recordset[0].Email });
    } else {
      res.status(404).json({ message: "User not found." });
    }
  } catch (err) {
    console.error("Error fetching user email:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const makeAdminWithKey = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { secretKey } = req.body;
    const ADMIN_SECRET = "BLAHBLAHBLAH";
    console.log("Admin key request body:", req.body);
    if (secretKey !== ADMIN_SECRET) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid admin key." });
    }

    const success = await usersmodel.makeAdmin(userId);
if (success === null) {
  return res.status(404).json({ success: false, message: "User not found." });
}
    res
      .status(200)
      .json({ success: true, message: "You are now an admin!" });
  } catch (error) {
    console.error("Make Admin Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to become admin." });
  }
};

const getUserStatus = async (req, res) => {
  try {
    const { userID } = req.params;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('userID', userID)
      .query('SELECT UserStatus FROM Users WHERE userID = @userID');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userStatus = result.recordset[0].UserStatus;
    res.json({ userStatus });
  } catch (err) {
    console.error("Error fetching user status:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getUserEmail,
  getUserName,
  getUserStatus,
  getUsercurrLocation,
  getallusers,
  adduser,
  deleteUser,
  loginUser,
  getUserProfile,
  updateUserController,
  getUserLocation,
  getFriendGroupController,
  getPreferredAreasController,
  getRecentTripsController,
  getOwnProfile,
  makeAdminWithKey
};