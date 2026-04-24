<?php
require_once __DIR__ . '/../../config/helpers.php';
corsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonResponse(['message' => 'Method not allowed'], 405);

$auth = requireRole('doctor');
$data = getInput();

$apptId    = (int)($data['appointment_id'] ?? 0);
$diagnosis = sanitize($data['diagnosis']   ?? '');
$notes     = sanitize($data['notes']       ?? '');
$medicines = $data['medicines']            ?? [];

if (!$apptId || !$diagnosis) jsonResponse(['message' => 'appointment_id and diagnosis are required'], 422);

$db = getDB();

// Get doctor_profile_id
$s2 = $db->prepare('SELECT id FROM doctor_profiles WHERE user_id = ?');
$s2->bind_param('i', $auth['user_id']); $s2->execute();
$dp = $s2->get_result()->fetch_assoc(); $s2->close();
if (!$dp) jsonResponse(['message' => 'Doctor profile not found'], 404);
$dpId = $dp['id'];

// Verify appointment belongs to this doctor
$stmt = $db->prepare('SELECT id, patient_id FROM appointments WHERE id = ? AND doctor_id = ?');
$stmt->bind_param('ii', $apptId, $dpId);
$stmt->execute();
$appt = $stmt->get_result()->fetch_assoc();
$stmt->close();
if (!$appt) jsonResponse(['message' => 'Appointment not found'], 404);

// Check no duplicate prescription
$dup = $db->prepare('SELECT id FROM prescriptions WHERE appointment_id = ?');
$dup->bind_param('i', $apptId); $dup->execute();
if ($dup->get_result()->num_rows > 0) jsonResponse(['message' => 'Prescription already issued for this appointment'], 409);
$dup->close();

$patientId = $appt['patient_id'];

$ins = $db->prepare('INSERT INTO prescriptions (appointment_id, doctor_id, patient_id, diagnosis, notes) VALUES (?,?,?,?,?)');
$ins->bind_param('iiiss', $apptId, $dpId, $patientId, $diagnosis, $notes);
$ins->execute();
$rxId = $db->insert_id;
$ins->close();

// Insert medicines
foreach ($medicines as $med) {
    $name     = sanitize($med['name']     ?? '');
    $dose     = sanitize($med['dose']     ?? '');
    $freq     = sanitize($med['freq']     ?? '');
    $duration = sanitize($med['duration'] ?? '');
    if (!$name) continue;
    $ms = $db->prepare('INSERT INTO prescription_medicines (prescription_id, medicine_name, dosage, frequency, duration) VALUES (?,?,?,?,?)');
    $ms->bind_param('issss', $rxId, $name, $dose, $freq, $duration);
    $ms->execute(); $ms->close();
}

// Mark appointment completed
$upd = $db->prepare('UPDATE appointments SET status = "completed" WHERE id = ?');
$upd->bind_param('i', $apptId); $upd->execute(); $upd->close();

jsonResponse(['message' => 'Prescription issued successfully', 'prescription_id' => $rxId], 201);
