-- Ensure the `uuid-ossp` extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Check if the database exists and create it if it does not
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'pacsdb') THEN
        EXECUTE 'CREATE DATABASE pacsdb';
    END IF;
END $$;

-- Connect to the specific database
\c pacsdb

-- Create the "users" table if it does not exist
CREATE TABLE IF NOT EXISTS "users" (
  "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "username" VARCHAR(255) NOT NULL,
  "first_name" VARCHAR(255),
  "last_name" VARCHAR(255),
  "email" VARCHAR(255) UNIQUE,
  "password" VARCHAR(255),
  "gender" VARCHAR(255),
  "sexual_preferences" TEXT,
  "interests" TEXT[],
  "pictures" TEXT[5],
  "fame_rating" NUMERIC,
  "location" VARCHAR(255),
  "latitude" NUMERIC,
  "address" VARCHAR(255),
  "age" NUMERIC,
  "bio" TEXT,
  "is_verified" BOOLEAN DEFAULT FALSE,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the "user_views" table if it does not exist
CREATE TABLE IF NOT EXISTS "views" (
  "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "viewer" UUID,
  "viewed" UUID,
  "view_time" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_viewer FOREIGN KEY ("viewer") REFERENCES "users" ("id"),
  CONSTRAINT fk_viewed FOREIGN KEY ("viewed") REFERENCES "users" ("id")
);

-- Create the "user_likes" table if it does not exist
CREATE TABLE IF NOT EXISTS "likes" (
  "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "liker" UUID,
  "liked" UUID,
  "like_time" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_liker FOREIGN KEY ("liker") REFERENCES "users" ("id"),
  CONSTRAINT fk_liked FOREIGN KEY ("liked") REFERENCES "users" ("id")
);

-- Create the "Message" table if it does not exist
CREATE TABLE IF NOT EXISTS "Message" (
  "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "sender" UUID,
  "receiver" UUID,
  "time" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "content" TEXT,
  CONSTRAINT fk_sender_id FOREIGN KEY ("sender") REFERENCES "users" ("id"),
  CONSTRAINT fk_receiver_id FOREIGN KEY ("receiver") REFERENCES "users" ("id")
);

-- INSERT INTO "users" (
--     "username", 
--     "first_name", 
--     "last_name", 
--     "email", 
--     "password", 
--     "gender", 
--     "sexual_preferences", 
--     "interests", 
--     "pictures", 
--     "fame_rating", 
--     "location", 
--     "latitude", 
--     "address", 
--     "age", 
--     "bio", 
--     "is_verified"
-- ) 
-- VALUES (
--     'john_doe',            -- username
--     'John',                -- first_name
--     'Doe',                 -- last_name
--     'johndoe@example.com', -- email
--     'password123',         -- password (hashed in practice)
--     'Male',                -- gender
--     'Women',               -- sexual_preferences
--     ARRAY['music', 'coding'],  -- interests (array)
--     'path_to_picture.jpg', -- pictures
--     50,                    -- fame_rating
--     'New York',            -- location
--     40.7128,               -- latitude
--     '123 Example St',      -- address
--     30,                    -- age
--     'A brief bio here',    -- bio
--     TRUE                   -- is_verified
-- );