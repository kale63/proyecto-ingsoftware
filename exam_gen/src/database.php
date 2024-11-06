<?php
    $conexion = @mysqli_connect(
        'localhost',
        'root',
        'contraseña',
        'base usada'
    );

    if(!$conexion) {
        die('Base de datos NO conectada!');
    }
?>