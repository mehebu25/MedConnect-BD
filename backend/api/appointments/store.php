<?php
require_once __DIR__ . '/../../config/helpers.php';
corsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonResponse(['message' => 'Method not allowed'], 405);

$auth = requireRole('patient');
$data = getInput();

$doctorId  = (int)($data['doctor_id'] ?? 0);
$date      = sanitize($data['date']   ?? '');
$time      = sanitize($data['time']   ?? '');
$type      = in_array($data['type'] ?? '', ['video','voice','chat']) ? $data['type'] : 'video';
$note      = sanitize($data['note']   ?? '');

if (!$doctorId || !$date || !$time) jsonResponse(['message' => 'doctor_id, date and time are required'], 422);

// Validate date is in the future
if (strtotime($date) < strtotime('today')) jsonResponse(['message' => 'Appointment date must be today or in the future'], 422);

$db = getDB();

// Check doctor exists and is verified
$stmt = $db->prepare('SELECT id, consultation_fee, is_verified FROM doctor_profiles WHERE id = ?');
$stmt->bind_param('i', $doctorId);
$stmt->execute();
$doctor = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$doctor) jsonResponse(['message' => 'Doctor not found'], 404);
if (!$doctor['is_verified']) jsonResponse(['message' => 'Doctor is not yet verified'], 400);

// Check slot not already booked
$timeFormatted = date('H:i:s', strtotime($time));
$stmt = $db->prepare(
    "SELECT id FROM appointments WHERE doctor_id=? AND appointment_date=? AND appointment_time=? AND status NOT IN ('cancelled')"
);
$stmt->bind_param('iss', $doctorId, $date, $timeFormatted);
$stmt->execute();
if ($stmt->get_result()->num_rows > 0) jsonResponse(['message' => 'This time slot is already booked'], 409);
$stmt->close();

$patientId = $auth['user_id'];
$fee       = $doctor['consultation_fee'];

$stmt = $db->prepare(
    'INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, consultation_type, patient_note, fee, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, "pending")'
);
$stmt->bind_param('iissssd', $patientId, $doctorId, $date, $timeFormatted, $type, $note, $fee);
$stmt->execute();
$apptId = $db->insert_id;
$stmt->close();

jsonResponse([
    'message'        => 'Appointment booked successfully',
    'appointment_id' => $apptId,
    'fee'            => $fee,
    'status'         => 'pending',
    'session_room'   => 'medconnect-' . $apptId,
], 201);
