const pool = require('../backend/config/db');

async function alterTable() {
  try {
    await pool.query('ALTER TABLE applications ADD COLUMN adminData JSON');
    console.log('Successfully added adminData column to applications table');
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('Column adminData already exists');
    } else {
      console.error('Error altering table:', error);
    }
  } finally {
    process.exit();
  }
}

alterTable();
