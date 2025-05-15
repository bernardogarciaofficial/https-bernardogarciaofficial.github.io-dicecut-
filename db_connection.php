<?php
// Enable MySQLi error reporting (PHP 8.1+)
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

// Database credentials
$servername = "localhost";
$username = "your_username";
$password = "your_password";
$dbname = "your_database_name";

// Establishing the connection
try {
    $conn = new mysqli($servername, $username, $password, $dbname);
    // Optionally, set the character set to UTF-8
    $conn->set_charset("utf8mb4");
} catch (mysqli_sql_exception $e) {
    // Log the error message
    error_log("Connection failed: " . $e->getMessage(), 3, "/var/log/myapp_errors.log");
    // Display a generic error message to the user
    die("Database connection failed. Please try again later.");
}
?>
