<?php
header('Content-Type: application/json');

include_once __DIR__ . '../database.php';

$responseArray = ['success' => false];

$amount = isset($_GET['amount']) ? (int) $_GET['amount'] : 2; 

$questionsQuery = "SELECT id, definicion FROM reactivos ORDER BY RAND() LIMIT $amount";
$questionsResult = $conexion->query($questionsQuery);

if ($questionsResult && $questionsResult->num_rows > 0) {
    $questions = [];

    while ($questionRow = $questionsResult->fetch_assoc()) {
        $questionId = $questionRow['id'];
        
        $optionsQuery = "SELECT id_opcion, texto_opcion, esta_correcta FROM respuestas WHERE id_reactivo = $questionId";
        $optionsResult = $conexion->query($optionsQuery);

        $options = [];
        if ($optionsResult && $optionsResult->num_rows > 0) {
            while ($optionRow = $optionsResult->fetch_assoc()) {
                $options[] = [
                    'id' => $optionRow['id_opcion'],
                    'texto_opcion' => $optionRow['texto_opcion'],
                    'correct' => $optionRow['esta_correcta']
                ];
            }
        }

        $questions[] = [
            'id' => $questionRow['id'],
            'definicion' => $questionRow['definicion'],
            'options' => $options
        ];
    }

    $responseArray = [
        'success' => true,
        'questions' => $questions
    ];
} else {
    $responseArray['message'] = 'No se encontraron preguntas.';
}

$conexion->close();

echo json_encode($responseArray, JSON_PRETTY_PRINT);
?>
