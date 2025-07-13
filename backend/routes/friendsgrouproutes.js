const express = require('express');
const router = express.Router();
const friendsGroupController = require('../controllers/friendsgroupcontroller'); 
const { authenticateToken} = require("../controllers/authMiddleware"); 
router.patch('/:GroupNo', authenticateToken,friendsGroupController.updateFriendsGroup);
router.get('/', authenticateToken,friendsGroupController.getAllFriendGroups);
router.post('/', authenticateToken,friendsGroupController.addFriendGroup);
router.delete('/:groupNo', authenticateToken,friendsGroupController.deleteFriendGroup);
router.post('/:groupNo/add', authenticateToken, friendsGroupController.addMemberToGroup);
router.post('/:groupNo/remove', authenticateToken, friendsGroupController.removeMemberFromGroup);
router.get('/user/:userID', authenticateToken, friendsGroupController.getGroupsByUser);




module.exports = router;