<?php
// backend/config/helpers.php

require_once __DIR__ . '/database.php';

function corsHeaders() {
    header('Access-Control-Allow-Origin: http://localhost:3000');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Content-Type: application/json');
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
}

function jsonResponse($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit;
}

function getInput() {
    return json_decode(file_get_contents('php://input'), true) ?? [];
}

// ── Minimal JWT ──────────────────────────────────────────────
function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}
function base64url_decode($data) {
    return base64_decode(strtr($data, '-_', '+/'));
}

function generateToken($payload) {
    $header  = base64url_encode(json_encode(['alg'=>'HS256','typ'=>'JWT']));
    $payload['iat'] = time();
    $payload['exp'] = time() + JWT_EXPIRE;
    $body    = base64url_encode(json_encode($payload));
    $sig     = base64url_encode(hash_hmac('sha256', "$header.$body", JWT_SECRET, true));
    return "$header.$body.$sig";
}

function verifyToken($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    [$header, $body, $sig] = $parts;
    $expected = base64url_encode(hash_hmac('sha256', "$header.$body", JWT_SECRET, true));
    if (!hash_equals($expected, $sig)) return null;
    $payload = json_decode(base64url_decode($body), true);
    if (!$payload || $payload['exp'] < time()) return null;
    return $payload;
}

function requireAuth() {
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!preg_match('/Bearer\s+(.+)/i', $auth, $m)) {
        jsonResponse(['message' => 'Unauthorized'], 401);
    }
    $payload = verifyToken($m[1]);
    if (!$payload) jsonResponse(['message' => 'Token invalid or expired'], 401);
    return $payload;
}

function requireRole($roles) {
    $payload = requireAuth();
    if (!in_array($payload['role'], (array)$roles)) {
        jsonResponse(['message' => 'Forbidden'], 403);
    }
    return $payload;
}

function hashPassword($p)  { return password_hash($p, PASSWORD_BCRYPT); }
function checkPassword($p, $h) { return password_verify($p, $h); }

function sanitize($v) { return htmlspecialchars(strip_tags(trim($v ?? ''))); }
