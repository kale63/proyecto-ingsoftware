<?php
    $conexion = @mysqli_connect(
        'localhost',
        'root',
        'californication',
        'examen_practica'
    );

    if(!$conexion) {
        die('Base de datos NO conectada!');
    }
?>