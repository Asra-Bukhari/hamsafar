const jwt = require("jsonwebtoken");
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"]; // ✅ lowercase "authorization" is safer
  if (!authHeader) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1]; // ✅ safely split "Bearer <token>"
  if (!token) {
    return res.status(401).json({ message: "Token malformed." });
  }

  try {
    const decoded = jwt.verify(token, "mySuperSecretKey12345!");

    req.user = {
      userID: decoded.userID,
      isAdmin: decoded.isAdmin,
    };

    next();
  } catch (error) {
    console.log("Invalid token:", error);
    res.status(403).json({ message: "Invalid token" });
  }
}

function authorizeAdmin(req, res, next) {
    if (req.user.isAdmin !== 1) {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }
    next();
}

module.exports = { authenticateToken, authorizeAdmin };
