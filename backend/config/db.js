const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hams_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
pool.getConnection()
  .then(connection => {
    console.log('✅ Successfully connected to the MySQL Database (hams_db).');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed!');
    console.error('   Error:', err.message);
    if (err.code === 'ECONNREFUSED') {
      console.error('   Hint: Make sure your MySQL server (XAMPP/WAMP) is running on 127.0.0.1:3306');
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      console.error('   Hint: Database "hams_db" does not exist. Run "node database/create-db.js" first.');
    }
  });

module.exports = pool;
