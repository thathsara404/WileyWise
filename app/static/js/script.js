
async function askQuestion() {
    const query = document.getElementById("query").value;
    const strictness = document.getElementById("strictness").value;
    const spinner = document.getElementById("loadingSpinner");

    if (query && strictness) {
        // Show the spinner
        spinner.classList.remove("d-none");
        clearSections();
    }

    // Fetch the answer and quiz
    const response = await fetch("/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, strictness }),
    });

    const data = await response.json();

    if (data) {
        // Hide the spinner after the response is processed
        spinner.classList.add("d-none");
    }

    const generatedSectoin = document.getElementById("generated");
    generatedSectoin.classList.remove("hidden");
    generatedSectoin.classList.add("fade-in");

    // Display the answer
    document.getElementById("answer").innerText = data.answer || data.error;

    // Display the link if available
    const articleLink = document.getElementById("article-link");
    if (data.link && data.link !== "No link available") {
        articleLink.href = data.link;
        articleLink.classList.remove("hidden");
    } else {
        articleLink.classList.add("hidden");
    }
    
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
        questionDiv.className = "question mb-4 p-3 border rounded bg-light";

        // Add the question text
        const questionText = document.createElement("p");
        questionText.textContent = `${index + 1}. ${q.question}`;
        questionText.className = "fw-bold";
        questionDiv.appendChild(questionText);

        // Render True/False questions explicitly
        if (q.type === "True/False") {
            ["True", "False"].forEach((option) => {
                const button = document.createElement("button");
                button.textContent = option;
                button.className = "btn btn-primary text-white me-2 mb-2"; // Ensure text color is white
                button.onclick = () => checkAnswer(q.correct_answer, option, button);
                questionDiv.appendChild(button);
            });
        } else if (q.type === "Multiple Choice") {
            // Render Multiple-Choice questions
            q.options.forEach((option) => {
                const button = document.createElement("button");
                button.textContent = option;
                button.className = "btn btn-primary text-white me-2 mb-2"; // Ensure text color is white
                button.onclick = () => checkAnswer(q.correct_answer, option, button);
                questionDiv.appendChild(button);
            });
        } else if (q.type === "Fill in the Blank") {
            // Render Fill-in-the-Blank questions
            const inputGroup = document.createElement("div");
            inputGroup.className = "input-group mb-3";

            const inputBox = document.createElement("input");
            inputBox.type = "text";
            inputBox.placeholder = "Your answer here";
            inputBox.className = "form-control";
            inputGroup.appendChild(inputBox);

            const submitButton = document.createElement("button");
            submitButton.textContent = "Submit";
            submitButton.className = "btn btn-primary text-white"; // Ensure text color is white
            submitButton.onclick = () => {
                const userAnswer = inputBox.value.trim();
                checkAnswer(q.correct_answer, userAnswer, inputBox);
            };
            inputGroup.appendChild(submitButton);

            questionDiv.appendChild(inputGroup);
        }

        quizContainer.appendChild(questionDiv);
    });
}


function checkAnswer(correctAnswer, userAnswer, element) {
    const modalTitle = document.getElementById("feedbackModalLabel");
    const modalBody = document.getElementById("feedbackModalBody");

    // Check if the answer is correct
    if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
        element.style.backgroundColor = "green"; // Mark as correct
        element.style.color = "white"; // Ensure text color is white
        modalTitle.textContent = "Correct!";
        modalBody.innerHTML = `<p>Your answer is correct! Great job.</p>`;
    } else {
        element.style.backgroundColor = "red"; // Mark as incorrect
        element.style.color = "white"; // Ensure text color is white
        modalTitle.textContent = "Incorrect!";
        modalBody.innerHTML = `<p>Oops! The correct answer is: <strong>${correctAnswer}</strong>.</p>`;
    }

    // Show the modal
    const feedbackModal = new bootstrap.Modal(document.getElementById("feedbackModal"));
    feedbackModal.show();
}


// Header Animation
document.addEventListener("DOMContentLoaded", () => {
    const title = document.querySelector(".rotating-title");
    const letters = [...title.textContent.trim()]; // Convert text to an array of characters and trim whitespace
    title.innerHTML = letters
        .map((letter) => {
            // Wrap each non-space character in <span>, keep spaces as &nbsp;
            return letter === " " ? "&nbsp;" : `<span>${letter}</span>`;
        })
        .join(""); // Join the characters back together
});

function clearSections() {
    // Clear the Answer section
    document.getElementById("answer").innerHTML = "";

    // Clear the Quiz section
    document.getElementById("quiz").innerHTML = "";

    // Hide the generated content section
    const generatedSection = document.getElementById("generated");
    generatedSection.classList.add("hidden");
}

