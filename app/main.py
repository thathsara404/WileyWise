from flask import Flask, render_template, send_from_directory, request, jsonify, abort, session, redirect, url_for
from app.utils import find_relevant_content, generate_answer_with_quiz
import pickle

app = Flask(__name__)
app.secret_key = 'your_secret_key_here'  # Secret key for session management

# In-memory user database (username: password)
users = {
    "user1": "password1",
    "user2": "password2"
}

# Load precomputed database
import pickle
with open("app/data/database.pkl", "rb") as f:
    database = pickle.load(f)

@app.route('/')
def home():
    # Redirect to login page if not logged in
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        # Check if user exists and password matches
        if username in users and users[username] == password:
            session['logged_in'] = True
            session['username'] = username
            return redirect(url_for('home'))
        else:
            return render_template('login.html', error="Invalid credentials")
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()  # Clear session
    return redirect(url_for('login'))

# Serve articles from the 'articles' directory
@app.route('/articles/<path:filename>')
def serve_article(filename):
    try:
        return send_from_directory('articles', filename)
    except FileNotFoundError:
        abort(404)

@app.route('/ask', methods=['POST'])
def ask():
    if not session.get('logged_in'):
        return jsonify({"error": "Unauthorized"}), 401  # Unauthorized if not logged in

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
            "link": link
        }
    else:
        response = {
            "error": "No relevant content found in Wiley library.",
            "link": None
        }

    return jsonify(response)

if __name__ == "__main__":
    app.run(debug=True)
