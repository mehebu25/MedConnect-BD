<?php
require_once __DIR__ . '/../../config/helpers.php';
corsHeaders();

$auth = requireAuth();
$db   = getDB();

if ($auth['role'] === 'patient') {
    $sql = "SELECT a.id, a.appointment_date AS date,
                   TIME_FORMAT(a.appointment_time,'%h:%i %p') AS time,
                   a.consultation_type AS type, a.consultation_type, a.status, a.patient_note AS note, a.doctor_note, a.fee,
                   u.name  AS doctor_name,
                   dp.specialization AS specialty, dp.id AS doctor_profile_id,
                   CONCAT('medconnect-', a.id) AS session_room
            FROM appointments a
            JOIN doctor_profiles dp ON dp.id = a.doctor_id
            JOIN users u ON u.id = dp.user_id
            WHERE a.patient_id = ?
            ORDER BY a.appointment_date DESC, a.appointment_time DESC";
    $stmt = $db->prepare($sql);
    $stmt->bind_param('i', $auth['user_id']);

} elseif ($auth['role'] === 'doctor') {
    // Get doctor_profile_id for this user
    $s2 = $db->prepare('SELECT id FROM doctor_profiles WHERE user_id = ?');
    $s2->bind_param('i', $auth['user_id']);
    $s2->execute();
    $dp = $s2->get_result()->fetch_assoc();
    $s2->close();
    if (!$dp) jsonResponse(['appointments' => []]);

    $dpId = $dp['id'];
    $sql  = "SELECT a.id, a.appointment_date AS date,
                    TIME_FORMAT(a.appointment_time,'%h:%i %p') AS time,
                    a.consultation_type AS type, a.consultation_type, a.status, a.patient_note AS note, a.doctor_note, a.fee,
                    u.name  AS patient_name, u.phone AS patient_phone, u.email AS patient_email,
                    CONCAT('medconnect-', a.id) AS session_room
             FROM appointments a
             JOIN users u ON u.id = a.patient_id
             WHERE a.doctor_id = ?
             ORDER BY a.appointment_date DESC, a.appointment_time DESC";
    $stmt = $db->prepare($sql);
    $stmt->bind_param('i', $dpId);

} elseif ($auth['role'] === 'admin') {
    $sql  = "SELECT a.id, a.appointment_date AS date,
                    TIME_FORMAT(a.appointment_time,'%h:%i %p') AS time,
                    a.consultation_type AS type, a.consultation_type, a.status, a.fee,
                    p.name AS patient_name, d.name AS doctor_name
             FROM appointments a
             JOIN users p ON p.id = a.patient_id
             JOIN doctor_profiles dp ON dp.id = a.doctor_id
             JOIN users d ON d.id = dp.user_id
             ORDER BY a.appointment_date DESC
             LIMIT 200";
    $stmt = $db->prepare($sql);
} else {
    jsonResponse(['message' => 'Forbidden'], 403);
}

$stmt->execute();
$rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();

foreach ($rows as &$row) {
    $row['can_join'] = in_array($row['status'], ['confirmed', 'completed'], true);
}

jsonResponse(['appointments' => $rows]);
