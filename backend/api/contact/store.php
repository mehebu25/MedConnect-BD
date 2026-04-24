<?php
require_once __DIR__ . '/../../config/helpers.php';
corsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonResponse(['message' => 'Method not allowed'], 405);

$data    = getInput();
$name    = sanitize($data['name']    ?? '');
$email   = sanitize($data['email']   ?? '');
$message = sanitize($data['message'] ?? '');

if (!$name || !$email || !$message) jsonResponse(['message' => 'All fields are required'], 422);
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) jsonResponse(['message' => 'Valid email required'], 422);

$db   = getDB();
$stmt = $db->prepare('INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)');
$stmt->bind_param('sss', $name, $email, $message);
$stmt->execute();
$stmt->close();

jsonResponse(['message' => 'Message received. We will reply within 24 hours.'], 201);
