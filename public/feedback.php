<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$file = __DIR__ . '/feedbacks.json';

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// GET: Return all feedbacks
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($file)) {
        echo file_get_contents($file);
    } else {
        echo json_encode([]);
    }
    exit;
}

// POST: Add new feedback
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents("php://input");
    $newFeedback = json_decode($input, true);

    if (!$newFeedback || !isset($newFeedback['message'])) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid data"]);
        exit;
    }

    // Add timestamp if missing
    if (!isset($newFeedback['date'])) {
        $newFeedback['date'] = date('Y-m-d H:i:s');
    }
    
    // Generate simple ID if missing
    if (!isset($newFeedback['id'])) {
        $newFeedback['id'] = uniqid('fb_');
    }

    // Load existing
    $feedbacks = [];
    if (file_exists($file)) {
        $content = file_get_contents($file);
        if ($content) {
            $feedbacks = json_decode($content, true);
            if (!is_array($feedbacks)) $feedbacks = [];
        }
    }

    // Append
    $feedbacks[] = $newFeedback;

    // Save
    if (file_put_contents($file, json_encode($feedbacks, JSON_PRETTY_PRINT))) {
        echo json_encode(["success" => true, "data" => $newFeedback]);
    } else {
        $error = error_get_last();
        http_response_code(500);
        echo json_encode([
            "error" => "Could not save to file. Check permissions.",
            "php_error" => $error['message'] ?? 'Unknown'
        ]);
    }
    exit;
}
?>
