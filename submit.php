<?php
// submit.php
// Place this in a public folder and set the form action to "submit.php"

$uploadDir = __DIR__ . '/uploads/';
if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

function saveFile($fileKey, $uploadDir) {
  if (!isset($_FILES[$fileKey]) || $_FILES[$fileKey]['error'] !== UPLOAD_ERR_OK) return null;
  $tmp = $_FILES[$fileKey]['tmp_name'];
  $name = time() . '-' . basename($_FILES[$fileKey]['name']);
  $target = $uploadDir . $name;
  if (move_uploaded_file($tmp, $target)) return $name;
  return null;
}

$cvFile = saveFile('cv', $uploadDir);
$photoFile = saveFile('photo', $uploadDir);

// basic required checks
$firstName = $_POST['firstName'] ?? '';
$lastName = $_POST['lastName'] ?? '';
$email = $_POST['email'] ?? '';
if (!$firstName || !$lastName || !$email) {
  http_response_code(400);
  echo json_encode(['message' => 'Missing required fields.']);
  exit;
}

// append to CSV (or replace with DB)
$csvFile = __DIR__ . '/applications.csv';
$line = [
  time(),
  $_POST['applicantType'] ?? '',
  $firstName,
  $lastName,
  $email,
  $_POST['phone'] ?? '',
  $_POST['address'] ?? '',
  $_POST['dob'] ?? '',
  $_POST['gender'] ?? '',
  $cvFile,
  $photoFile
];
$fp = fopen($csvFile, 'a');
fputcsv($fp, $line);
fclose($fp);

header('Content-Type: application/json');
echo json_encode(['message' => 'Application submitted.']);
