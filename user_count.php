<?php
// Include your database connection file
include('db_connection.php');

// Initialize the total members variable
$total_members = 0;

try {
    // Query to count the number of registered users
    $query = "SELECT COUNT(*) AS total_members FROM users";
    $result = mysqli_query($conn, $query);

    // Check if the query succeeded
    if ($result) {
        $row = mysqli_fetch_assoc($result);
        $total_members = $row['total_members'];
    } else {
        // Log the error if the query fails
        error_log("Query failed: " . mysqli_error($conn));
        throw new Exception("Failed to fetch total members.");
    }
} catch (Exception $e) {
    // Handle exceptions gracefully
    error_log($e->getMessage());
    echo "An error occurred while fetching the total members.";
    exit;
} finally {
    // Always close the database connection
    mysqli_close($conn);
}

// Return the member count
echo $total_members;
?>
