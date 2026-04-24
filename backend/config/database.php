<?php
// backend/config/database.php
define('DB_HOST',     'localhost');
define('DB_USER',     'root');        // Change to your MySQL user
define('DB_PASS',     '');            // Change to your MySQL password
define('DB_NAME',     'medconnect_bd');
define('JWT_SECRET',  'medconnect_jwt_secret_2026_change_this');
define('JWT_EXPIRE',  86400 * 7);     // 7 days

function getDB() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if ($conn->connect_error) {
        http_response_code(500);
        echo json_encode(['message' => 'Database connection failed: ' . $conn->connect_error]);
        exit;
    }
    $conn->set_charset('utf8mb4');
    return $conn;
}
