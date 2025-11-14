<?php
// admin-upload.php
// Basic protection: set expected token in config or env
$token = 'MY_ADMIN_TOKEN'; // replace or get from ENV
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || ($_POST['token'] ?? '') !== $token) {
  http_response_code(403); echo 'Forbidden'; exit;
}
$uploadDir = __DIR__ . '/assets/images/gallery/';
if (!is_dir($uploadDir)) mkdir($uploadDir,0755,true);

if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
  http_response_code(400); echo json_encode(['message'=>'No file']); exit;
}
$fn = time() . '-' . basename($_FILES['image']['name']);
$target = $uploadDir . $fn;
if (!move_uploaded_file($_FILES['image']['tmp_name'], $target)) {
  http_response_code(500); echo json_encode(['message'=>'Upload failed']); exit;
}

$dataFile = __DIR__ . '/data/gallery.json';
$json = file_exists($dataFile) ? json_decode(file_get_contents($dataFile), true) : ['items' => []];
$entry = [
  'id' => 'g' . time(),
  'title' => $_POST['title'] ?? '',
  'caption' => $_POST['caption'] ?? '',
  'image' => '/assets/images/gallery/' . $fn,
  'thumb' => '/assets/images/gallery/' . $fn,
  'alt' => $_POST['title'] ?? '',
  'category' => $_POST['category'] ?? 'uncategorized',
  'tags' => $_POST['tags'] ?? ''
];
array_unshift($json['items'], $entry);
file_put_contents($dataFile, json_encode($json, JSON_PRETTY_PRINT));
header('Content-Type: application/json');
echo json_encode(['message'=>'Uploaded','entry'=>$entry]);
