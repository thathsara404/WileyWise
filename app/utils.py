import openai
from sentence_transformers import SentenceTransformer
from scipy.spatial.distance import cosine

# OpenAI API key (replace with your key)
openai.api_key = "your_openai_api_key"

# Sentence-BERT model
model = SentenceTransformer("all-MiniLM-L6-v2")

def generate_answer_with_quiz(query, content):
    # Generate an answer
    prompt_answer = f"Based on the following text from Wiley Online Library, provide a summary or answer to the question: '{query}' \n\nContent: '{content}'"
    answer_response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=prompt_answer,
        max_tokens=150
    )
    answer = answer_response['choices'][0]['text'].strip()

    # Generate a quiz
    prompt_quiz = f"Based on the following text from Wiley Online Library, generate three quiz questions with answers. Use one true/false, one multiple-choice, and one fill-in-the-blank format. \n\nContent: '{content}'"
    quiz_response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=prompt_quiz,
        max_tokens=150
    )
    quiz = quiz_response['choices'][0]['text'].strip()

    return answer, quiz

def find_relevant_content(query, database):
    # Generate query embedding
    query_embedding = model.encode(query)
    best_match = None
    highest_similarity = -1

    # Find best matching entry
    for entry in database:
        similarity = 1 - cosine(query_embedding, entry["embedding"])
        if similarity > highest_similarity:
            highest_similarity = similarity
            best_match = entry

    return best_match["excerpt"] if best_match else "No relevant content found."
