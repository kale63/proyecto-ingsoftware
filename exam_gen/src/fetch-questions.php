<?php
include_once __DIR__ . '../database.php';

$sql = "SELECT * FROM reactivos WHERE eliminado = 0"; 
$result = $conexion->query($sql);

$questions = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $questions[] = $row;
    }
    $result->free();
}

$conexion->close();

header('Content-Type: application/json');
echo json_encode($questions);
?>
