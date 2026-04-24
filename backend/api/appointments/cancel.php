<?php
// appointments/cancel.php
require_once __DIR__ . '/../../config/helpers.php';
corsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonResponse(['message' => 'Method not allowed'], 405);

$auth = requireAuth();
$data = getInput();
$id   = (int)($data['id'] ?? 0);
if (!$id) jsonResponse(['message' => 'Appointment ID required'], 422);

$db = getDB();

// Verify ownership
if ($auth['role'] === 'patient') {
    $stmt = $db->prepare('SELECT id, status, appointment_date, appointment_time FROM appointments WHERE id = ? AND patient_id = ?');
    $stmt->bind_param('ii', $id, $auth['user_id']);
} elseif ($auth['role'] === 'doctor') {
    $s2 = $db->prepare('SELECT id FROM doctor_profiles WHERE user_id = ?');
    $s2->bind_param('i', $auth['user_id']); $s2->execute();
    $dp = $s2->get_result()->fetch_assoc(); $s2->close();
    $dpId = $dp['id'] ?? 0;
    $stmt = $db->prepare('SELECT id, status, appointment_date, appointment_time FROM appointments WHERE id = ? AND doctor_id = ?');
    $stmt->bind_param('ii', $id, $dpId);
} elseif ($auth['role'] === 'admin') {
    $stmt = $db->prepare('SELECT id, status, appointment_date, appointment_time FROM appointments WHERE id = ?');
    $stmt->bind_param('i', $id);
} else {
    jsonResponse(['message' => 'Forbidden'], 403);
}

$stmt->execute();
$appt = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$appt)                          jsonResponse(['message' => 'Appointment not found'], 404);
if ($appt['status'] === 'cancelled') jsonResponse(['message' => 'Already cancelled'], 400);
if ($appt['status'] === 'completed') jsonResponse(['message' => 'Completed appointments cannot be cancelled'], 400);

$upd = $db->prepare('UPDATE appointments SET status = "cancelled" WHERE id = ?');
$upd->bind_param('i', $id);
$upd->execute();
$upd->close();

jsonResponse(['message' => 'Appointment cancelled successfully']);
