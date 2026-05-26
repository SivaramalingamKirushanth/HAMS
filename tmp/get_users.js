const pool = require('../backend/config/db');

async function getUsers() {
  try {
    const [rows, fields] = await pool.execute('SELECT email, password, role FROM users LIMIT 10;');
    console.log("Users:", JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

getUsers();
