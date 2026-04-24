<?php
require_once __DIR__ . '/../../config/helpers.php';
corsHeaders();
// JWT is stateless — client just discards the token.
// This endpoint exists for API completeness.
jsonResponse(['message' => 'Logged out successfully']);
