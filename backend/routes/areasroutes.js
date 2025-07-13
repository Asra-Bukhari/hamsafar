const express = require("express");
const router = express.Router();

const { insertAreaFromMapbox,insertAreaHandler } = require("../controllers/areascontroller");
router.post("/addarea", insertAreaFromMapbox);

const areascontroller = require("../controllers/areascontroller");
const { patchAreaController } = require('../controllers/areascontroller');
const { authenticateToken, authorizeAdmin } = require("../controllers/authMiddleware"); // for protected routes we are importing this
router.get('/',authenticateToken,authorizeAdmin, areascontroller.getallareas);
router.post('/insert', authenticateToken,authorizeAdmin,insertAreaHandler);

router.delete('/:areaCode', authenticateToken,authorizeAdmin,areascontroller.deleteAreaByCode);

router.patch("/updatearea/:areaCode",authenticateToken,authorizeAdmin, patchAreaController);


const { getAreaDropdownValues } = require("../controllers/areascontroller");
router.get("/dropdown", getAreaDropdownValues);
router.get("/coordinates/:areaCode", areascontroller.getCoordinatesByAreaCode);
router.get("/:areaCode", areascontroller.getAreaInfoByCode);

module.exports = router;
