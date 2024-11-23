const startButton = document.getElementById("start-agent");
const status = document.getElementById("status");

let agentStep = 0; // Tracks the conversation flow
let currentQuestion = ""; // Stores the question
let isRecording = false;
let isProcessing = false; // Prevents multiple simultaneous voice agents
let isSpeaking = false; // Tracks if speech synthesis is active

async function processVoiceAgent() {
    if (isProcessing) {
        console.warn("Agent is already processing. Please wait.");
        return;
    }

    isProcessing = true; // Set the flag to true
    startButton.disabled = true; // Disable the microphone button

    try {
        if (agentStep === 0) {
            // Step 1: Ask the question
            stopSpeaking(); // Stop any ongoing speech
            updateMicButton("speaking"); // Change the button color
            speakText("Please tell me your question.");
            document.getElementById("query").value = "";
            status.textContent = "Listening for your question...";
            const questionAudio = await recordAudio();
            const transcription = await transcribeAudio(questionAudio, "en");
            currentQuestion = transcription.text.trim();

            // Validate the transcription
            if (!currentQuestion || currentQuestion.toLowerCase() === "thank you very much") {
                stopSpeaking(); // Stop speech
                speakText("I couldn't understand your question. Please try again.");
                status.textContent = "Could not understand your question. Please try again.";
                isProcessing = false;
                startButton.disabled = false; // Re-enable the microphone button
                updateMicButton("default"); // Reset button color
                return;
            }

            // Render the question in the text box
            document.getElementById("query").value = currentQuestion;
            stopSpeaking(); // Stop any ongoing speech
            updateMicButton("speaking"); // Change button color
            speakText("Do you prefer strict or flexible strictness?");
            status.textContent = "Do you prefer strict or flexible strictness?";
            agentStep++; // Move to strictness selection
            setTimeout(processVoiceAgent, 1000); // Proceed to next step
        } else if (agentStep === 1) {
            // Step 2: Ask for strictness
            status.textContent = "Listening for strictness preference...";
            const strictnessAudio = await recordAudio();
            const transcription = await transcribeAudio(strictnessAudio, "en");
            const strictness = transcription.text.toLowerCase().includes("strict") ? "strict" : "flexible";

            // Validate strictness
            if (!strictness) {
                stopSpeaking(); // Stop speech
                speakText("I couldn't determine your preference. Defaulting to flexible strictness.");
                status.textContent = "Could not determine strictness. Defaulting to 'flexible'.";
            } else {
                stopSpeaking(); // Stop speech
                speakText(`You chose ${strictness} strictness. Fetching your answer now.`);
                status.textContent = `You chose: ${strictness}. Fetching the answer...`;
            }

            // Set the strictness dropdown value
            const strictnessDropdown = document.getElementById("strictness");
            strictnessDropdown.value = strictness;

            // Trigger the askQuestion function to fetch answer and quiz
            await askQuestion();

            // Speak the answer after it's fetched
            const answer = document.getElementById("answer").innerText;
            if (answer) {
                stopSpeaking(); // Stop any ongoing speech
                updateMicButton("speaking"); // Change button color
                speakText("Here is the answer to your question.");
                speakText(answer);
                status.textContent = ""; // Clear conversation
            }

            agentStep = 0; // Reset agent for next use
        }
    } catch (error) {
        console.error("Error processing voice agent:", error);
        stopSpeaking(); // Stop any ongoing speech
        speakText("An error occurred. Please try again.");
        status.textContent = "An error occurred. Please try again.";
        agentStep = 0; // Reset agent
    } finally {
        isProcessing = false; // Reset the flag
        startButton.disabled = false; // Re-enable the microphone button
        updateMicButton("default"); // Reset button color
    }
}

// Speak Text Function
function speakText(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US"; // Set language to English
    utterance.rate = 1; // Normal speed
    utterance.pitch = 1; // Default pitch
    utterance.onstart = () => {
        isSpeaking = true;
        updateMicButton("speaking"); // Change the button color while speaking
    };
    utterance.onend = () => {
        isSpeaking = false;
        updateMicButton("default"); // Reset button color when finished
    };
    speechSynthesis.speak(utterance);
}

// Stop Speaking Function
function stopSpeaking() {
    speechSynthesis.cancel();
    isSpeaking = false;
    updateMicButton("default"); // Reset button color
}

// Update Microphone Button Color
function updateMicButton(state) {
    if (state === "speaking") {
        startButton.style.backgroundColor = "#f00"; // Red for speaking
        startButton.style.color = "#fff"; // White text
    } else {
        startButton.style.backgroundColor = ""; // Default color
        startButton.style.color = ""; // Default text color
    }
}

async function recordAudio() {
    if (isRecording) return; // Prevent multiple recordings simultaneously

    isRecording = true;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    const audioChunks = [];

    return new Promise((resolve) => {
        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            isRecording = false;
            const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
            resolve(audioBlob);
        };

        mediaRecorder.start();
        setTimeout(() => mediaRecorder.stop(), 5000); // Record for 5 seconds
    });
}

async function transcribeAudio(audioBlob, language = "en") {
    const formData = new FormData();
    formData.append("file", audioBlob, "audio.webm");
    formData.append("language", "en");

    const response = await fetch("/transcribe", {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("Transcription Error:", errorData);
        throw new Error(errorData.error || "Failed to transcribe audio.");
    }

    return await response.json(); // Return the transcription from the backend
}

// Event Listener for Start Button
startButton.addEventListener("click", async () => {
    if (isSpeaking) {
        stopSpeaking(); // Stop speaking if the button is clicked while speaking
    } else {
        await processVoiceAgent();
    }
});
