from openai import OpenAI
from sentence_transformers import SentenceTransformer
from scipy.spatial.distance import cosine
import logging

# Sentence-BERT model
model = SentenceTransformer("all-MiniLM-L6-v2")
# OpenAI client (replace with your API key)
client = OpenAI(api_key="?????")

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

def generate_answer_with_quiz(query, content):
    try:
        logging.info("Starting to generate an answer for the query.")
        logging.debug(f"Query: {query}")
        logging.debug(f"Content: {content[:100]}...")  # Log first 100 characters of content
        
        # Generate an answer using the ChatCompletion API
        logging.info("Sending request to OpenAI ChatCompletion API for answer generation.")
        answer_response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an AI assistant trained to summarize and answer questions based on content."},
                {"role": "user", "content": f"Based on the following text, provide a detailed answer to the question: '{query}'\n\nContent: {content}"}
            ],
            max_tokens=150,
            stream=False,
        )
        
        # Log the raw 'choices' object
        logging.debug(f"Raw answer response 'choices': {answer_response}")

        # Extract the answer
        answer = answer_response.choices[0].message.content
        logging.info("Answer generation completed successfully.")
        logging.debug(f"Generated answer: {answer}")

        # Generate a quiz using the ChatCompletion API
        logging.info("Sending request to OpenAI ChatCompletion API for quiz generation.")
        quiz_response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an AI assistant trained to create quizzes from content."},
                {"role": "user", "content": f"Based on the following text, generate three quiz questions with answers: one true/false, one multiple-choice, and one fill-in-the-blank.\n\nContent: {content}"}
            ],
            max_tokens=150,
            stream=False,
        )

        # Extract the quiz
        quiz = quiz_response.choices[0].message.content
        logging.info("Quiz generation completed successfully.")
        logging.debug(f"Generated quiz: {quiz}")

        return answer, quiz
    except Exception as e:
        logging.error("An error occurred during answer or quiz generation.", exc_info=True)
        return f"Error generating response: {e}", ""

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
