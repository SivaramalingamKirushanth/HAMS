const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

async function alterTable() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hams_db'
    });

    console.log('Altering table applications...');
    await connection.execute('ALTER TABLE applications MODIFY COLUMN date DATETIME');
    console.log('✅ Table altered successfully!');
    await connection.end();
  } catch (err) {
    console.error('Error altering table:', err.message);
  }
}

alterTable();
