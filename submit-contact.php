<?php
header('Content-Type: application/json');
$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

$name = trim($input['name'] ?? '');
$email = trim($input['email'] ?? '');
$phone = trim($input['phone'] ?? '');
$subject = trim($input['subject'] ?? '');
$message = trim($input['message'] ?? '');

if (!$name || !$email || !$subject || !$message) {
  http_response_code(400);
  echo json_encode(['message'=>'Missing required fields.']);
  exit;
}
if ($phone && !preg_match('/^[0-9+()\\- \\s]{6,20}$/', $phone)) {
  http_response_code(400);
  echo json_encode(['message'=>'Invalid phone.']);
  exit;
}

// Save to file
$line = [
  'id'=>time(),
  'name'=>$name,
  'email'=>$email,
  'phone'=>$phone,
  'subject'=>$subject,
  'message'=>$message,
  'createdAt'=>date('c')
];
file_put_contents('contact-messages.json', json_encode($line).PHP_EOL, FILE_APPEND);

// Optional: send email using mail() or an SMTP library (recommended)
$to = 'info@outreachschool.org';
$body = "From: $name\nEmail: $email\nPhone: $phone\n\n$message";
@mail($to, "[Contact] $subject", $body, "From: no-reply@outreachschool.org");

echo json_encode(['message'=>'Message received. Thank you.']);
