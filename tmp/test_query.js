const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

async function testBackendQuery() {
  const email = 'test@student.com';
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hams_db'
    });

    const query = "SELECT * FROM applications WHERE JSON_UNQUOTE(JSON_EXTRACT(formData, '$.email')) = ? ORDER BY date DESC LIMIT 1";
    const [rows] = await connection.execute(query, [email]);
    
    console.log('Results Found:', rows.length);
    if (rows.length > 0) {
      console.log('Result:', JSON.stringify(rows[0], null, 2));
    } else {
      console.log('No results.');
      // Let's debug what's in the DB
      const [all] = await connection.execute('SELECT id, formData FROM applications LIMIT 5');
      all.forEach(row => {
          console.log(`ID: ${row.id}, Type of formData: ${typeof row.formData}`);
          console.log(`formData: ${row.formData}`);
          if (typeof row.formData === 'string') {
              try {
                  const parsed = JSON.parse(row.formData);
                  console.log(`Parsed email: ${parsed.email}`);
              } catch (e) {
                  console.log('Could not parse as JSON');
              }
          }
      });
    }
    await connection.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testBackendQuery();
