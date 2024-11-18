from sentence_transformers import SentenceTransformer
import pickle

# Load Sentence-BERT model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Example database of articles
database = [
    {"id": 1, "title": "Renewable Energy Benefits", "excerpt": "Renewable energy sources, such as wind and solar, are affordable and reduce carbon emissions."},
    {"id": 2, "title": "Sustainable Agriculture", "excerpt": "Sustainable agriculture focuses on long-term productivity while protecting the environment."},
    # Add more articles as needed
]

# Generate embeddings for each article
for entry in database:
    entry["embedding"] = model.encode(entry["excerpt"])

# Save the database with embeddings
with open("app/data/database.pkl", "wb") as f:
    pickle.dump(database, f)

print("Embeddings generated and saved successfully!")
