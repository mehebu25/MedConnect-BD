<?php
require_once __DIR__ . '/../../config/helpers.php';
corsHeaders();

$doctorId = (int)($_GET['doctor_id'] ?? 0);
$date = sanitize($_GET['date'] ?? '');

if (!$doctorId || !$date) jsonResponse(['message' => 'doctor_id and date required'], 422);

$db = getDB();
$dayOfWeek = date('l', strtotime($date));
$allSlots = [];

$scheduleStmt = $db->prepare(
    'SELECT start_time, end_time
     FROM doctor_schedules
     WHERE doctor_id = ? AND day_of_week = ? AND is_active = 1
     ORDER BY start_time ASC'
);
$scheduleStmt->bind_param('is', $doctorId, $dayOfWeek);
$scheduleStmt->execute();
$schedules = $scheduleStmt->get_result()->fetch_all(MYSQLI_ASSOC);
$scheduleStmt->close();

if ($schedules) {
    foreach ($schedules as $schedule) {
        $cursor = strtotime($schedule['start_time']);
        $end = strtotime($schedule['end_time']);
        while ($cursor < $end) {
            $allSlots[] = date('h:i A', $cursor);
            $cursor = strtotime('+1 hour', $cursor);
        }
    }
    $allSlots = array_values(array_unique($allSlots));
} else {
    $allSlots = ['09:00 AM','10:00 AM','11:00 AM','12:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM'];
}

$stmt = $db->prepare(
    "SELECT TIME_FORMAT(appointment_time, '%h:%i %p') AS slot
     FROM appointments
     WHERE doctor_id = ? AND appointment_date = ? AND status NOT IN ('cancelled')"
);
$stmt->bind_param('is', $doctorId, $date);
$stmt->execute();
$booked = array_column($stmt->get_result()->fetch_all(MYSQLI_ASSOC), 'slot');
$stmt->close();

$available = array_values(array_filter($allSlots, fn($slot) => !in_array(strtoupper($slot), array_map('strtoupper', $booked), true)));

jsonResponse(['slots' => $available, 'booked' => $booked]);
