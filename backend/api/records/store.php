<?php
require_once __DIR__ . '/../../config/helpers.php';
corsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonResponse(['message' => 'Method not allowed'], 405);

$auth = requireAuth();
if (!in_array($auth['role'], ['patient','doctor','admin'])) jsonResponse(['message' => 'Forbidden'], 403);

$patientId  = (int)($_POST['patient_id'] ?? $auth['user_id']);
$recordType = sanitize($_POST['record_type'] ?? 'General');
$notes      = sanitize($_POST['notes']       ?? '');

if (empty($_FILES['file'])) jsonResponse(['message' => 'No file uploaded'], 422);

$file     = $_FILES['file'];
$allowed  = ['pdf','jpg','jpeg','png','doc','docx'];
$ext      = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

if (!in_array($ext, $allowed)) jsonResponse(['message' => 'File type not allowed. Allowed: ' . implode(', ', $allowed)], 422);
if ($file['size'] > 10 * 1024 * 1024) jsonResponse(['message' => 'File too large (max 10MB)'], 422);

$uploadDir = __DIR__ . '/../../uploads/records/';
if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

$filename = uniqid('record_') . '.' . $ext;
$filepath = $uploadDir . $filename;

if (!move_uploaded_file($file['tmp_name'], $filepath)) jsonResponse(['message' => 'Upload failed'], 500);

$db = getDB();
$stmt = $db->prepare('INSERT INTO health_records (patient_id, uploaded_by, record_type, file_name, file_path, notes) VALUES (?,?,?,?,?,?)');
$relPath = 'uploads/records/' . $filename;
$stmt->bind_param('iissss', $patientId, $auth['user_id'], $recordType, $file['name'], $relPath, $notes);
$stmt->execute();
$recId = $db->insert_id;
$stmt->close();

jsonResponse(['message' => 'File uploaded successfully', 'record_id' => $recId, 'file_name' => $file['name']], 201);
