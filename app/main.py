from flask import Flask, render_template, request, jsonify
from app.utils import find_relevant_content, generate_answer_with_quiz
import pickle

app = Flask(__name__)

# Load precomputed database
with open("app/data/database.pkl", "rb") as f:
    database = pickle.load(f)

@app.route('/')
def home():
    return render_template('index.html')


@app.route('/ask', methods=['POST'])
def ask():
    data = request.json
    query = data.get("query", "")
    if not query:
        return jsonify({"error": "No query provided."}), 400

    content = find_relevant_content(query, database)
    if content != "No relevant content found.":
        answer, quiz = generate_answer_with_quiz(query, content)
        response = {"answer": answer, "quiz": quiz}
    else:
        response = {"error": "No relevant content found in Wiley library."}

    return jsonify(response)

if __name__ == "__main__":
    app.run(debug=True)
