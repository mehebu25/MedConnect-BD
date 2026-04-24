<?php
require_once __DIR__ . '/../../config/helpers.php';
corsHeaders();

$auth = requireAuth();
$db   = getDB();

// ── GET profile ──────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = 'SELECT u.id, u.name, u.email, u.phone, u.role, u.address, u.blood_group,
                   u.gender, u.profile_pic, u.created_at,
                   dp.id AS doctor_profile_id, dp.bmdc_number, dp.specialization,
                   dp.experience_years, dp.consultation_fee, dp.bio,
                   dp.district, dp.is_verified, dp.is_available, dp.rating, dp.total_reviews
            FROM users u
            LEFT JOIN doctor_profiles dp ON dp.user_id = u.id
            WHERE u.id = ?';
    $stmt = $db->prepare($sql);
    $stmt->bind_param('i', $auth['user_id']);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$user) jsonResponse(['message' => 'User not found'], 404);

    if ($user['role'] === 'doctor') $user['is_verified'] = (bool)$user['is_verified'];
    jsonResponse(['user' => $user]);
}

// ── PUT update profile ───────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data    = getInput();
    $name    = sanitize($data['name']        ?? '');
    $phone   = sanitize($data['phone']       ?? '');
    $address = sanitize($data['address']     ?? '');
    $blood   = sanitize($data['blood_group'] ?? '');
    $gender  = in_array($data['gender'] ?? '', ['male','female','other']) ? $data['gender'] : null;

    $stmt = $db->prepare('UPDATE users SET name=?, phone=?, address=?, blood_group=?, gender=? WHERE id=?');
    $stmt->bind_param('sssssi', $name, $phone, $address, $blood, $gender, $auth['user_id']);
    $stmt->execute();
    $stmt->close();

    // Update doctor profile fields if doctor
    if ($auth['role'] === 'doctor') {
        $spec = sanitize($data['specialization'] ?? '');
        $exp  = (int)($data['experience_years']  ?? 0);
        $fee  = (float)($data['consultation_fee']?? 0);
        $bio  = sanitize($data['bio']            ?? '');
        $dist = sanitize($data['district']       ?? '');

        $stmt = $db->prepare('UPDATE doctor_profiles SET specialization=?, experience_years=?, consultation_fee=?, bio=?, district=? WHERE user_id=?');
        $stmt->bind_param('sidssi', $spec, $exp, $fee, $bio, $dist, $auth['user_id']);
        $stmt->execute();
        $stmt->close();
    }

    jsonResponse(['message' => 'Profile updated successfully']);
}

// ── POST change password ─────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data    = getInput();
    $current = $data['current_password'] ?? '';
    $new     = $data['new_password']     ?? '';

    if (strlen($new) < 6) jsonResponse(['message' => 'New password must be at least 6 characters'], 422);

    $stmt = $db->prepare('SELECT password FROM users WHERE id = ?');
    $stmt->bind_param('i', $auth['user_id']);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!checkPassword($current, $row['password'])) jsonResponse(['message' => 'Current password is incorrect'], 401);

    $hashed = hashPassword($new);
    $stmt = $db->prepare('UPDATE users SET password = ? WHERE id = ?');
    $stmt->bind_param('si', $hashed, $auth['user_id']);
    $stmt->execute();
    $stmt->close();

    jsonResponse(['message' => 'Password updated successfully']);
}

jsonResponse(['message' => 'Method not allowed'], 405);
