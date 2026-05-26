CREATE DATABASE IF NOT EXISTS hams_db;
USE hams_db;

CREATE TABLE IF NOT EXISTS applications (
    id VARCHAR(50) PRIMARY KEY,
    studentName VARCHAR(100) NOT NULL,
    admissionNo VARCHAR(50) NOT NULL,
    roomType VARCHAR(50),
    date DATE,
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    formData JSON
);

CREATE TABLE IF NOT EXISTS rooms (
    id INT PRIMARY KEY,
    capacity INT DEFAULT 4
);

CREATE TABLE IF NOT EXISTS beds (
    roomId INT,
    bedId VARCHAR(5),
    status ENUM('available', 'booked') DEFAULT 'available',
    studentId VARCHAR(50),
    PRIMARY KEY(roomId, bedId),
    FOREIGN KEY(roomId) REFERENCES rooms(id)
);

CREATE TABLE IF NOT EXISTS signatures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50),
    original_path VARCHAR(255),
    cropped_path VARCHAR(255),
    processed_path VARCHAR(255),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(100),
    title VARCHAR(100),
    message TEXT,
    isRead BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
