from sentence_transformers import SentenceTransformer
import pickle

# Load Sentence-BERT model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Example database of articles
database = [
    {
        "id": 1,
        "title": "Renewable Energy Benefits",
        "excerpt": "Renewable energy sources like wind and solar play a vital role in ensuring a sustainable future. They are cost-effective and significantly reduce carbon emissions, helping combat climate change and decrease reliance on fossil fuels. While renewable energy adoption leads to cleaner air, healthier ecosystems, and a stable climate, challenges such as energy storage and upfront investment costs must be addressed to fully harness their potential.",
        "link": "/articles/renewable-energy-benefits.html"
    },
    {
        "id": 2,
        "title": "Sustainable Agriculture",
        "excerpt": "Sustainable agriculture focuses on balancing food production with environmental preservation through practices like crop rotation, conservation tillage, and organic farming. These methods enhance soil health, conserve water, and reduce greenhouse gas emissions while promoting biodiversity, ecosystem stability, and social responsibility.",
        "link": "/articles/sustainable-agriculture.html"
    },
    # Add more articles as needed
]


# Generate embeddings for each article
for entry in database:
    entry["embedding"] = model.encode(entry["excerpt"])

# Save the database with embeddings
with open("app/data/database.pkl", "wb") as f:
    pickle.dump(database, f)

print("Embeddings generated and saved successfully!")
