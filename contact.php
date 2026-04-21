<?php
/**
 * Kalicert Belgelendirme - İletişim Formu İşleyici
 * info@kalicert.net adresine e-posta gönderir
 */

error_reporting(0);
ini_set('display_errors', 0);
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Geçersiz istek yöntemi.']);
    exit;
}

session_start();

$name = isset($_POST['name']) ? trim(strip_tags($_POST['name'])) : '';
$email = isset($_POST['email']) ? trim(filter_var($_POST['email'], FILTER_SANITIZE_EMAIL)) : '';
$phone = isset($_POST['phone']) ? trim(strip_tags($_POST['phone'])) : '';
$message = isset($_POST['message']) ? trim(strip_tags($_POST['message'])) : '';

$errors = [];
if (empty($name)) $errors['name'] = 'Adınız zorunludur.';
elseif (strlen($name) < 2) $errors['name'] = 'Adınız en az 2 karakter olmalıdır.';
if (empty($email)) $errors['email'] = 'E-posta zorunludur.';
elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors['email'] = 'Geçerli bir e-posta adresi giriniz.';
if (empty($phone)) $errors['phone'] = 'Telefon zorunludur.';
if (empty($message)) $errors['message'] = 'Mesaj zorunludur.';
elseif (strlen($message) < 10) $errors['message'] = 'Mesajınız en az 10 karakter olmalıdır.';

if (!empty($_POST['website'])) { echo json_encode(['success' => true, 'message' => 'Mesajınız alınmıştır.']); exit; }

if (!empty($errors)) {
    echo json_encode(['success' => false, 'message' => 'Lütfen alanları doğru doldurun.', 'errors' => $errors]);
    exit;
}

$to = 'info@kalicert.net';
$subject = 'Kalicert İletişim Formu: ' . $name;

$email_content_html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;}</style></head><body>';
$email_content_html .= '<h2>Kalicert Belgelendirme - Yeni İletişim</h2>';
$email_content_html .= '<p><strong>Ad:</strong> ' . htmlspecialchars($name) . '</p>';
$email_content_html .= '<p><strong>E-posta:</strong> ' . htmlspecialchars($email) . '</p>';
$email_content_html .= '<p><strong>Telefon:</strong> ' . htmlspecialchars($phone) . '</p>';
$email_content_html .= '<p><strong>Mesaj:</strong><br>' . nl2br(htmlspecialchars($message)) . '</p>';
$email_content_html .= '<p>Tarih: ' . date('d.m.Y H:i:s') . '</p>';
$email_content_html .= '</body></html>';

$boundary = md5(uniqid(time()));
$headers = "From: Kalicert <info@kalicert.net>\r\n";
$headers .= "Reply-To: " . $name . " <" . $email . ">\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: multipart/alternative; boundary=\"$boundary\"\r\n";

$body = "--$boundary\r\n";
$body .= "Content-Type: text/html; charset=UTF-8\r\n\r\n";
$body .= $email_content_html . "\r\n\r\n";
$body .= "--$boundary--";

$mail_sent = mail($to, $subject, $body, $headers, "-f info@kalicert.net");

if ($mail_sent) {
    echo json_encode(['success' => true, 'message' => 'Mesajınız gönderildi.']);
} else {
    echo json_encode(['success' => false, 'message' => 'E-posta gönderilemedi. Lütfen telefonla ulaşın.']);
}
$_SESSION['csrf_token'] = bin2hex(random_bytes(32));
?>