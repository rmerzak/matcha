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
CREATE TYPE notification_type AS ENUM ('like_received', 'profile_viewed', 'message_received', 'match_created', 'match_broken');

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
  "profile_picture" TEXT,
  "pictures" TEXT[4],
  "fame_rating" NUMERIC DEFAULT 0,
  "location" VARCHAR(255),
  "latitude" NUMERIC,
  "longitude" NUMERIC,
  "address" VARCHAR(255),
  "age" NUMERIC DEFAULT NULL,
  "date_of_birth" DATE DEFAULT NULL,
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

CREATE TABLE IF NOT EXISTS "notifications" (
  "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "user_id" UUID NOT NULL,
  "sender_id" UUID NOT NULL,
  "type" notification_type NOT NULL,
  "content" TEXT,
  "is_read" BOOLEAN DEFAULT FALSE,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_id FOREIGN KEY ("user_id") REFERENCES "users" ("id"),
  CONSTRAINT fk_sender_id FOREIGN KEY ("sender_id") REFERENCES "users" ("id")
);

CREATE INDEX idx_user_location ON users (latitude, longitude);

CREATE INDEX idx_fame_rating ON users (fame_rating);

CREATE INDEX idx_user_age ON users (age);

CREATE INDEX idx_notification_user ON notifications (user_id);
CREATE INDEX idx_notification_read ON notifications (user_id, is_read);

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

-- Create function to generate test users
CREATE OR REPLACE FUNCTION generate_test_users(num_users INTEGER) RETURNS VOID AS $$
DECLARE
  i INTEGER;
  username TEXT;
  first_name TEXT;
  last_name TEXT;
  email TEXT;
  gender_options TEXT[] := ARRAY['male', 'female', 'non_binary'];
  sexual_pref_options TEXT[] := ARRAY['heterosexual', 'homosexual', 'bisexual', 'other'];
  interests_all TEXT[] := ARRAY['hiking', 'movies', 'cooking', 'reading', 'travel', 'photography', 
    'art', 'music', 'dancing', 'fitness', 'gaming', 'technology', 'fashion', 'design', 
    'camping', 'yoga', 'writing', 'sports', 'food', 'politics', 'science', 'animals', 
    'meditation', 'gardening', 'languages', 'history', 'astronomy', 'swimming'];
  cities TEXT[] := ARRAY['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 
    'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 
    'Columbus', 'San Francisco', 'Charlotte', 'Indianapolis', 'Seattle', 'Denver', 'Boston'];
  city_coords NUMERIC[][] := ARRAY[
    ARRAY[40.7128, -74.0060], -- New York
    ARRAY[34.0522, -118.2437], -- Los Angeles
    ARRAY[41.8781, -87.6298], -- Chicago
    ARRAY[29.7604, -95.3698], -- Houston
    ARRAY[33.4484, -112.0740], -- Phoenix
    ARRAY[39.9526, -75.1652], -- Philadelphia
    ARRAY[29.4241, -98.4936], -- San Antonio
    ARRAY[32.7157, -117.1611], -- San Diego
    ARRAY[32.7767, -96.7970], -- Dallas
    ARRAY[37.3382, -121.8863], -- San Jose
    ARRAY[30.2672, -97.7431], -- Austin
    ARRAY[30.3322, -81.6557], -- Jacksonville
    ARRAY[32.7555, -97.3308], -- Fort Worth
    ARRAY[39.9612, -82.9988], -- Columbus
    ARRAY[37.7749, -122.4194], -- San Francisco
    ARRAY[35.2271, -80.8431], -- Charlotte
    ARRAY[39.7684, -86.1581], -- Indianapolis
    ARRAY[47.6062, -122.3321], -- Seattle
    ARRAY[39.7392, -104.9903], -- Denver
    ARRAY[42.3601, -71.0589]  -- Boston
  ];
  first_names TEXT[] := ARRAY['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'Alex', 'Olivia', 
    'Daniel', 'Sophia', 'Matthew', 'Emma', 'Christopher', 'Ava', 'Andrew', 'Mia', 'Joshua', 'Isabella', 
    'James', 'Charlotte', 'Ryan', 'Amelia', 'Ethan', 'Harper', 'William', 'Evelyn', 'Joseph', 'Abigail', 
    'Thomas', 'Elizabeth', 'Nathan', 'Sofia', 'Kevin', 'Ella', 'Benjamin', 'Grace', 'Robert', 'Victoria', 
    'Jacob', 'Scarlett', 'Steven', 'Madison', 'Carlos', 'Luna', 'Miguel', 'Layla', 'Raj', 'Zoe', 'Omar', 'Lily'];
  last_names TEXT[] := ARRAY['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 
    'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 
    'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis', 'Lee', 'Walker', 'Hall', 'Allen', 'Young', 
    'Hernandez', 'King', 'Wright', 'Lopez', 'Hill', 'Scott', 'Green', 'Adams', 'Baker', 'Gonzalez', 
    'Nelson', 'Carter', 'Mitchell', 'Perez', 'Roberts', 'Turner', 'Phillips', 'Campbell', 'Parker', 'Evans', 
    'Edwards', 'Collins'];
  bio_templates TEXT[] := ARRAY[
    'Passionate about %s and %s. Looking for someone who shares my interests.',
    'Love to %s in my free time. %s enthusiast and adventure seeker.',
    '%s lover and %s aficionado. Let''s chat and see where it goes!',
    'When I''m not busy with %s, I enjoy %s. Looking for genuine connections.',
    'My friends describe me as a %s person with a love for %s.',
    'Big fan of %s and %s. Looking for someone to share adventures with.',
    'Life motto: %s and enjoy %s. Would love to meet like-minded people.',
    '%s by day, %s enthusiast by night. Let''s get to know each other!',
    'Exploring life through %s and %s. Looking for a companion on this journey.',
    'Passionate about %s and discovering new %s experiences.'
  ];
  profile_pics TEXT[] := ARRAY[
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e',
    'https://images.unsplash.com/photo-1568602471122-7832951cc4c5',
    'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    'https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6',
    'https://images.unsplash.com/photo-1519699047748-de8e457a634e',
    'https://plus.unsplash.com/premium_photo-1689977807477-a579eda91fa2',
    'https://images.unsplash.com/photo-1517365830460-955ce3ccd263',
    'https://plus.unsplash.com/premium_photo-1690407617542-2f210cf20d7e',
    'https://images.unsplash.com/photo-1480455624313-e29b44bbfde1',
    'https://images.unsplash.com/photo-1554780336-390462301acf'
  ];
  user_id UUID;
  random_city INTEGER;
  random_lat NUMERIC;
  random_lng NUMERIC;
  user_interests TEXT[];
  num_interests INTEGER;
  random_gender TEXT;
  random_sexual_pref TEXT;
  random_bio TEXT;
  random_first TEXT;
  random_last TEXT;
  random_age INTEGER;
  random_dob DATE;
  profile_pic TEXT;
  interest1 TEXT;
  interest2 TEXT;
  pic_index INTEGER;
BEGIN
  -- For debugging - print a message to confirm function is executing
  RAISE NOTICE 'Starting to generate % test users', num_users;

  FOR i IN 1..num_users LOOP
    BEGIN
      -- Generate random data for this user
      random_first := first_names[1 + floor(random() * array_length(first_names, 1))];
      random_last := last_names[1 + floor(random() * array_length(last_names, 1))];
      username := lower(random_first || random_last || floor(random() * 1000)::TEXT);
      first_name := random_first;
      last_name := random_last;
      email := lower(random_first || '.' || random_last || floor(random() * 1000)::TEXT || '@example.com');
      
      -- Select random gender and sexual preference
      random_gender := gender_options[1 + floor(random() * array_length(gender_options, 1))];
      random_sexual_pref := sexual_pref_options[1 + floor(random() * array_length(sexual_pref_options, 1))];
      
      -- Generate random age between 18 and 50
      random_age := 18 + floor(random() * 32);
      
      -- Calculate date of birth based on age
      random_dob := CURRENT_DATE - (random_age * INTERVAL '1 year') - (floor(random() * 365) * INTERVAL '1 day');
      
      -- Select random interests (between 2 and 5)
      num_interests := 2 + floor(random() * 4);
      user_interests := ARRAY[]::TEXT[];
      
      FOR j IN 1..num_interests LOOP
        user_interests := array_append(user_interests, 
          interests_all[1 + floor(random() * array_length(interests_all, 1))]);
      END LOOP;
      
      -- Remove duplicates
      user_interests := ARRAY(SELECT DISTINCT unnest(user_interests));
      
      -- Select random city and coordinates with slight randomization
      random_city := 1 + floor(random() * array_length(cities, 1));
      random_lat := city_coords[random_city][1] + (random() * 0.1 - 0.05);
      random_lng := city_coords[random_city][2] + (random() * 0.1 - 0.05);
      
      -- Select a random profile picture from the Unsplash array
      pic_index := 1 + floor(random() * array_length(profile_pics, 1));
      profile_pic := profile_pics[pic_index];
      
      -- Create random bio
      interest1 := user_interests[1 + floor(random() * array_length(user_interests, 1))];
      IF array_length(user_interests, 1) > 1 THEN
        interest2 := user_interests[1 + floor(random() * array_length(user_interests, 1))];
        WHILE interest2 = interest1 LOOP
          interest2 := user_interests[1 + floor(random() * array_length(user_interests, 1))];
        END LOOP;
      ELSE
        interest2 := 'socializing';
      END IF;
      
      random_bio := format(
        bio_templates[1 + floor(random() * array_length(bio_templates, 1))],
        interest1,
        interest2
      );
      
      -- Insert the user
      INSERT INTO "users" (
        "username", "first_name", "last_name", "email", "password", "gender", 
        "sexual_preferences", "interests", "profile_picture",
        "fame_rating", "location", "latitude", "longitude", "age", "date_of_birth", "bio", "is_verified"
      ) VALUES (
        username, first_name, last_name, email, 
        '$2b$12$ZasZYPAD8w0hauYrEziYcumcMy5DWadtS/voVz0XJGMjpLgWWXQdm', -- Same password for all test users
        random_gender::gender_type, 
        random_sexual_pref::sexual_orientation,
        user_interests,
        profile_pic,
        20 + floor(random() * 80)::INTEGER, -- Random fame rating between 20-100
        cities[random_city],
        random_lat,
        random_lng,
        random_age,
        random_dob,
        random_bio,
        TRUE
      ) RETURNING id INTO user_id;
      
      -- Debugging message
      RAISE NOTICE 'Created user %: % %', i, first_name, last_name;
      
      -- Insert user preferences
      INSERT INTO "user_preferences" (
        "user_id", "min_age", "max_age", "min_fame_rating", "max_fame_rating", 
        "preferred_distance", "preferred_tags"
      ) VALUES (
        user_id,
        GREATEST(18, random_age - 5 - floor(random() * 5)::INTEGER),
        random_age + 5 + floor(random() * 10)::INTEGER,
        floor(random() * 50)::INTEGER,
        100,
        10 + floor(random() * 90)::INTEGER,
        user_interests
      );
      
      -- Handle errors for each user separately to continue processing
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error creating user %: %', i, SQLERRM;
    END;
  END LOOP;

  -- For debugging - print completion message
  RAISE NOTICE 'Finished generating users, now creating interactions';

  -- Generate some random connections and interactions between users
  BEGIN
    PERFORM generate_random_interactions(num_users / 10); -- Create interactions for about 10% of users
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Error generating interactions: %', SQLERRM;
  END;
  
  RAISE NOTICE 'Completed user generation process';
END;
$$ LANGUAGE plpgsql;

-- Create function to generate random interactions between users
CREATE OR REPLACE FUNCTION generate_random_interactions(num_interactions INTEGER) RETURNS VOID AS $$
DECLARE
  user_ids UUID[];
  user1_id UUID;
  user2_id UUID;
  is_match BOOLEAN;
  user_count INTEGER;
BEGIN
  -- Get all user IDs
  SELECT array_agg(id), COUNT(*) INTO user_ids, user_count FROM users;
  
  -- Debugging - print the number of users found
  RAISE NOTICE 'Found % users for generating interactions', user_count;
  
  -- Exit if no users or only one user exists
  IF user_count < 2 THEN
    RAISE NOTICE 'Not enough users to generate interactions';
    RETURN;
  END IF;
  
  -- Generate random likes
  FOR i IN 1..num_interactions*5 LOOP
    BEGIN
      user1_id := user_ids[1 + floor(random() * user_count)];
      user2_id := user_ids[1 + floor(random() * user_count)];
      
      -- Ensure we're not creating a self-like
      WHILE user1_id = user2_id LOOP
        user2_id := user_ids[1 + floor(random() * user_count)];
      END LOOP;
      
      -- Random chance for mutual like (match)
      is_match := random() < 0.3; -- 30% chance of match

      -- Insert first like
      INSERT INTO "likes" ("liker", "liked", "is_connected")
      VALUES (user1_id, user2_id, is_match)
      ON CONFLICT DO NOTHING;

      -- If match, insert the reverse like too
      IF is_match THEN
        INSERT INTO "likes" ("liker", "liked", "is_connected") 
        VALUES (user2_id, user1_id, TRUE)
        ON CONFLICT DO NOTHING;

        -- Add some messages for matches
        IF random() < 0.8 THEN -- 80% chance for messages in matches
          INSERT INTO "messages" ("sender", "receiver", "content", "is_read")
          VALUES 
            (user1_id, user2_id, 'Hi there! How are you doing?', TRUE),
            (user2_id, user1_id, 'Hey! I''m good, thanks for asking. How about you?', random() < 0.5);

          IF random() < 0.6 THEN -- 60% chance for more messages
            INSERT INTO "messages" ("sender", "receiver", "content", "is_read")
            VALUES 
              (user1_id, user2_id, 'I''m great! I noticed we both like similar things.', random() < 0.7),
              (user2_id, user1_id, 'Yes, that''s awesome! Would love to chat more about it.', random() < 0.3);
          END IF;
        END IF;
      END IF;

      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error creating interaction %: %', i, SQLERRM;
    END;
  END LOOP;
  -- Generate some profile views
  FOR i IN 1..num_interactions*10 LOOP
    BEGIN
      user1_id := user_ids[1 + floor(random() * user_count)];
      user2_id := user_ids[1 + floor(random() * user_count)];
      -- Ensure we're not creating a self-view
      WHILE user1_id = user2_id LOOP
        user2_id := user_ids[1 + floor(random() * user_count)];
      END LOOP;
      INSERT INTO "views" ("viewer", "viewed")
      VALUES (user1_id, user2_id)
      ON CONFLICT DO NOTHING;
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error creating view %: %', i, SQLERRM;
    END;
  END LOOP;
  
  -- Generate some direct notifications (in addition to those created by triggers)
  FOR i IN 1..num_interactions*3 LOOP
    BEGIN
      user1_id := user_ids[1 + floor(random() * user_count)];
      user2_id := user_ids[1 + floor(random() * user_count)];
      
      -- Ensure we're not creating a self-notification
      WHILE user1_id = user2_id LOOP
        user2_id := user_ids[1 + floor(random() * user_count)];
      END LOOP;
      
      -- Create random notification with random read status
      INSERT INTO "notifications" (
        "user_id", 
        "sender_id", 
        "type", 
        "content", 
        "is_read"
      )
      VALUES (
        user1_id,
        user2_id,
        (ARRAY['like_received', 'profile_viewed', 'message_received', 'match_created', 'match_broken'])[1 + floor(random() * 5)]::notification_type,
        CASE 
          WHEN random() < 0.2 THEN 'Someone liked your profile'
          WHEN random() < 0.4 THEN 'Someone viewed your profile'
          WHEN random() < 0.6 THEN 'You received a new message'
          WHEN random() < 0.8 THEN 'You have a new match!'
          ELSE 'A match has been broken'
        END,
        random() < 0.5  -- 50% chance of being read
      );
      
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error creating notification %: %', i, SQLERRM;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create simple test users first to verify everything works
DO $$
BEGIN
  RAISE NOTICE 'Adding test users manually';
  
  INSERT INTO "users" (
    "username", "first_name", "last_name", "email", "password", "gender", 
    "sexual_preferences", "interests", "profile_picture", "fame_rating", 
    "location", "latitude", "longitude", "age", "bio", "is_verified"
  ) VALUES
    ('testuser1', 'Test', 'User', 'test1@example.com', 
     '$2a$10$xDQEpbf1U94z5v/U9QZz5OpjEM9TZ7MHDwrX5aQM3QaEpltQV52ey', 'male'::gender_type, 
     'heterosexual'::sexual_orientation, ARRAY['hiking', 'movies'], '/profiles/test.jpg', 
     50, 'New York', 40.7128, -74.0060, 30, 'Test user bio', TRUE);
  
  RAISE NOTICE 'Manual test user added';
  
  -- Now try the bulk generation with fewer users first
  PERFORM generate_test_users(10);
  
  RAISE NOTICE 'Completed test user generation';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error in test generation: %', SQLERRM;
END $$;

-- Generate the full set of users after testing with a smaller batch
DO $$
BEGIN
  PERFORM generate_test_users(490);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error in main generation: %', SQLERRM;
END $$;

-- Clean up the functions when done
DROP FUNCTION IF EXISTS generate_test_users(INTEGER);
DROP FUNCTION IF EXISTS generate_random_interactions(INTEGER);

-- Create triggers to automatically create notifications

-- Trigger for likes
CREATE OR REPLACE FUNCTION create_like_notification() RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for receiving a like
  INSERT INTO notifications (user_id, sender_id, type, content)
  VALUES (NEW.liked, NEW.liker, 'like_received', 'Someone liked your profile');
  
  -- Check if this creates a match (both users liked each other)
  IF EXISTS (SELECT 1 FROM likes WHERE liker = NEW.liked AND liked = NEW.liker) THEN
    -- Create match notification
    INSERT INTO notifications (user_id, sender_id, type, content)
    VALUES 
      (NEW.liked, NEW.liker, 'match_created', 'You have a new match!'),
      (NEW.liker, NEW.liked, 'match_created', 'You have a new match!');
    
    -- Update both like records to show they're connected
    UPDATE likes SET is_connected = TRUE 
    WHERE (liker = NEW.liker AND liked = NEW.liked) 
       OR (liker = NEW.liked AND liked = NEW.liker);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_like_insert
  AFTER INSERT ON likes
  FOR EACH ROW
  EXECUTE FUNCTION create_like_notification();

-- Trigger for unlikes (when a row is deleted from likes table)
CREATE OR REPLACE FUNCTION create_unlike_notification() RETURNS TRIGGER AS $$
BEGIN
  -- Only create notification if they were previously matched
  IF OLD.is_connected = TRUE THEN
    -- Check if the other person still has a like record
    IF EXISTS (SELECT 1 FROM likes WHERE liker = OLD.liked AND liked = OLD.liker) THEN
      -- Create unlike notification
      INSERT INTO notifications (user_id, sender_id, type, content)
      VALUES (OLD.liked, OLD.liker, 'match_broken', 'A match has been broken');
      
      -- Update the remaining like to show they're no longer connected
      UPDATE likes SET is_connected = FALSE 
      WHERE liker = OLD.liked AND liked = OLD.liker;
    END IF;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_like_delete
  AFTER DELETE ON likes
  FOR EACH ROW
  EXECUTE FUNCTION create_unlike_notification();

-- Trigger for profile views
CREATE OR REPLACE FUNCTION create_view_notification() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, sender_id, type, content)
  VALUES (NEW.viewed, NEW.viewer, 'profile_viewed', 'Someone viewed your profile');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_view_insert
  AFTER INSERT ON views
  FOR EACH ROW
  EXECUTE FUNCTION create_view_notification();

-- Trigger for messages
CREATE OR REPLACE FUNCTION create_message_notification() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, sender_id, type, content)
  VALUES (NEW.receiver, NEW.sender, 'message_received', 'You received a new message');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_message_insert
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION create_message_notification();
