const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

async function checkDb() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hams_db'
    });

    const [rows] = await connection.execute('SELECT id, studentName, formData FROM applications');
    console.log(JSON.stringify(rows, null, 2));
    await connection.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkDb();
