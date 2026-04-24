<?php
// records/index.php
require_once __DIR__ . '/../../config/helpers.php';
corsHeaders();

function ensureHealthRecordsTable($db) {
    $sql = "CREATE TABLE IF NOT EXISTS health_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        uploaded_by INT NULL,
        record_type VARCHAR(80),
        file_name VARCHAR(255),
        file_path VARCHAR(500),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
    )";

    if (!$db->query($sql)) {
        jsonResponse(['message' => 'Could not initialize health records storage'], 500);
    }
}

$auth = requireAuth();
$db   = getDB();
ensureHealthRecordsTable($db);

if ($auth['role'] === 'patient') {
    $uid = $auth['user_id'];
} elseif ($auth['role'] === 'admin') {
    $uid = (int)($_GET['patient_id'] ?? 0);
    if (!$uid) jsonResponse(['message' => 'patient_id required'], 422);
} else {
    jsonResponse(['message' => 'Forbidden'], 403);
}

$stmt = $db->prepare(
    "SELECT hr.id, hr.record_type AS type, hr.file_name AS name,
            hr.notes, hr.created_at AS date,
            u.name AS uploaded_by_name
     FROM health_records hr
     LEFT JOIN users u ON u.id = hr.uploaded_by
     WHERE hr.patient_id = ?
     ORDER BY hr.created_at DESC"
);
if (!$stmt) {
    jsonResponse(['records' => [], 'message' => 'Health records are temporarily unavailable']);
}
$stmt->bind_param('i', $uid);
$stmt->execute();
$rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();

// add colour hints for frontend
$colorMap = ['Lab Report'=>'teal','X-Ray'=>'gold','ECG'=>'red','MRI'=>'purple','Ultrasound'=>'blue'];
foreach ($rows as &$r) {
    $r['color'] = $colorMap[$r['type']] ?? 'gray';
}

jsonResponse(['records' => $rows]);
