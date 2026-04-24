<?php
require_once __DIR__ . '/../../config/helpers.php';
corsHeaders();

$auth = requireRole('doctor');
$db = getDB();

$profileStmt = $db->prepare('SELECT id FROM doctor_profiles WHERE user_id = ?');
$profileStmt->bind_param('i', $auth['user_id']);
$profileStmt->execute();
$doctor = $profileStmt->get_result()->fetch_assoc();
$profileStmt->close();

if (!$doctor) jsonResponse(['message' => 'Doctor profile not found'], 404);

$doctorId = (int)$doctor['id'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $db->prepare(
        'SELECT day_of_week, start_time, end_time, is_active
         FROM doctor_schedules
         WHERE doctor_id = ?
         ORDER BY FIELD(day_of_week, "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday")'
    );
    $stmt->bind_param('i', $doctorId);
    $stmt->execute();
    $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();

    foreach ($rows as &$row) {
        $row['is_active'] = (bool)$row['is_active'];
    }

    jsonResponse(['schedule' => $rows]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') jsonResponse(['message' => 'Method not allowed'], 405);

$data = getInput();
$schedule = $data['schedule'] ?? [];
if (!is_array($schedule)) jsonResponse(['message' => 'schedule must be an array'], 422);

$deleteStmt = $db->prepare('DELETE FROM doctor_schedules WHERE doctor_id = ?');
$deleteStmt->bind_param('i', $doctorId);
$deleteStmt->execute();
$deleteStmt->close();

$insertStmt = $db->prepare(
    'INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, is_active)
     VALUES (?, ?, ?, ?, ?)'
);

foreach ($schedule as $item) {
    $day = sanitize($item['day_of_week'] ?? '');
    $start = sanitize($item['start_time'] ?? '');
    $end = sanitize($item['end_time'] ?? '');
    $active = !empty($item['is_active']) ? 1 : 0;

    if (!$day || !$start || !$end) {
        continue;
    }

    $insertStmt->bind_param('isssi', $doctorId, $day, $start, $end, $active);
    $insertStmt->execute();
}

$insertStmt->close();

jsonResponse(['message' => 'Schedule updated successfully']);
