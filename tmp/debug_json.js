const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

async function debugJson() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hams_db'
    });

    const [rows] = await connection.execute('SELECT id, formData, JSON_TYPE(formData) as type FROM applications');
    rows.forEach(row => {
        console.log(`ID: ${row.id}, MySQL Type: ${row.type}, Value: ${row.formData}`);
        console.log(`Extraction Test: `);
        // Direct extraction
    });
    
    const email = 'test@student.com';
    const [match] = await connection.execute(
        "SELECT id, JSON_EXTRACT(formData, '$.email') as emailVal FROM applications WHERE id = ?",
        [rows[0].id]
    );
    console.log('Extraction Result for latest:', match[0]);

    await connection.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

debugJson();
