const mysql = require('mysql2/promise');

// for localhost
// const pool = mysql.createPool({
//   host: process.env.MYSQL_HOST,
//   user: process.env.MYSQL_USER,
//   password: process.env.MYSQL_PASSWORD,
//   database: process.env.MYSQL_DATABASE
// });

// for rds
const pool = mysql.createPool({
  host: process.env.RDS_MYSQL_HOST,
  user: process.env.RDS_MYSQL_USER,
  password: process.env.RDS_MYSQL_PASSWORD,
  database: process.env.RDS_MYSQL_DATABASE
});

module.exports = pool;
