-- CREATE DATABASE snaprecall;
-- \c snaprecall
-- cause docker makes the db automatically
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE users(
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email_id VARCHAR(255) UNIQUE,
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sessions(
    session_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    duration INTERVAL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    tags VARCHAR(100)
);




CREATE TABLE screenshots(
    screenshot_id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES sessions(session_id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    ocr_text TEXT,
    captured_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    embedding VECTOR(768),
    is_deleted BOOLEAN DEFAULT FALSE,
    processing_status VARCHAR(20) CHECK (processing_status IN ('pending','ocr_done','embedded','failed')) DEFAULT 'pending'
);


ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS title TEXT;

ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS summary TEXT;

ALTER TABLE screenshots
ADD COLUMN IF NOT EXISTS cloudinary_public_id TEXT;

ALTER TABLE users ADD COLUMN IF NOT EXISTS firebase_uid TEXT UNIQUE;


/*
ALTER TABLE sessions
ADD COLUMN title TEXT;

ALTER TABLE sessions
ADD COLUMN summary TEXT;

ALTER TABLE screenshots
ADD COLUMN cloudinary_public_id TEXT;

*/