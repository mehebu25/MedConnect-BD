-- ============================================================
--  MedConnect Bangladesh — MySQL Database Schema
--  Run this file in phpMyAdmin or MySQL CLI:
--  mysql -u root -p < database.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS medconnect_bd CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE medconnect_bd;

-- ── Users (patients, doctors, admins) ───────────────────────
CREATE TABLE IF NOT EXISTS users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(150)  NOT NULL,
    email         VARCHAR(150)  NOT NULL UNIQUE,
    phone         VARCHAR(20),
    password      VARCHAR(255)  NOT NULL,
    role          ENUM('patient','doctor','admin') DEFAULT 'patient',
    address       TEXT,
    blood_group   VARCHAR(5),
    date_of_birth DATE,
    gender        ENUM('male','female','other'),
    profile_pic   VARCHAR(255),
    is_active     TINYINT(1)    DEFAULT 1,
    created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── Doctor profiles ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS doctor_profiles (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT          NOT NULL UNIQUE,
    bmdc_number     VARCHAR(20)  NOT NULL UNIQUE,
    specialization  VARCHAR(100) NOT NULL,
    experience_years INT         DEFAULT 0,
    consultation_fee DECIMAL(10,2) DEFAULT 500.00,
    bio             TEXT,
    district        VARCHAR(80),
    is_verified     TINYINT(1)   DEFAULT 0,
    is_available    TINYINT(1)   DEFAULT 1,
    rating          DECIMAL(3,2) DEFAULT 0.00,
    total_reviews   INT          DEFAULT 0,
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- BMDC verification whitelist
CREATE TABLE IF NOT EXISTS bmdc_verifications (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    bmdc_number VARCHAR(20) NOT NULL UNIQUE,
    is_active   TINYINT(1)  DEFAULT 1,
    created_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
);

-- ── Doctor schedules ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS doctor_schedules (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id   INT          NOT NULL,
    day_of_week ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'),
    start_time  TIME,
    end_time    TIME,
    is_active   TINYINT(1)   DEFAULT 1,
    FOREIGN KEY (doctor_id) REFERENCES doctor_profiles(id) ON DELETE CASCADE
);

-- ── Appointments ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    patient_id      INT          NOT NULL,
    doctor_id       INT          NOT NULL,
    appointment_date DATE         NOT NULL,
    appointment_time TIME         NOT NULL,
    consultation_type ENUM('video','voice','chat') DEFAULT 'video',
    status          ENUM('pending','confirmed','completed','cancelled') DEFAULT 'pending',
    patient_note    TEXT,
    doctor_note     TEXT,
    fee             DECIMAL(10,2),
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id)  REFERENCES doctor_profiles(id) ON DELETE CASCADE
);

-- ── Prescriptions ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS prescriptions (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id  INT          NOT NULL,
    doctor_id       INT          NOT NULL,
    patient_id      INT          NOT NULL,
    diagnosis       VARCHAR(300) NOT NULL,
    notes           TEXT,
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id)      REFERENCES doctor_profiles(id),
    FOREIGN KEY (patient_id)     REFERENCES users(id)
);

-- ── Prescription medicines ────────────────────────────────────
CREATE TABLE IF NOT EXISTS prescription_medicines (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    prescription_id INT          NOT NULL,
    medicine_name   VARCHAR(150) NOT NULL,
    dosage          VARCHAR(80),
    frequency       VARCHAR(80),
    duration        VARCHAR(80),
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE
);

-- ── Health records ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS health_records (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    patient_id  INT          NOT NULL,
    uploaded_by INT,
    record_type VARCHAR(80),
    file_name   VARCHAR(255),
    file_path   VARCHAR(500),
    notes       TEXT,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id)  REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- ── Ratings / Reviews ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id  INT          NOT NULL UNIQUE,
    patient_id      INT          NOT NULL,
    doctor_id       INT          NOT NULL,
    rating          TINYINT      NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment         TEXT,
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id),
    FOREIGN KEY (patient_id)     REFERENCES users(id),
    FOREIGN KEY (doctor_id)      REFERENCES doctor_profiles(id)
);

-- ── Contact messages ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(150),
    email      VARCHAR(150),
    message    TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
--  SEED DATA
-- ============================================================

-- BMDC verification whitelist (A-1 to A-100)
INSERT IGNORE INTO bmdc_verifications (bmdc_number)
WITH RECURSIVE seq AS (
    SELECT 1 AS n
    UNION ALL
    SELECT n + 1 FROM seq WHERE n < 100
)
SELECT CONCAT('A-', n) FROM seq;

-- Admin user  (password: admin123)
INSERT INTO users (name, email, phone, password, role) VALUES
('System Admin', 'admin@medconnect.bd', '01700000000',
 '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Sample patients  (password: password)
INSERT INTO users (name, email, phone, password, role) VALUES
('Farida Akter',    'farida@example.com',  '01711111111', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'patient'),
('Md. Karim Uddin', 'karim@example.com',   '01811111111', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'patient'),
('Taslima Begum',   'taslima@example.com', '01911111111', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'patient');

-- Sample doctors  (password: password)
INSERT INTO users (name, email, phone, password, role) VALUES
('Rashida Khanam', 'rashida@medconnect.bd', '01722222221', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'doctor'),
('Imran Hossain',  'imran@medconnect.bd',   '01722222222', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'doctor'),
('Fahmida Begum',  'fahmida@medconnect.bd', '01722222223', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'doctor'),
('Sadia Islam',    'sadia@medconnect.bd',   '01722222224', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'doctor'),
('Tanvir Ahmed',   'tanvir@medconnect.bd',  '01722222225', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'doctor'),
('Mahbub Rahman',  'mahbub@medconnect.bd',  '01722222226', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'doctor');

-- Doctor profiles (user IDs 5–10 in above inserts = IDs depend on order; adjust if needed)
INSERT INTO doctor_profiles (user_id, bmdc_number, specialization, experience_years, consultation_fee, district, is_verified, is_available, rating, total_reviews) VALUES
(5,  'A-12345', 'Internal Medicine', 14, 500.00, 'Dhaka',      1, 1, 4.90, 312),
(6,  'A-23456', 'Cardiology',        18, 800.00, 'Dhaka',      1, 1, 4.80, 248),
(7,  'A-34567', 'Pediatrics',        11, 400.00, 'Chittagong', 1, 1, 4.90, 401),
(8,  'A-45678', 'Neurology',         16, 700.00, 'Sylhet',     1, 1, 4.80, 227),
(9,  'A-56789', 'Dermatology',        9, 450.00, 'Rajshahi',   0, 0, 4.70, 185),
(10, 'A-67890', 'Internal Medicine', 12, 500.00, 'Khulna',     1, 1, 4.60, 196);

-- Doctor schedules
INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time) VALUES
(1,'Monday','09:00:00','17:00:00'), (1,'Tuesday','09:00:00','17:00:00'),
(1,'Wednesday','09:00:00','17:00:00'), (1,'Thursday','09:00:00','17:00:00'),
(1,'Friday','09:00:00','13:00:00'),
(2,'Monday','10:00:00','18:00:00'), (2,'Wednesday','10:00:00','18:00:00'),
(2,'Saturday','09:00:00','14:00:00');

-- Sample appointments
INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, consultation_type, status, fee) VALUES
(2, 1, DATE_ADD(CURDATE(), INTERVAL 5 DAY),  '10:00:00', 'video', 'confirmed', 500.00),
(2, 2, DATE_ADD(CURDATE(), INTERVAL 8 DAY),  '14:30:00', 'video', 'pending',   800.00),
(2, 3, DATE_SUB(CURDATE(), INTERVAL 10 DAY), '11:00:00', 'chat',  'completed', 400.00),
(3, 1, DATE_ADD(CURDATE(), INTERVAL 3 DAY),  '09:00:00', 'video', 'confirmed', 500.00),
(4, 4, DATE_SUB(CURDATE(), INTERVAL 5 DAY),  '15:00:00', 'voice', 'completed', 700.00);

-- Sample prescriptions
INSERT INTO prescriptions (appointment_id, doctor_id, patient_id, diagnosis, notes) VALUES
(3, 3, 2, 'Acute Pharyngitis', 'Take medicines after meals. Drink warm fluids. Rest for 3 days.'),
(5, 4, 4, 'Tension Headache',  'Avoid screen time. Sleep 8 hours. Hydrate well.');

INSERT INTO prescription_medicines (prescription_id, medicine_name, dosage, frequency, duration) VALUES
(1, 'Amoxicillin 500mg',  '1 tablet', '3 times/day',       '7 days'),
(1, 'Paracetamol 500mg',  '1 tablet', 'Every 6 hours',     '3 days'),
(1, 'Cetirizine 10mg',    '1 tablet', 'Once at night',     '5 days'),
(2, 'Paracetamol 500mg',  '1 tablet', 'Twice daily',       '3 days'),
(2, 'Flunarizine 5mg',    '1 tablet', 'Once at bedtime',   '14 days');

-- Sample health records
INSERT INTO health_records (patient_id, uploaded_by, record_type, file_name) VALUES
(2, 7, 'Lab Report', 'CBC_Blood_Test.pdf'),
(2, 2, 'X-Ray',      'Chest_XRay_March.jpg'),
(4, 8, 'ECG',        'ECG_Report.pdf');
