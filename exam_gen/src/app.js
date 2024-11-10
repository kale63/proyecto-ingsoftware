let baseJSON = {
    "area": "",
    "definicion": "",
    "base": "",
    "opciones": [
        { "texto": "", "valor": "incorrecta", "argumentacion": "" },
        { "texto": "", "valor": "incorrecta", "argumentacion": "" },
        { "texto": "", "valor": "incorrecta", "argumentacion": "" },
        { "texto": "", "valor": "incorrecta", "argumentacion": "" }
    ],
    "imagen": ""
};

let correctAnswers = 0;

function deleteQuestion(id) {
    if (confirm("¿Estás seguro de que deseas eliminar este reactivo?")) {
        $.post(`../src/question-delete.php`, { id: id }, function(response) {
            try {
                response = typeof response === "string" ? JSON.parse(response) : response;
                console.log("Parsed response:", response);

                if (response.status === 'success') {
                    fetchQuestions(); 
                    alert('Reactivo eliminado con éxito.');
                } else {
                    alert('Error al eliminar el reactivo: ' + response.message);
                }
            } catch (error) {
                console.error("JSON parsing error:", error);
                alert('Error al eliminar el reactivo.');
            }
        }).fail(function(xhr, status, error) {
            console.error('AJAX error:', status, error);
            alert('Error al enviar la solicitud.');
        });
    }
}

function editQuestion(id) {
    window.location.href = `edit-questions.php?id=${id}`;
}

function fetchQuestions() {
    $.ajax({
        url: '../src/fetch-questions.php',
        method: 'GET',
        dataType: 'json',
        success: function(data) {
            const tableBody = $('#questionsTable tbody');
            tableBody.empty();

            data.forEach(question => {
                const row = `
                    <tr>
                        <td class="d-none">${question.id}</td>
                        <td>${question.area}</td>
                        <td>${question.definicion}</td>
                        <td>${question.base}</td>
                        <td class="text-center button-td">
                            <button class="btn btn-warning me-2" onclick="editQuestion(${question.id})">Editar</button>
                            <button class="btn btn-danger"  onclick="deleteQuestion(${question.id})">Borrar</button>
                        </td>
                    </tr>
                `;
                tableBody.append(row);
            });
        },
        error: function(xhr, status, error) {
            console.error('Error fetching questions:', error); 
        }
    });
}

const questionForm = document.querySelector("#question-form");
if (questionForm) {
    questionForm.addEventListener("submit", function(event) {
        if (!validateForm()) {
            event.preventDefault(); 
            alert("Por favor, completa todos los campos y asegúrate de que solo una opción esté marcada como 'Correcta'.");
        }
    });
}


function validateForm() {
    let isValid = true;

    const inputs = document.querySelectorAll("#question-form input[type='text'], #question-form textarea");
    inputs.forEach(input => {
        if (input.value.trim() === "") {
            isValid = false;
            input.classList.add("is-invalid");
        } else {
            input.classList.remove("is-invalid");
        }
    });

    const selects = document.querySelectorAll("#question-form select");
    let correctCount = 0;
    selects.forEach(select => {
        if (select.value === "correcta") {
            correctCount++;
        }
    });

    if (correctCount !== 1) {
        isValid = false;
    }

    return isValid;
}

$(document).ready(function() {
    let questionsArray = []; 

    console.log('Script isrve');
    init();

    function init() {
        var baseJSON = {
            "area": "",
            "definicion": "",
            "base": "",
            "opciones": [
                { "texto": "", "valor": "incorrecta", "argumentacion": "" },
                { "texto": "", "valor": "incorrecta", "argumentacion": "" },
                { "texto": "", "valor": "incorrecta", "argumentacion": "" },
                { "texto": "", "valor": "incorrecta", "argumentacion": "" }
            ],
            "imagen": ""
        };

        var JsonString = JSON.stringify(baseJSON, null, 2);
        $('#description').val(JsonString);
    }

    const imageUploadInput = document.getElementById('imageUpload');
    if (imageUploadInput) {
        imageUploadInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    baseJSON.imagen = e.target.result;
                    console.log("Imagen subida y encoded.");
                }
                reader.readAsDataURL(file);
            }
        });
    }

    $('#question-form').submit(function(e) {
        e.preventDefault();

        let finalJSON = {
            "area": $('#area').val().trim(),
            "definicion": $('#definicion').val().trim(),
            "base": $('#base').val().trim(),
            "opciones": []
        };

        for (let i = 1; i <= 4; i++) {
            finalJSON.opciones.push({
                "texto": $(`input[name="opcion_${i}"]`).val().trim(),
                "valor": $(`select[name="op${i}_value"]`).val(),
                "argumentacion": $(`textarea[name="arg_${i}"]`).val().trim()
            });
        }

        finalJSON.imagen = baseJSON.imagen || "";

        if (!finalJSON.area || !finalJSON.definicion || !finalJSON.base) {
            alert('Todos los campos principales son obligatorios.');
            return;
        }

        console.log(finalJSON);

        let url = '../src/question-add.php';
        $.post(url, JSON.stringify(finalJSON), function(response) {
            let resp = JSON.parse(response);
            let template = `
                <li style="list-style: none;">status: ${resp.status}</li>
                <li style="list-style: none;">message: ${resp.message}</li>
            `;
            $('#question-result').show();
            $('#container').html(template);
            $('#question-form').trigger('reset');
            init();
        }).fail(function(jqXHR, textStatus, errorThrown) {
            alert('Error al enviar la solicitud: ' + errorThrown);
        });
    });

    $('#edit-question').submit(function(e) {
        e.preventDefault();
    
        let finalJSON = {
            "area": $('#area').val().trim(),
            "definicion": $('#definicion').val().trim(),
            "base": $('#base').val().trim(),
            "opciones": []
        };
    
        finalJSON.opciones = [];
    
        $('.row .col-md-6').each(function() {
            let id = $(this).find('input[type="text"]').attr('name').match(/\d+/)[0];
    
            finalJSON.opciones.push({
                "texto": $(`input[name="opcion_${id}"]`).val().trim(),
                "valor": $(`select[name="op${id}_value"]`).val(),
                "argumentacion": $(`textarea[name="arg_${id}"]`).val().trim()
            });
        });
    
        finalJSON.imagen = baseJSON.imagen || "";
    
        if (!finalJSON.area || !finalJSON.definicion || !finalJSON.base) {
            alert('Todos los campos principales son obligatorios.');
            return;
        }
    
        console.log(finalJSON);
    
        const urlParams = new URLSearchParams(window.location.search);
        const questionId = urlParams.get('id');
    
        let url = `../src/question-edit.php?id=${questionId}`;
    
        $.post(url, JSON.stringify(finalJSON), function(response) {
            let resp = JSON.parse(response);
            let template = `
                <li style="list-style: none;">status: ${resp.status}</li>
                <li style="list-style: none;">message: ${resp.message}</li>
            `;
            $('#question-result').show();
            $('#container').html(template);
            init();
        }).fail(function(jqXHR, textStatus, errorThrown) {
            alert('Error al enviar la solicitud: ' + errorThrown);
        });
    });
    
    $(document).ready(function() {
        fetchQuestions();
    });

    $(document).ready(function() {
        const examContainer = $('.container'); 
        let questions = []; 
        let currentQuestionIndex = 0; 
        const questionAmount = new URLSearchParams(window.location.search).get('question-amount');
    
        $.get('../src/generate-exam.php', { 'amount': questionAmount })
            .done(function(data) {
                questions = data.questions;
                displayQuestion(currentQuestionIndex);
            })
            .fail(function(error) {
                console.error('Error fetching questions:', error);
            });
    
        function displayQuestion(index) {
            if (index < 0 || index >= questions.length) return;
    
            const question = questions[index];
            const questionText = $('#question-text');
            const optionsContainer = $('#respuestas');
    
            questionText.text(question.base);
    
            optionsContainer.empty();
    
            question.options.forEach(option => {
                const optionHtml = `
                    <label>
                        <input type="radio" name="question_${question.id}" value="${option.id}" required>
                        ${option.texto_opcion}
                    </label><br>
                `;
                optionsContainer.append(optionHtml);
            });
        }
    
        $('#next-question').click(function() {
            if (currentQuestionIndex < questions.length - 1) {
                currentQuestionIndex++;
                displayQuestion(currentQuestionIndex);
            }
        });
    
        $('#previous-question').click(function() {
            if (currentQuestionIndex > 0) {
                currentQuestionIndex--;
                displayQuestion(currentQuestionIndex);
            }
        });

        //TOTAL WIP, DOESNT DO SHIT YET
        $('#submit-exam').click(function() {
            questions.forEach((question) => {
                const selectedOption = $(`input[name="question_${question.id}"]:checked`);
                if (selectedOption.length > 0) {
                    const selectedValue = selectedOption.val();
                    const correctOption = question.options.find(option => option.correct === 1);
                    if (selectedValue == correctOption.id) {
                        correctAnswers++;
                    }
                }
            });
    
            alert('Tu calificación: ' + correctAnswers + ' de ' + questions.length);
        });
    });
    
             
});
