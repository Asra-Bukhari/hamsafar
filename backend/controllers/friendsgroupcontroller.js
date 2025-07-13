const friendsGroupModel = require('../Models/friendsgroupmodel');
const { sql, poolPromise } = require('../db');

const updateFriendsGroup = async (req, res) => {
    const { GroupNo } = req.params;
    const { GroupAdmin, TripsCompleted } = req.body;

    try {
        const pool = await poolPromise;
        const request = pool.request();

        request.input('GroupNo', sql.Int, GroupNo);
        request.input('GroupAdmin', sql.Int, GroupAdmin || null);
        request.input('TripsCompleted', sql.Int, TripsCompleted || null);

        const result = await request.execute('UpdateFriendsGroup');

        res.status(200).json({ message: 'Friends group updated successfully', result: result.recordsets });
    } catch (err) {
        console.error('Error during database operation:', err);
        res.status(500).json({ error: 'Failed to update friends group' });
    }
};

const getAllFriendGroups = async (req, res) => {
    try {
        const friendsGroup = await friendsGroupModel.getAllFriendGroups();
        res.status(200).json(friendsGroup);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching friends groups', error: error.message });
    }
};

const addFriendGroup = async (req, res) => {
    try {
        const { groupAdmin, totalMembers = 1, tripsCompleted = 0, otherMembers = '' } = req.body;

        if (!groupAdmin) {
            return res.status(400).json({ message: 'Missing required groupAdmin ID' });
        }

        const success = await friendsGroupModel.addFriendGroup(groupAdmin, totalMembers, tripsCompleted, otherMembers);

        if (success) {
            res.status(201).json({ message: 'Friends group added successfully' });
        } else {
            res.status(500).json({ message: 'Failed to add friends group' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error adding friends group', error: error.message });
    }
};

const deleteFriendGroup = async (req, res) => {
    try {
        const groupNo = parseInt(req.params.groupNo, 10);
        const result = await friendsGroupModel.deleteFriendGroup(groupNo);
        if (result > 0) {
            res.status(200).json({ message: 'Friends group deleted successfully' });
        } else {
            res.status(404).json({ message: 'Friends group not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting friends group', error: error.message });
    }
};

const addMemberToGroup = async (req, res) => {
    const groupNo = parseInt(req.params.groupNo, 10);
    const { friendID } = req.body;

    if (!friendID || !groupNo) {
        return res.status(400).json({ message: "Missing group number or friend ID" });
    }

    try {
        const pool = await poolPromise;
        const request = pool.request();
        request.input('groupNo', sql.Int, groupNo);
        request.input('friendID', sql.Int, friendID);

        await request.execute('AddFriendToGroup');

        res.status(200).json({ message: "Friend added to group successfully" });
    } catch (err) {
        console.error("❌ Error adding member:", err.message);
        res.status(500).json({ message: "Failed to add friend", error: err.message });
    }
};

const removeMemberFromGroup = async (req, res) => {
    const groupNo = parseInt(req.params.groupNo, 10);
    const { friendID } = req.body;

    if (!friendID || !groupNo) {
        return res.status(400).json({ message: "Missing group number or friend ID" });
    }

    try {
        const pool = await poolPromise;
        const request = pool.request();
        request.input('groupNo', sql.Int, groupNo);
        request.input('friendID', sql.Int, friendID);

        await request.execute('RemoveFriendFromGroup');

        res.status(200).json({ message: "Friend removed from group successfully" });
    } catch (err) {
        console.error("❌ Error removing member:", err.message);
        res.status(500).json({ message: "Failed to remove friend", error: err.message });
    }
};

const getGroupsByUser = async (req, res) => {
    const userID = parseInt(req.params.userID, 10);

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('userID', sql.Int, userID)
            .query(`
        SELECT fg.GroupNo, fg.groupAdmin, fg.TripsCompleted, gm.MemberID
        FROM FriendsGroup fg
        LEFT JOIN GroupMembers gm ON fg.GroupNo = gm.GroupNo
        WHERE fg.groupAdmin = @userID
           OR gm.MemberID = @userID
      `);

        res.status(200).json(result.recordset);
    } catch (err) {
        console.error("❌ Error fetching user's groups:", err.message);
        res.status(500).json({ message: "Failed to fetch groups", error: err.message });
    }
};

module.exports = {
    getAllFriendGroups,
    addFriendGroup,
    deleteFriendGroup,
    updateFriendsGroup,
    addMemberToGroup,
    removeMemberFromGroup,
    getGroupsByUser,
};
