const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sql, poolPromise } = require("../db");

const getallusers = async () => {
  try {
    const pool = await poolPromise;
    const request = pool.request();
    const result = await request.query("SELECT * FROM users");
    return result.recordset;
  } catch (error) {
    throw error;
  }
};


const adduser = async (
  name, email, password, gender, age, city, userstatus,
  contact, emergencycontact, currentarea, preference1, preference2, preference3, recenttrip = null
) => {
  try {
    const pool = await poolPromise;
    const request = pool.request();

    request.input("name", sql.VarChar, name);
    request.input("email", sql.VarChar, email);
    request.input("password", sql.VarChar, password);
    request.input("gender", sql.VarChar, gender);
    request.input("age", sql.Int, age);
    request.input("city", sql.VarChar, city);
    request.input("userstatus", sql.VarChar, userstatus);
    request.input("contact", sql.VarChar, contact);
    request.input("emergencycontact", sql.VarChar, emergencycontact);
    request.input("currentarea", sql.Int, currentarea || null);
    request.input("preference1", sql.Int, preference1);
    request.input("preference2", sql.Int, preference2);
    request.input("preference3", sql.Int, preference3);
    request.input("recenttrip", sql.Int, recenttrip || null); 
    const result = await request.query(`
      INSERT INTO users (
        name, email, password, gender, age, city, userstatus, contact,
        emergencycontact, currentarea, preference1, preference2, preference3, recenttrip
      )
      OUTPUT INSERTED.UserID
      VALUES (
        @name, @email, @password, @gender, @age, @city, @userstatus, @contact,
        @emergencycontact, @currentarea, @preference1, @preference2, @preference3, @recenttrip
      )
    `);

    const insertedUserID = result.recordset[0].UserID;
    return insertedUserID;

  } catch (error) {
    throw error;
  }
};



const loginUser= async (email, password) => {
  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input("email", sql.VarChar, email);
    request.input("password", sql.VarChar, password);

    const result = await request.query("SELECT userID, Name, Email, Password, Gender, Age, City, UserStatus, Contact, IsActive, isAdmin FROM Users WHERE Email = @email AND Password = @password");

    if (result.recordset.length === 0) {
      return { success: false, message: "Invalid credentials" };
    }

    const user = result.recordset[0];
    return { success: true, user };
  } catch (error) {
    throw error;
  }
};

const deleteUser = async (userID) => {
  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input("userID", sql.Int, userID);
    const result = await request.query("DELETE FROM users WHERE userID = @userID");

    return result.rowsAffected[0];
  } catch (error) {
    throw error;
  }
};

const getUserProfile = async (requesterID, targetUserID, isAdmin) => {
  try {
    const pool = await poolPromise;
    const request = pool.request();

    request.input("userID", sql.Int, targetUserID);

    let query = `
      SELECT userID, Name, Email, Password, Gender, Age, City, UserStatus, Contact, IsActive, isAdmin 
      FROM Users 
      WHERE userID = @userID
    `;

    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return { success: false, message: "User not found" };
    }

    let user = result.recordset[0];
if ((requesterID !== targetUserID) && !isAdmin) {
      delete user.Password;
      delete user.Email;
      delete user.Contact;
      delete user.isAdmin;
    }

    return { success: true, user };
  } catch (error) {
    throw error;
  }
};
const updateUser = async (userID, updates) => {
  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input("userID", sql.Int, parseInt(userID));

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === "age") {
          request.input(key, sql.Int, value === null || isNaN(value) ? null : parseInt(value, 10));
        } 
        else if (["email", "name", "city", "userstatus", "contact", "emergencycontact"].includes(key)) {
          request.input(key, sql.VarChar, value);
        } 
        else if (["currentarea", "preference1", "preference2", "preference3", "recenttrip"].includes(key)) {
          request.input(key, sql.Int, parseInt(value, 10));
        } 
        else if (key === "isAdmin") {
          request.input(key, sql.Int, parseInt(value)); 
        } 
        else {
          request.input(key, sql.VarChar, value);
        }
      }
    });

    await request.execute("UpdateUser");

    return { success: true, message: "Update Completed" };
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("Failed to update user");
  }
};

async function getUserLocation(userID) {
  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input("userID", sql.Int, userID);

    const result = await request.execute("GetUserLocation");

    if (result.recordset.length === 0) {
      return { success: false, message: "User not found or current location not set." };
    }

    const { latitude, longitude } = result.recordset[0];

    return { success: true, location: { latitude, longitude } };
  } catch (error) {
    throw error;
  }
}
const getFriendGroup = async (userName) => {
  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input("userName", sql.VarChar, userName);

    const result = await request.execute("GetFriendGroup");
    return { success: true, data: result.recordset };
  } catch (error) {
    throw error;
  }
};
const getRecentTrips = async (userID) => {
  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input("userID", sql.Int, userID);

    const result = await request.execute("GetRecentTrips");
    return { success: true, trips: result.recordset };
  } catch (error) {
    throw error;
  }
};

const getPreferredAreas = async (userID) => {
  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input("userID", sql.Int, userID);

    const result = await request.execute("GetPreferredAreas");
    return { success: true, preferences: result.recordset[0] };
  } catch (error) {
    throw error;
  }
};
const getUserPreferences = async (userID) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('userID', sql.Int, userID)
      .query(`
        SELECT Preference1, Preference2, Preference3
        FROM Users
        WHERE userID = @userID
      `);

    return result.recordset[0];
  } catch (error) {
    throw error;
  }
};
async function makeAdmin(userID) {
  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input("userID", sql.Int, userID);
    const check = await request.query(`
      SELECT * FROM Users WHERE userID = @userID
    `);

    if (check.recordset.length === 0) {
      return null; 
    }

    const update = await request.query(`
      UPDATE Users
      SET isAdmin = 1
      WHERE userID = @userID
    `);

    return true; 
  } catch (err) {
    throw err;
  }
}


module.exports = {
  getallusers,
  adduser,
  deleteUser,
  loginUser,
  getUserProfile,
  updateUser,
  getUserLocation,
  getPreferredAreas,
  getFriendGroup,
  getRecentTrips,
  getUserPreferences,
  makeAdmin
};