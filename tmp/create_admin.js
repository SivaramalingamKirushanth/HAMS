const pool = require('../backend/config/db');

async function createAdmin() {
  try {
    const adminData = {
      firstName: 'System',
      lastName: 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@hams.com',
      password: process.env.ADMIN_PASSWORD || 'password123',
      gender: 'Male',
      birthday: '1990-01-01',
      phoneNumber: '0000000000',
      nic: 'ADMIN001',
      role: 'admin'
    };

    // Check if admin already exists
    const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [adminData.email]);
    if (existing.length > 0) {
      console.log('Admin user already exists.');
      process.exit(0);
    }

    const [result] = await pool.execute(
      'INSERT INTO users (firstName, lastName, email, password, role, gender, birthday, phoneNumber, nic) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [adminData.firstName, adminData.lastName, adminData.email, adminData.password, adminData.role, adminData.gender, adminData.birthday, adminData.phoneNumber, adminData.nic]
    );

    console.log('Successfully created Admin account!');
    // console.log('Username (Email):', adminData.email);
    // console.log('Password:', adminData.password);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
