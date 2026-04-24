<?php
// doctors/show.php — single doctor detail
require_once __DIR__ . '/../../config/helpers.php';
corsHeaders();

$id = (int)($_GET['id'] ?? 0);
if (!$id) jsonResponse(['message' => 'Doctor ID required'], 422);

$db = getDB();
$sql = 'SELECT u.id, u.name, u.phone,
               dp.*, dp.id AS doctor_profile_id
        FROM doctor_profiles dp
        JOIN users u ON u.id = dp.user_id
        WHERE dp.id = ?';
$stmt = $db->prepare($sql);
$stmt->bind_param('i', $id);
$stmt->execute();
$doctor = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$doctor) jsonResponse(['message' => 'Doctor not found'], 404);

$doctor['is_verified']  = (bool)$doctor['is_verified'];
$doctor['is_available'] = (bool)$doctor['is_available'];

jsonResponse(['doctor' => $doctor]);
