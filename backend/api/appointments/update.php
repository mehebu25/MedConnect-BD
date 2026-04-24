<?php
require_once __DIR__ . '/../../config/helpers.php';
corsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') jsonResponse(['message' => 'Method not allowed'], 405);

$auth   = requireRole(['doctor','admin']);
$data   = getInput();
$id     = (int)($data['id']     ?? 0);
$status = sanitize($data['status'] ?? '');
$note   = sanitize($data['doctor_note'] ?? '');

$allowed = ['confirmed','completed','cancelled'];
if (!$id || !in_array($status, $allowed)) jsonResponse(['message' => 'Invalid id or status'], 422);

$db = getDB();

if ($auth['role'] === 'doctor') {
    $s2 = $db->prepare('SELECT id FROM doctor_profiles WHERE user_id = ?');
    $s2->bind_param('i', $auth['user_id']); $s2->execute();
    $dp = $s2->get_result()->fetch_assoc(); $s2->close();
    $dpId = $dp['id'] ?? 0;
    $stmt = $db->prepare('UPDATE appointments SET status=?, doctor_note=? WHERE id=? AND doctor_id=?');
    $stmt->bind_param('ssii', $status, $note, $id, $dpId);
} else {
    $stmt = $db->prepare('UPDATE appointments SET status=?, doctor_note=? WHERE id=?');
    $stmt->bind_param('ssi', $status, $note, $id);
}

$stmt->execute();
if ($stmt->affected_rows === 0) jsonResponse(['message' => 'Appointment not found or unchanged'], 404);
$stmt->close();

jsonResponse(['message' => "Appointment marked as {$status}"]);
