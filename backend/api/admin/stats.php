<?php
// admin/stats.php
require_once __DIR__ . '/../../config/helpers.php';
corsHeaders();
requireRole('admin');

$db = getDB();

$stats = [];

$tables = [
    'total_users'        => "SELECT COUNT(*) FROM users",
    'total_patients'     => "SELECT COUNT(*) FROM users WHERE role='patient'",
    'total_doctors'      => "SELECT COUNT(*) FROM users WHERE role='doctor'",
    'verified_doctors'   => "SELECT COUNT(*) FROM doctor_profiles WHERE is_verified=1",
    'pending_doctors'    => "SELECT COUNT(*) FROM doctor_profiles WHERE is_verified=0",
    'total_appointments' => "SELECT COUNT(*) FROM appointments",
    'completed_appts'    => "SELECT COUNT(*) FROM appointments WHERE status='completed'",
    'total_prescriptions'=> "SELECT COUNT(*) FROM prescriptions",
];

foreach ($tables as $key => $sql) {
    $r = $db->query($sql);
    $stats[$key] = (int)$r->fetch_row()[0];
}

// Recent registrations (last 7 days)
$r = $db->query("SELECT COUNT(*) FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)");
$stats['new_users_week'] = (int)$r->fetch_row()[0];

jsonResponse(['stats' => $stats]);
