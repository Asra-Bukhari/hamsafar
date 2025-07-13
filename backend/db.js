
const sql = require("mssql");


const config = {
  user: "sa",
  password: "12345678",
  server: "DESKTOP-7939MB0\\SQLEXPRESS",
  database: "carpoolingManagementSystem",
  options: {
    encrypt: true, 
    trustServerCertificate: true, 
  },
};


const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log("Connected to MSSQL");
    return pool;
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });

module.exports = {
  sql,
  poolPromise,
};
