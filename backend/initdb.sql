CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'pacsdb') THEN
        EXECUTE 'CREATE DATABASE pacsdb';
    END IF;
END $$;

\c pacsdb

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE gender_type AS ENUM ('male', 'female', 'non_binary', 'other');
CREATE TYPE sexual_orientation AS ENUM ('heterosexual', 'homosexual', 'bisexual', 'other');
CREATE TYPE report_type AS ENUM ('fake_account', 'inappropriate_content', 'harassment', 'other');

CREATE TABLE IF NOT EXISTS "users" (
  "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "username" VARCHAR(255) NOT NULL,
  "first_name" VARCHAR(255),
  "last_name" VARCHAR(255),
  "email" VARCHAR(255) UNIQUE,
  "password" VARCHAR(255),
  "online" BOOLEAN DEFAULT FALSE,
  "last_connection" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "gender" gender_type,
  "sexual_preferences" sexual_orientation DEFAULT 'bisexual',
  "interests" TEXT[],
  "pictures" TEXT[5],
  "fame_rating" NUMERIC DEFAULT 0,
  "location" VARCHAR(255),
  "latitude" NUMERIC,
  "longitude" NUMERIC,
  "address" VARCHAR(255),
  "age" NUMERIC,
  "bio" TEXT,
  "is_verified" BOOLEAN DEFAULT FALSE,
  "is_blocked" BOOLEAN DEFAULT FALSE,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "views" (
  "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "viewer" UUID,
  "viewed" UUID,
  "view_time" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_viewer FOREIGN KEY ("viewer") REFERENCES "users" ("id"),
  CONSTRAINT fk_viewed FOREIGN KEY ("viewed") REFERENCES "users" ("id")
);


CREATE TABLE IF NOT EXISTS "likes" (
  "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "liker" UUID,
  "liked" UUID,
  "like_time" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "is_connected" BOOLEAN DEFAULT FALSE,
  CONSTRAINT fk_liker FOREIGN KEY ("liker") REFERENCES "users" ("id"),
  CONSTRAINT fk_liked FOREIGN KEY ("liked") REFERENCES "users" ("id"),
  UNIQUE(liker, liked)
);

CREATE TABLE IF NOT EXISTS "messages" (
  "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "sender" UUID,
  "receiver" UUID,
  "content" TEXT,
  "is_read" BOOLEAN DEFAULT FALSE,
  "sent_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sender_id FOREIGN KEY ("sender") REFERENCES "users" ("id"),
  CONSTRAINT fk_receiver_id FOREIGN KEY ("receiver") REFERENCES "users" ("id")
);

CREATE TABLE IF NOT EXISTS "blocks" (
  "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "blocker" UUID,
  "blocked" UUID,
  "block_time" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_blocker FOREIGN KEY ("blocker") REFERENCES "users" ("id"),
  CONSTRAINT fk_blocked FOREIGN KEY ("blocked") REFERENCES "users" ("id"),
  UNIQUE(blocker, blocked)
);

CREATE TABLE IF NOT EXISTS "reports" (
  "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "reporter" UUID,
  "reported" UUID,
  "report_type" report_type,
  "description" TEXT,
  "report_time" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reporter FOREIGN KEY ("reporter") REFERENCES "users" ("id"),
  CONSTRAINT fk_reported FOREIGN KEY ("reported") REFERENCES "users" ("id")
);

CREATE TABLE IF NOT EXISTS "user_preferences" (
  "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "user_id" UUID,
  "min_age" INTEGER,
  "max_age" INTEGER,
  "min_fame_rating" NUMERIC,
  "max_fame_rating" NUMERIC,
  "preferred_distance" INTEGER,
  "preferred_tags" TEXT[],
  CONSTRAINT fk_user_id FOREIGN KEY ("user_id") REFERENCES "users" ("id")
);

CREATE INDEX idx_user_location ON users (latitude, longitude);

CREATE INDEX idx_fame_rating ON users (fame_rating);

CREATE INDEX idx_user_age ON users (age);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
