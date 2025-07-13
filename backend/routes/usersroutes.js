const express = require("express");
const router = express.Router();
const userscontroller = require("../controllers/userscontroller");
const { authenticateToken, authorizeAdmin } = require("../controllers/authMiddleware"); 
router.post("/login", userscontroller.loginUser);
router.post("/", userscontroller.adduser);

router.get("/me/profile", authenticateToken, userscontroller.getOwnProfile);
router.get("/:userID",authenticateToken, userscontroller.getUserProfile);

router.delete("/:userID",authenticateToken,authorizeAdmin, userscontroller.deleteUser);
router.get("/", authenticateToken,authorizeAdmin,userscontroller.getallusers);
router.get("/:userID/location", authenticateToken,userscontroller.getUserLocation);

router.patch("/:id",authenticateToken, userscontroller.updateUserController);

router.get("/friendgroup/:userName", authenticateToken, userscontroller.getFriendGroupController);

router.get("/:userID/recenttrips", authenticateToken, userscontroller.getRecentTripsController);

router.get("/:userID/preferences", authenticateToken, userscontroller.getPreferredAreasController);
router.get("/location/:userID", userscontroller.getUsercurrLocation);
router.get("/name/:userID", userscontroller.getUserName);
router.get("/email/:userID", userscontroller.getUserEmail);
router.get("/status/:userID", userscontroller.getUserStatus);

module.exports = router;
