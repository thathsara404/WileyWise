from flask import Flask, render_template, send_from_directory, request, jsonify, abort
from app.utils import find_relevant_content, generate_answer_with_quiz
import pickle

app = Flask(__name__)

# Load precomputed database
with open("app/data/database.pkl", "rb") as f:
    database = pickle.load(f)

@app.route('/')
def home():
    return render_template('index.html')

# Serve articles from the 'articles' directory
@app.route('/articles/<path:filename>')
def serve_article(filename):
    try:
        return send_from_directory('articles', filename)
    except FileNotFoundError:
        # If the file is not found, return a 404 error
        abort(404)

@app.route('/ask', methods=['POST'])
def ask():
    data = request.json
    query = data.get("query", "")
    strictness = data.get('strictness')
    if not query:
        return jsonify({"error": "No query provided."}), 400

    # Find relevant content and its link
    relevant_content = find_relevant_content(query, database)
    excerpt = relevant_content["excerpt"]
    link = relevant_content["link"]

    if excerpt != "No relevant content found.":
        # Generate answer and quiz
        answer, quiz = generate_answer_with_quiz(query, excerpt, strictness)
        response = {
            "answer": answer,
            "quiz": quiz,
            "link": link  # Include the link to the full article
        }
    else:
        response = {
            "error": "No relevant content found in Wiley library.",
            "link": None  # No link available if no content is found
        }

    return jsonify(response)


if __name__ == "__main__":
    app.run(debug=True)
