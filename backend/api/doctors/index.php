<?php
require_once __DIR__ . '/../../config/helpers.php';
corsHeaders();

$db = getDB();

$sql = 'SELECT u.id, u.name, u.phone,
               dp.id AS doctor_profile_id, dp.bmdc_number, dp.specialization,
               dp.experience_years, dp.consultation_fee, dp.bio,
               dp.district, dp.is_verified, dp.is_available, dp.rating, dp.total_reviews
        FROM doctor_profiles dp
        JOIN users u ON u.id = dp.user_id
        WHERE u.is_active = 1';

$params = [];
$types  = '';

// Filter: specialization
if (!empty($_GET['spec'])) {
    $spec  = sanitize($_GET['spec']);
    $sql  .= ' AND dp.specialization = ?';
    $types .= 's';
    $params[] = $spec;
}

// Filter: available only
if (!empty($_GET['available']) && $_GET['available'] === '1') {
    $sql .= ' AND dp.is_available = 1 AND dp.is_verified = 1';
}

// Filter: verified only (default)
if (empty($_GET['all'])) {
    $sql .= ' AND dp.is_verified = 1';
}

// Filter: search name
if (!empty($_GET['search'])) {
    $s     = '%' . sanitize($_GET['search']) . '%';
    $sql  .= ' AND (u.name LIKE ? OR dp.specialization LIKE ? OR dp.district LIKE ?)';
    $types .= 'sss';
    $params[] = $s; $params[] = $s; $params[] = $s;
}

// Sort
$sort = sanitize($_GET['sort'] ?? 'rating');
$sql .= match($sort) {
    'fee'     => ' ORDER BY dp.consultation_fee ASC',
    'exp'     => ' ORDER BY dp.experience_years DESC',
    'reviews' => ' ORDER BY dp.total_reviews DESC',
    default   => ' ORDER BY dp.rating DESC, dp.total_reviews DESC',
};

$stmt = $db->prepare($sql);
if ($params) {
    $stmt->bind_param($types, ...$params);
}
$stmt->execute();
$rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();

// Build initials + colour
$colours = ['#0b7c6f','#2563eb','#c9913a','#9333ea','#dc2626','#16a34a','#db2777','#0891b2'];
foreach ($rows as &$r) {
    $r['is_verified']  = (bool)$r['is_verified'];
    $r['is_available'] = (bool)$r['is_available'];
    $parts = explode(' ', $r['name']);
    $r['initials'] = strtoupper(substr($parts[0],0,1) . (isset($parts[1]) ? substr($parts[1],0,1) : ''));
    $r['color']    = $colours[$r['doctor_profile_id'] % count($colours)];
    $r['avail']    = $r['is_available'];
    $r['exp']      = $r['experience_years'] . ' yrs';
    $r['rev']      = $r['total_reviews'];
    $r['fee']      = (float)$r['consultation_fee'];
    $r['spec']     = $r['specialization'];
    $r['init']     = $r['initials'];
    $r['c']        = $r['color'];
}

jsonResponse(['doctors' => $rows]);
