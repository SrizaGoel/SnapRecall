from sentence_transformers import SentenceTransformer

# model = SentenceTransformer(
#     "BAAI/bge-base-en-v1.5"
# )

model = SentenceTransformer("BAAI/bge-small-en-v1.5")

def generate_embedding(text):
    return model.encode(text).tolist()