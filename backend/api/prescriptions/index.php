<?php
// prescriptions/index.php
require_once __DIR__ . '/../../config/helpers.php';
corsHeaders();

$auth = requireAuth();
$db   = getDB();

if ($auth['role'] === 'patient') {
    $sql = "SELECT rx.id, rx.diagnosis, rx.notes, rx.created_at AS date,
                   u.name AS doctor_name, dp.specialization AS doctor_spec, dp.bmdc_number AS bmdc
            FROM prescriptions rx
            JOIN doctor_profiles dp ON dp.id = rx.doctor_id
            JOIN users u ON u.id = dp.user_id
            WHERE rx.patient_id = ?
            ORDER BY rx.created_at DESC";
    $stmt = $db->prepare($sql);
    $stmt->bind_param('i', $auth['user_id']);

} elseif ($auth['role'] === 'doctor') {
    $s2 = $db->prepare('SELECT id FROM doctor_profiles WHERE user_id = ?');
    $s2->bind_param('i', $auth['user_id']); $s2->execute();
    $dp = $s2->get_result()->fetch_assoc(); $s2->close();
    $dpId = $dp['id'] ?? 0;

    $sql = "SELECT rx.id, rx.diagnosis, rx.notes, rx.created_at AS date,
                   p.name AS patient_name
            FROM prescriptions rx
            JOIN users p ON p.id = rx.patient_id
            WHERE rx.doctor_id = ?
            ORDER BY rx.created_at DESC";
    $stmt = $db->prepare($sql);
    $stmt->bind_param('i', $dpId);
} else {
    jsonResponse(['message' => 'Forbidden'], 403);
}

$stmt->execute();
$rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();

// Attach medicines to each prescription
foreach ($rows as &$row) {
    $ms = $db->prepare('SELECT medicine_name AS name, dosage AS dose, frequency AS freq, duration FROM prescription_medicines WHERE prescription_id = ?');
    $ms->bind_param('i', $row['id']); $ms->execute();
    $row['medicineList'] = $ms->get_result()->fetch_all(MYSQLI_ASSOC);
    $ms->close();
    $row['medicines'] = array_column($row['medicineList'], 'name');
}

jsonResponse(['prescriptions' => $rows]);
