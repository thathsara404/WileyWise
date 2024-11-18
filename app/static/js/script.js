async function askQuestion() {
    const query = document.getElementById("query").value;
    const response = await fetch("/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
    });
    const data = await response.json();
    document.getElementById("answer").innerText = data.answer || data.error;
    document.getElementById("quiz").innerText = data.quiz || "";
}
