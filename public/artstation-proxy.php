<?php
/**
 * ArtStation Proxy for GoDaddy/PHP Servers
 * This script bypasses CORS restrictions and provides a reliable connection to ArtStation.
 */

// Allow from any origin (CORS)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, x-requested-with");
header("Content-Type: application/json");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// Get and validate URL
$targetUrl = isset($_GET['url']) ? $_GET['url'] : '';

if (empty($targetUrl)) {
    http_response_code(400);
    echo json_encode(["error" => "No URL provided"]);
    exit;
}

// Security: Only allow ArtStation and Sketchfab URLs
if (strpos($targetUrl, 'https://www.artstation.com/') !== 0 && 
    strpos($targetUrl, 'https://api.sketchfab.com/') !== 0) {
    http_response_code(403);
    echo json_encode(["error" => "URL not allowed"]);
    exit;
}

// Initialize CURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $targetUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // For compatibility with some older PHP environments

// Mimic a real browser
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);

curl_close($ch);

if ($response === false) {
    http_response_code(500);
    echo json_encode(["error" => "Proxy error: " . $error]);
} else {
    http_response_code($httpCode);
    echo $response;
}
