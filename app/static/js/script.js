async function askQuestion() {
    const query = document.getElementById("query").value;
    const strictness = document.getElementById("strictness").value;

    // Fetch the answer and quiz
    const response = await fetch("/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, strictness }),
    });

    const data = await response.json();

    // Display the answer
    document.getElementById("answer").innerText = data.answer || data.error;

    // Parse and render the quiz
    if (data.quiz) {
        const quizData = JSON.parse(data.quiz.replace(/'/g, '"')); // Replace single quotes with double quotes for valid JSON
        renderQuiz(quizData);
    }
}

function renderQuiz(quizData) {
    const quizContainer = document.getElementById("quiz");
    quizContainer.innerHTML = ""; // Clear existing content

    quizData.questions.forEach((q, index) => {
        const questionDiv = document.createElement("div");
        questionDiv.className = "question";

        // Add the question text
        const questionText = document.createElement("p");
        questionText.textContent = `${index + 1}. ${q.question}`;
        questionDiv.appendChild(questionText);

        // Render True/False or Multiple-Choice options as buttons
        if (q.type === "True/False") {
            ["True", "False"].forEach((option) => {
                const button = document.createElement("button");
                button.textContent = option;
                button.className = "quiz-option";
                button.onclick = () => checkAnswer(q.correct_answer, option, button);
                questionDiv.appendChild(button);
            });
        } else if (q.type === "Multiple Choice") {
            q.options.forEach((option) => {
                const button = document.createElement("button");
                button.textContent = option;
                button.className = "quiz-option";
                button.onclick = () => checkAnswer(q.correct_answer, option, button);
                questionDiv.appendChild(button);
            });
        } else if (q.type === "Fill in the Blank") {
            const inputBox = document.createElement("input");
            inputBox.type = "text";
            inputBox.placeholder = "Your answer here";
            inputBox.className = "quiz-input";
            questionDiv.appendChild(inputBox);

            const submitButton = document.createElement("button");
            submitButton.textContent = "Submit";
            submitButton.className = "quiz-submit";
            submitButton.onclick = () => {
                const userAnswer = inputBox.value.trim();
                checkAnswer(q.correct_answer, userAnswer, inputBox);
            };
            questionDiv.appendChild(submitButton);
        }

        quizContainer.appendChild(questionDiv);
    });
}


function checkAnswer(correctAnswer, userAnswer, element) {
    if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
        element.style.backgroundColor = "green"; // Mark correct answer
        alert("Correct!");
    } else {
        element.style.backgroundColor = "red"; // Mark incorrect answer
        alert(`Incorrect! The correct answer is: ${correctAnswer}`);
    }
}
