const mysql = require('mysql');
// Set up MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'ajith001',
    database: 'QuadgenAssesmentPortal',
    multipleStatements: true
  });

  module.exports=db