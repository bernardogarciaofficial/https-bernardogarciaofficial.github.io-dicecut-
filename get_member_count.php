<?php
// Include your database connection file
include('db_connection.php');

// Prepare the SQL query to count the number of registered users
$query = "SELECT COUNT(*) AS total_members FROM users";

// Execute the query and check for errors
if ($result = $conn->query($query)) {
    // Fetch the result as an associative array
    $row = $result->fetch_assoc();
    // Retrieve the total number of members
    $total_members = $row['total_members'];
    // Free the result set
    $result->free();
} else {
    // Log the error message
    error_log("Database query failed: " . $conn->error, 3, '/var/log/myapp_errors.log');
    // Display a generic error message to the user
    die("An error occurred while fetching the member count. Please try again later.");
}

// Close the database connection
$conn->close();

// Return the member count
echo $total_members;
?>
