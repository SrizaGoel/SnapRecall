# SnapRecall

<p align="center">
  <b>Capture. Organize. Search. Recall.</b><br>
  An AI-powered screenshot memory assistant that transforms scattered screenshots into an intelligent, searchable knowledge base.
</p>

---

## Overview

We take hundreds of screenshots every month—coding snippets, lecture slides, articles, tutorials, notes, error messages, and ideas. Finding them later becomes nearly impossible.

**SnapRecall** solves this problem by automatically extracting text from screenshots, generating semantic embeddings, and allowing users to search or ask AI-powered questions about previously captured content.

Instead of scrolling through your gallery, simply search naturally.

---

# Features

### Secure Authentication
- Google Sign-In
- Persistent user sessions

### Session Management
- Create study/work sessions
- Upload multiple screenshots
- Delete unwanted sessions
- Session summaries

### Cloud Storage
- Images uploaded securely to Cloudinary
- Lightweight database storage

### OCR Processing
- Automatic text extraction from screenshots, images

### Semantic Search
- Vector embeddings using Sentence Transformers
- PostgreSQL + pgvector
- Meaning-based search instead of keyword matching

### AI Assistant
Ask questions like:

> "Where did I save the Git commands?"

> "Show me the VS Code shortcut screenshot."

> "What was written about binary search?"

Powered by Groq LLM.

### Mobile First
Built completely in React Native using Expo.


---

# Tech Stack

## Frontend

- React Native
- Expo
- Axios

## Backend

- FastAPI
- SQLAlchemy
- PostgreSQL
- pgvector

## AI

- Sentence Transformers (BAAI/bge-small-en-v1.5)
- Groq LLM
- OCR.Space API

## Cloud

- Railway
- Cloudinary

## Authentication

- Supabase Google OAuth

---

# Installation

## Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/SnapRecall.git
cd SnapRecall
```

---

## Backend

```bash
cd backend

pip install -r requirements.txt

uvicorn app:app --reload
```

---

## Frontend

```bash
cd frontend

npm install

npx expo start
```

---

# Environment Variables

Backend

```env
DATABASE_URL=

GROQ_API_KEY=

OCR_API_KEY=

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=
```

Frontend

```env
EXPO_PUBLIC_API_URL=

SUPABASE_URL=

SUPABASE_ANON_KEY=
```

---


# Future Improvements

- Offline mode
- Auto screenshot capture
- Image similarity search
- Voice search
- PDF support
- AI-generated flashcards

---

#  Author

**Sriza Goel**

B.Tech CSE 

---

# If you like this project...

Please consider giving it a ⭐ on GitHub!

---
