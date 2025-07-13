const { sql, poolPromise } = require('../db');

async function getAllFriendGroups() {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM FriendsGroup');
    return result.recordset;
  } catch (error) {
    throw error;
  }
}

async function addFriendGroup(groupAdmin, totalMembers = 1, tripsCompleted = 0, otherMembers = '') {
  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input('groupAdmin', sql.Int, groupAdmin);
    request.input('totalMembers', sql.Int, totalMembers);
    request.input('tripsCompleted', sql.Int, tripsCompleted);
    request.input('otherMembers', sql.Text, otherMembers);

    // Insert into FriendsGroup table
    const result = await request.query(`
      INSERT INTO FriendsGroup (groupAdmin, TripsCompleted)
      VALUES (@groupAdmin, @tripsCompleted)
      SELECT SCOPE_IDENTITY() AS GroupNo
    `);

    const groupNo = result.recordset[0].GroupNo;

    // Insert into GroupMembers table (initially add groupAdmin)
    const memberInsert = pool.request();
    memberInsert.input('GroupNo', sql.Int, groupNo);
    memberInsert.input('MemberID', sql.Int, groupAdmin);

    await memberInsert.query(`
      INSERT INTO GroupMembers (GroupNo, MemberID)
      VALUES (@GroupNo, @MemberID)
    `);

    return true;
  } catch (error) {
    throw error;
  }
}

async function deleteFriendGroup(groupNo) {
  try {
    const pool = await poolPromise;
    const request = pool.request();

    // Delete from GroupMembers first
    await request.input('groupNo', sql.Int, groupNo)
      .query('DELETE FROM GroupMembers WHERE GroupNo = @groupNo');

    // Delete from FriendsGroup table
    const result = await request.input('groupNo', sql.Int, groupNo)
      .query('DELETE FROM FriendsGroup WHERE GroupNo = @groupNo');
    
    return result.rowsAffected[0];
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getAllFriendGroups,
  addFriendGroup,
  deleteFriendGroup,
};
