USE janani;

-- Run once against an existing JANANI database created from the original starter schema.
-- A fresh database should use ../schema.sql instead. These statements only add columns/tables
-- and do not rewrite existing user records.
ALTER TABLE vaccination_reminders
  ADD COLUMN delivery_channel ENUM('in_app','sms') DEFAULT 'in_app',
  ADD COLUMN delivery_status ENUM('not_applicable','queued','sent','failed') DEFAULT 'not_applicable',
  ADD COLUMN provider_reference VARCHAR(180),
  MODIFY COLUMN status ENUM('pending','completed','cancelled') DEFAULT 'pending';

ALTER TABLE health_content
  ADD COLUMN source_url VARCHAR(500),
  ADD COLUMN verification_status ENUM('unverified','verified') DEFAULT 'unverified',
  ADD COLUMN last_verified_at DATE;

ALTER TABLE government_schemes
  ADD COLUMN verification_status ENUM('unverified','verified') DEFAULT 'unverified',
  ADD COLUMN last_verified_at DATE,
  ADD COLUMN is_published BOOLEAN DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS health_logs (id INT PRIMARY KEY AUTO_INCREMENT, user_id INT NOT NULL, log_type ENUM('body_change','allergy','general') NOT NULL, body_changes TEXT, allergies TEXT, notes TEXT, recorded_date DATE NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, INDEX idx_health_logs_user_date (user_id, recorded_date));
CREATE TABLE IF NOT EXISTS facilities (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(180) NOT NULL, facility_type ENUM('hospital','anganwadi') NOT NULL, address VARCHAR(500) NOT NULL, phone VARCHAR(30), latitude DECIMAL(9,6), longitude DECIMAL(9,6), source_url VARCHAR(500), verification_status ENUM('unverified','verified') DEFAULT 'unverified', is_demo BOOLEAN DEFAULT TRUE, is_active BOOLEAN DEFAULT TRUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, INDEX idx_facilities_type (facility_type), INDEX idx_facilities_coordinates (latitude, longitude));
CREATE TABLE IF NOT EXISTS asha_workers (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(150) NOT NULL, phone VARCHAR(30) NOT NULL, verification_status ENUM('unverified','verified') DEFAULT 'unverified', is_active BOOLEAN DEFAULT TRUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS user_asha_workers (user_id INT PRIMARY KEY, asha_worker_id INT NOT NULL, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY (asha_worker_id) REFERENCES asha_workers(id) ON DELETE RESTRICT);
