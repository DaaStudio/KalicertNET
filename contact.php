<?php
/**
 * AGS Belgelendirme - İletişim Formu İşleyici
 * info@kalicertisg.com adresine e-posta gönderir
 */

// Hata raporlamayı kapat (production'da)
error_reporting(0);
ini_set('display_errors', 0);

// JSON yanıt için header
header('Content-Type: application/json; charset=utf-8');

// CORS ayarları (güvenlik için sadece kendi domain'inize izin verin)
$allowed_origins = [
    'http://kalicert.net',
    'https://kalicert.net',
    'http://www.kalicert.net',
    'https://www.kalicert.net'
];

if (isset($_SERVER['HTTP_ORIGIN'])) {
    if (in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins)) {
        header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
    }
}

// Sadece POST isteklerini kabul et
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Geçersiz istek yöntemi.'
    ]);
    exit;
}

// CSRF kontrolü için basit token (opsiyonel)
session_start();
if (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
    // Geliştirme aşamasında yorum satırı yapabilirsiniz
    // echo json_encode(['success' => false, 'message' => 'Güvenlik tokeni geçersiz.']);
    // exit;
}

// Form verilerini al ve temizle
$name = isset($_POST['name']) ? trim(strip_tags($_POST['name'])) : '';
$email = isset($_POST['email']) ? trim(filter_var($_POST['email'], FILTER_SANITIZE_EMAIL)) : '';
$phone = isset($_POST['phone']) ? trim(strip_tags($_POST['phone'])) : '';
$message = isset($_POST['message']) ? trim(strip_tags($_POST['message'])) : '';

// Validasyon
$errors = [];

if (empty($name)) {
    $errors['name'] = 'Adınız alanı zorunludur.';
} elseif (strlen($name) < 2) {
    $errors['name'] = 'Adınız en az 2 karakter olmalıdır.';
} elseif (strlen($name) > 100) {
    $errors['name'] = 'Adınız en fazla 100 karakter olabilir.';
}

if (empty($email)) {
    $errors['email'] = 'E-posta alanı zorunludur.';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Geçerli bir e-posta adresi giriniz.';
}

if (empty($phone)) {
    $errors['phone'] = 'Telefon alanı zorunludur.';
} elseif (!preg_match('/^[0-9\s\+\-\(\)]{10,20}$/', $phone)) {
    $errors['phone'] = 'Geçerli bir telefon numarası giriniz.';
}

if (empty($message)) {
    $errors['message'] = 'Mesaj alanı zorunludur.';
} elseif (strlen($message) < 10) {
    $errors['message'] = 'Mesajınız en az 10 karakter olmalıdır.';
} elseif (strlen($message) > 5000) {
    $errors['message'] = 'Mesajınız en fazla 5000 karakter olabilir.';
}

// Spam koruması - Honeypot
if (!empty($_POST['website'])) {
    // Bot doldurduysa sessizce başarılı yanıtı ver
    echo json_encode([
        'success' => true,
        'message' => 'Mesajınız alınmıştır.'
    ]);
    exit;
}

// Hata varsa JSON olarak döndür
if (!empty($errors)) {
    echo json_encode([
        'success' => false,
        'message' => 'Lütfen tüm alanları doğru doldurun.',
        'errors' => $errors
    ]);
    exit;
}

// E-posta ayarları
$to = 'info@kalicertisg.com';
$subject = 'AGS Belgelendirme - İletişim Formu: ' . $name;

// E-posta içeriği (HTML formatında)
$email_content_html = '
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0056b3; color: #fff; padding: 20px; text-align: center; }
        .content { background: #f8f9fa; padding: 30px; }
        .field { margin-bottom: 20px; }
        .label { font-weight: bold; color: #0056b3; }
        .value { margin-top: 5px; padding: 10px; background: #fff; border-left: 4px solid #0056b3; }
        .footer { text-align: center; padding: 20px; color: #6c757d; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>AGS Belgelendirme - Yeni İletişim Formu</h2>
        </div>
        <div class="content">
            <div class="field">
                <div class="label">Gönderen Adı:</div>
                <div class="value">' . htmlspecialchars($name, ENT_QUOTES, 'UTF-8') . '</div>
            </div>
            <div class="field">
                <div class="label">E-posta Adresi:</div>
                <div class="value">' . htmlspecialchars($email, ENT_QUOTES, 'UTF-8') . '</div>
            </div>
            <div class="field">
                <div class="label">Telefon Numarası:</div>
                <div class="value">' . htmlspecialchars($phone, ENT_QUOTES, 'UTF-8') . '</div>
            </div>
            <div class="field">
                <div class="label">Mesaj:</div>
                <div class="value">' . nl2br(htmlspecialchars($message, ENT_QUOTES, 'UTF-8')) . '</div>
            </div>
        </div>
        <div class="footer">
            <p>Bu e-posta AGS Belgelendirme web sitesi iletişim formu aracılığıyla gönderilmiştir.</p>
            <p>Gönderim Tarihi: ' . date('d.m.Y H:i:s') . '</p>
            <p>IP Adresi: ' . $_SERVER['REMOTE_ADDR'] . '</p>
        </div>
    </div>
</body>
</html>';

// Düz metin alternatifi (HTML gösteremeyen istemciler için)
$email_content_text = "AGS Belgelendirme - Yeni İletişim Formu\n";
$email_content_text .= "=====================================\n\n";
$email_content_text .= "Gönderen Adı: " . $name . "\n";
$email_content_text .= "E-posta: " . $email . "\n";
$email_content_text .= "Telefon: " . $phone . "\n\n";
$email_content_text .= "Mesaj:\n" . $message . "\n\n";
$email_content_text .= "-------------------------------------\n";
$email_content_text .= "Gönderim Tarihi: " . date('d.m.Y H:i:s') . "\n";
$email_content_text .= "IP Adresi: " . $_SERVER['REMOTE_ADDR'] . "\n";

// E-posta başlıkları
$boundary = md5(uniqid(time()));

$headers = "From: AGS Belgelendirme <info@kalicertisg.com>\r\n";
$headers .= "Reply-To: " . $name . " <" . $email . ">\r\n";
$headers .= "Return-Path: info@kalicertisg.com\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: multipart/alternative; boundary=\"$boundary\"\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
$headers .= "X-Priority: 3\r\n";

// Çok parçalı e-posta gövdesi
$body = "--$boundary\r\n";
$body .= "Content-Type: text/plain; charset=UTF-8\r\n";
$body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
$body .= $email_content_text . "\r\n\r\n";
$body .= "--$boundary\r\n";
$body .= "Content-Type: text/html; charset=UTF-8\r\n";
$body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
$body .= $email_content_html . "\r\n\r\n";
$body .= "--$boundary--";

// E-postayı gönder
$mail_sent = mail($to, $subject, $body, $headers, "-f info@kalicertisg.com");

if ($mail_sent) {
    // Başarılı yanıt
    echo json_encode([
        'success' => true,
        'message' => 'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.'
    ]);
    
    // Opsiyonel: Log kaydı tut
    $log_entry = date('Y-m-d H:i:s') . " | BAŞARILI | {$name} | {$email} | {$phone}\n";
    @file_put_contents('contact_log.txt', $log_entry, FILE_APPEND);
    
} else {
    // Hata durumu
    echo json_encode([
        'success' => false,
        'message' => 'E-posta gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin veya telefon ile ulaşın.'
    ]);
    
    // Hata logu
    $log_entry = date('Y-m-d H:i:s') . " | HATA | {$name} | {$email} | {$phone} | Mail gönderilemedi\n";
    @file_put_contents('contact_log.txt', $log_entry, FILE_APPEND);
}

// CSRF token yenile
$_SESSION['csrf_token'] = bin2hex(random_bytes(32));
?>