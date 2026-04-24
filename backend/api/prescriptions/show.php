<?php
require_once __DIR__ . '/../../config/helpers.php';
corsHeaders();

$auth = requireAuth();
$id   = (int)($_GET['id'] ?? 0);
if (!$id) jsonResponse(['message' => 'Prescription ID required'], 422);

$db = getDB();

$sql = "SELECT rx.id, rx.diagnosis, rx.notes, rx.created_at AS date,
               du.name AS doctor_name, dp.specialization AS doctor_spec,
               dp.bmdc_number AS bmdc,
               pu.name AS patient_name, pu.phone AS patient_phone
        FROM prescriptions rx
        JOIN doctor_profiles dp ON dp.id = rx.doctor_id
        JOIN users du ON du.id = dp.user_id
        JOIN users pu ON pu.id = rx.patient_id
        WHERE rx.id = ?";

$stmt = $db->prepare($sql);
$stmt->bind_param('i', $id);
$stmt->execute();
$rx = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$rx) jsonResponse(['message' => 'Prescription not found'], 404);

// Access control
if ($auth['role'] === 'patient' && $auth['user_id'] !== (int)$rx['patient_id'] ?? 0) {
    // re-fetch patient_id
    $check = $db->prepare('SELECT patient_id FROM prescriptions WHERE id = ?');
    $check->bind_param('i', $id); $check->execute();
    $pat = $check->get_result()->fetch_assoc(); $check->close();
    if ($pat['patient_id'] !== $auth['user_id']) jsonResponse(['message' => 'Forbidden'], 403);
}

$ms = $db->prepare('SELECT medicine_name AS name, dosage AS dose, frequency AS freq, duration FROM prescription_medicines WHERE prescription_id = ?');
$ms->bind_param('i', $id); $ms->execute();
$rx['medicineList'] = $ms->get_result()->fetch_all(MYSQLI_ASSOC);
$ms->close();

jsonResponse(['prescription' => $rx]);
