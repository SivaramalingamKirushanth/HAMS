const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

async function initializeDatabase() {
    try {
        // Connect WITHOUT a database to create it first
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });

        console.log('Connected to MySQL server.');

        // 1. Create DB
        await connection.query('CREATE DATABASE IF NOT EXISTS hams_db');
        console.log('Database hams_db created or already exists.');

        // 2. Use DB
        await connection.query('USE hams_db');

        // 2.5 Create Users table
        await connection.query('DROP TABLE IF EXISTS users');
        await connection.query(`
            CREATE TABLE users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                firstName VARCHAR(50) NOT NULL,
                lastName VARCHAR(50) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                gender ENUM('Male', 'Female', 'Other'),
                birthday DATE,
                phoneNumber VARCHAR(20),
                nic VARCHAR(20) UNIQUE,
                role ENUM('student', 'admin') DEFAULT 'student',
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Table users created.');

        // 3. Create Applications table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS applications (
                id VARCHAR(50) PRIMARY KEY,
                studentName VARCHAR(100) NOT NULL,
                admissionNo VARCHAR(50) NOT NULL,
                roomType VARCHAR(50),
                date DATETIME,
                status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
                formData JSON,
                adminData JSON
            )
        `);
        console.log('Table applications created.');

        // 4. Create Rooms table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS rooms (
                id INT PRIMARY KEY,
                capacity INT DEFAULT 4
            )
        `);
        console.log('Table rooms created.');

        // 5. Create Beds table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS beds (
                roomId INT,
                bedId VARCHAR(5),
                status ENUM('available', 'booked') DEFAULT 'available',
                studentId VARCHAR(50),
                PRIMARY KEY(roomId, bedId),
                FOREIGN KEY(roomId) REFERENCES rooms(id)
            )
        `);
        console.log('Table beds created.');

        // 6. Create Signatures table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS signatures (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id VARCHAR(50),
                original_path VARCHAR(255),
                cropped_path VARCHAR(255),
                processed_path VARCHAR(255),
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Table signatures created.');

        // 7. Create Notifications table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_email VARCHAR(100),
                title VARCHAR(100),
                message TEXT,
                isRead BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Table notifications created.');

        await connection.end();
        console.log('All tables successfully initialized! You can now start the server.');

    } catch (err) {
        console.error('Failed to initialize database:', err.message);
        console.log('Make sure your MySQL server is running (e.g. via XAMPP) and the user is root with no password.');
    }
}

initializeDatabase();
