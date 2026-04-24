<?php
require_once __DIR__ . '/../../config/helpers.php';
corsHeaders();

function ensureBmdcVerificationTable($db) {
    $createSql = "CREATE TABLE IF NOT EXISTS bmdc_verifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        bmdc_number VARCHAR(20) NOT NULL UNIQUE,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";

    if (!$db->query($createSql)) {
        jsonResponse(['message' => 'Could not prepare BMDC verification storage'], 500);
    }

    $countResult = $db->query("SELECT COUNT(*) AS total FROM bmdc_verifications");
    if (!$countResult) {
        jsonResponse(['message' => 'Could not read BMDC verification storage'], 500);
    }

    $countRow = $countResult->fetch_assoc();
    if ((int)($countRow['total'] ?? 0) > 0) {
        return;
    }

    $insert = $db->prepare('INSERT IGNORE INTO bmdc_verifications (bmdc_number, is_active) VALUES (?, 1)');
    if (!$insert) {
        jsonResponse(['message' => 'Could not seed BMDC verification data'], 500);
    }

    for ($i = 1; $i <= 100; $i++) {
        $bmdcNumber = 'A-' . $i;
        $insert->bind_param('s', $bmdcNumber);
        $insert->execute();
    }

    $insert->close();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonResponse(['message' => 'Method not allowed'], 405);

requireRole('admin');
$data   = getInput();
$id     = (int)($data['id']     ?? 0);
$status = (int)($data['status'] ?? 0); // 1 = verify, 0 = revoke

if (!$id) jsonResponse(['message' => 'Doctor profile ID required'], 422);

$db   = getDB();
ensureBmdcVerificationTable($db);
$find = $db->prepare('SELECT id, bmdc_number, is_verified FROM doctor_profiles WHERE id = ?');
$find->bind_param('i', $id);
$find->execute();
$doctor = $find->get_result()->fetch_assoc();
$find->close();

if (!$doctor) jsonResponse(['message' => 'Doctor not found'], 404);

if ($status === 1) {
    $check = $db->prepare('SELECT id FROM bmdc_verifications WHERE bmdc_number = ? AND is_active = 1');
    $check->bind_param('s', $doctor['bmdc_number']);
    $check->execute();
    $verified = $check->get_result()->fetch_assoc();
    $check->close();

    if (!$verified) {
        jsonResponse(['message' => 'BMDC verification failed. Add this BMDC number to the verification table first.'], 422);
    }
}

if ((int)$doctor['is_verified'] === $status) {
    $msg = $status ? 'Doctor already verified' : 'Doctor already unverified';
    jsonResponse(['message' => $msg]);
}

$stmt = $db->prepare('UPDATE doctor_profiles SET is_verified = ? WHERE id = ?');
$stmt->bind_param('ii', $status, $id);
$stmt->execute();
$stmt->close();

$msg = $status ? 'Doctor verified successfully' : 'Doctor verification revoked';
jsonResponse(['message' => $msg]);
