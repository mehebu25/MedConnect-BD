<?php
require_once __DIR__ . '/../../config/helpers.php';
corsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonResponse(['message' => 'Method not allowed'], 405);

$data = getInput();

$name     = sanitize($data['name']     ?? '');
$email    = strtolower(trim($data['email']    ?? ''));
$phone    = sanitize($data['phone']    ?? '');
$password = $data['password'] ?? '';
$role     = in_array($data['role'] ?? '', ['patient','doctor','admin']) ? $data['role'] : 'patient';

if (!$name)                       jsonResponse(['message' => 'Name is required'], 422);
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) jsonResponse(['message' => 'Valid email required'], 422);
if (strlen($password) < 6)        jsonResponse(['message' => 'Password must be at least 6 characters'], 422);

$db = getDB();

// Check duplicate email
$stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
$stmt->bind_param('s', $email);
$stmt->execute();
if ($stmt->get_result()->num_rows > 0) jsonResponse(['message' => 'Email already registered'], 409);
$stmt->close();

$hashed = hashPassword($password);

$stmt = $db->prepare('INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)');
$stmt->bind_param('sssss', $name, $email, $phone, $hashed, $role);
$stmt->execute();
$userId = $db->insert_id;
$stmt->close();

// If doctor, create profile
if ($role === 'doctor') {
    $bmdc  = sanitize($data['bmdc_number']    ?? '');
    $spec  = sanitize($data['specialization'] ?? 'General Practice');
    $exp   = (int)($data['experience']        ?? 0);
    $fee   = (float)($data['fee']             ?? 500.00);

    if (!$bmdc) jsonResponse(['message' => 'BMDC number is required for doctors'], 422);

    $stmt = $db->prepare('INSERT INTO doctor_profiles (user_id, bmdc_number, specialization, experience_years, consultation_fee) VALUES (?, ?, ?, ?, ?)');
    $stmt->bind_param('issis', $userId, $bmdc, $spec, $exp, $fee);
    // Note: is_verified defaults to 0 (pending admin approval)
    $stmt->execute();
    $stmt->close();
}

$token = generateToken(['user_id' => $userId, 'role' => $role, 'email' => $email]);

jsonResponse([
    'message' => 'Registration successful',
    'token'   => $token,
    'user'    => [
        'id'    => $userId,
        'name'  => $name,
        'email' => $email,
        'phone' => $phone,
        'role'  => $role,
    ]
], 201);
