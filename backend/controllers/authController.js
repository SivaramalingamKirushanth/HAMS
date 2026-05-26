const pool = require('../config/db');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET environment variable is missing. Server cannot start.");
  process.exit(1);
}

// Basic register function without hashing to keep dependencies strictly matching our architecture
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, gender, birthday, phoneNumber, nic } = req.body;
    
    // Check if user exists by email or NIC
    const [existing] = await pool.query('SELECT * FROM users WHERE email = ? OR nic = ?', [email, nic]);
    if (existing.length > 0) {
      if (existing[0].email === email) {
        return res.status(400).json({ success: false, message: 'User with this email already exists' });
      }
      if (existing[0].nic === nic) {
        return res.status(400).json({ success: false, message: 'User with this NIC already exists' });
      }
    }

    // Restrict system to only one admin account
    if (role === 'admin' || role === 'Admin') {
      const [existingAdmins] = await pool.query('SELECT id FROM users WHERE role = ? OR role = ?', ['admin', 'Admin']);
      if (existingAdmins.length > 0) {
        return res.status(403).json({ success: false, message: 'Admin account already exists. Only one admin is allowed.' });
      }
    }

    // Insert new user
    const [result] = await pool.execute(
      'INSERT INTO users (firstName, lastName, email, password, role, gender, birthday, phoneNumber, nic) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [firstName, lastName, email, password, role, gender, birthday, phoneNumber, nic]
    );

    res.status(201).json({ 
      success: true, 
      message: 'Registration successful',
      user: { id: result.insertId, firstName, lastName, email, role, gender, birthday, phoneNumber, nic }
    });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const [users] = await pool.query('SELECT * FROM users WHERE email = ? AND password = ? AND role = ?', [email, password, role]);
    
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or wrong role selected' });
    }

    const user = users[0];
    // In a production app, we would issue a JWT here. 
    // For this exact setup, returning user details serves as our "token"
    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: { 
        id: user.id, 
        firstName: user.firstName, 
        lastName: user.lastName, 
        email: user.email, 
        role: user.role,
        gender: user.gender,
        birthday: user.birthday,
        phoneNumber: user.phoneNumber,
        nic: user.nic
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'No Google token provided' });
    }

    // 1. Verify token with Google
    // Note: If GOOGLE_CLIENT_ID is undefined in .env, audience will be undefined, which might allow tokens from other apps. 
    // It's highly recommended to set it in backend/.env
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID, 
    });
    
    const payload = ticket.getPayload();
    const { email, given_name, family_name } = payload;

    // 2. SECURITY CHECK: Restrict domain
    if (!email || !email.endsWith('@stu.vau.ac.lk')) {
      return res.status(403).json({ success: false, message: 'Access Denied: Only @stu.vau.ac.lk accounts are allowed.' });
    }

    // 3. DATABASE: Check existing or create new
    const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    let user;

    if (existingUsers.length === 0) {
      // Create new user as student
      const firstName = given_name || '';
      const lastName = family_name || '';
      const role = 'student';
      
      const [result] = await pool.execute(
        'INSERT INTO users (firstName, lastName, email, role) VALUES (?, ?, ?, ?)',
        [firstName, lastName, email, role]
      );
      
      user = { id: result.insertId, firstName, lastName, email, role };
    } else {
      user = existingUsers[0];
    }

    // 4. JWT: Generate session token
    const jwtToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 5. RETURN response
    res.status(200).json({
      success: true,
      message: 'Google login successful',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        gender: user.gender,
        birthday: user.birthday,
        phoneNumber: user.phoneNumber,
        nic: user.nic
      },
      token: jwtToken
    });

  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify Google token' });
  }
};
