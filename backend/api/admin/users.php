<?php
require_once __DIR__ . '/../../config/helpers.php';
corsHeaders();
requireRole('admin');

$db   = getDB();
$role = sanitize($_GET['role'] ?? '');

$sql  = "SELECT u.id, u.name, u.email, u.phone, u.role, u.is_active, u.created_at,
                dp.id AS doctor_profile_id, dp.bmdc_number, dp.specialization, dp.experience_years,
                dp.consultation_fee, dp.district, dp.is_verified, dp.is_available, dp.rating, dp.total_reviews
         FROM users u
         LEFT JOIN doctor_profiles dp ON dp.user_id = u.id";

if ($role) {
    $stmt = $db->prepare($sql . ' WHERE u.role = ? ORDER BY u.created_at DESC LIMIT 200');
    $stmt->bind_param('s', $role);
} else {
    $stmt = $db->prepare($sql . ' ORDER BY u.created_at DESC LIMIT 200');
}

$stmt->execute();
$rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();

foreach ($rows as &$r) {
    $r['is_active']   = (bool)$r['is_active'];
    $r['is_verified'] = (bool)($r['is_verified'] ?? false);
    $r['active']      = $r['is_active'];
    $r['joined']      = date('Y-m-d', strtotime($r['created_at']));
}

jsonResponse(['users' => $rows]);
