const mysql = require('mysql2/promise');

const isDevelopment = process.env.NODE_ENV === 'dev';

const pool = mysql.createPool({
  host: isDevelopment ? process.env.MYSQL_HOST : process.env.RDS_MYSQL_HOST,
  user: isDevelopment ? process.env.MYSQL_USER : process.env.RDS_MYSQL_USER,
  password: isDevelopment ? process.env.MYSQL_PASSWORD : process.env.RDS_MYSQL_PASSWORD,
  database: isDevelopment ? process.env.MYSQL_DATABASE : process.env.RDS_MYSQL_DATABASE
});

module.exports = pool;
