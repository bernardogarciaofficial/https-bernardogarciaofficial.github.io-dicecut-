<?php
// Include your database connection file
include('db_connection.php');

// Query to count the number of registered users
$query = "SELECT COUNT(*) AS total_members FROM users";
$result = mysqli_query($conn, $query);
$row = mysqli_fetch_assoc($result);

// Fetch the total number of members
$total_members = $row['total_members'];

// Close the database connection
mysqli_close($conn);

// Return the member count
echo $total_members;
?>
