// backend/routes/joinrequests.routes.js
const express = require("express");
const router = express.Router();
const { createJoinRequest } = require("../controllers/joinRequestsController");

// POST endpoint to create a join request
router.post("/", createJoinRequest);

module.exports = router;
