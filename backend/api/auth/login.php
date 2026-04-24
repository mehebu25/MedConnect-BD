<?php
require_once __DIR__ . '/../../config/helpers.php';
corsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonResponse(['message' => 'Method not allowed'], 405);

$data     = getInput();
$email    = strtolower(trim($data['email']    ?? ''));
$password = $data['password'] ?? '';
$role     = $data['role']     ?? '';

if (!$email || !$password) jsonResponse(['message' => 'Email and password are required'], 422);

$db = getDB();

$sql = 'SELECT u.*, dp.id AS doctor_profile_id, dp.bmdc_number, dp.specialization,
               dp.consultation_fee, dp.is_verified, dp.is_available, dp.rating, dp.district
        FROM users u
        LEFT JOIN doctor_profiles dp ON dp.user_id = u.id
        WHERE u.email = ? AND u.is_active = 1';
$stmt = $db->prepare($sql);
$stmt->bind_param('s', $email);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$user || !checkPassword($password, $user['password'])) {
    jsonResponse(['message' => 'Invalid email or password'], 401);
}

// Optionally enforce role match
if ($role && $user['role'] !== $role) {
    jsonResponse(['message' => "No {$role} account found with these credentials"], 401);
}

$token = generateToken(['user_id' => $user['id'], 'role' => $user['role'], 'email' => $user['email']]);

$responseUser = [
    'id'            => $user['id'],
    'name'          => $user['name'],
    'email'         => $user['email'],
    'phone'         => $user['phone'],
    'role'          => $user['role'],
    'profile_pic'   => $user['profile_pic'],
];

if ($user['role'] === 'doctor') {
    $responseUser['doctor_profile_id'] = $user['doctor_profile_id'];
    $responseUser['bmdc_number']       = $user['bmdc_number'];
    $responseUser['specialization']    = $user['specialization'];
    $responseUser['is_verified']       = (bool)$user['is_verified'];
    $responseUser['is_available']      = (bool)$user['is_available'];
    $responseUser['rating']            = $user['rating'];
    $responseUser['district']          = $user['district'];
    $responseUser['consultation_fee']  = $user['consultation_fee'];
}

jsonResponse(['message' => 'Login successful', 'token' => $token, 'user' => $responseUser]);
