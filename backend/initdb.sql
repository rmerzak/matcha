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

-- Create function to generate random interactions
CREATE OR REPLACE FUNCTION generate_random_interactions(num_interactions INTEGER) RETURNS VOID AS $$
DECLARE
  i INTEGER;
  user1_id UUID;
  user2_id UUID;
  all_users UUID[];
  user_count INTEGER;
  interaction_type INTEGER;
BEGIN
  -- Get all user IDs
  SELECT array_agg(id) INTO all_users FROM users;
  user_count := array_length(all_users, 1);
  
  IF user_count < 2 THEN
    RAISE NOTICE 'Not enough users to generate interactions';
    RETURN;
  END IF;
  
  FOR i IN 1..num_interactions LOOP
    BEGIN
      -- Select two different random users
      user1_id := all_users[1 + floor(random() * user_count)];
      user2_id := all_users[1 + floor(random() * user_count)];
      
      -- Ensure they're different users
      WHILE user1_id = user2_id LOOP
        user2_id := all_users[1 + floor(random() * user_count)];
      END LOOP;
      
      -- Random interaction type: 1=view, 2=like, 3=message (if connected)
      interaction_type := 1 + floor(random() * 3);
      
      IF interaction_type = 1 THEN
        -- Create a view (if not exists)
        INSERT INTO views (viewer, viewed)
        VALUES (user1_id, user2_id)
        ON CONFLICT DO NOTHING;
        
      ELSIF interaction_type = 2 THEN
        -- Create a like (if not exists)
        INSERT INTO likes (liker, liked)
        VALUES (user1_id, user2_id)
        ON CONFLICT DO NOTHING;
        
      ELSIF interaction_type = 3 THEN
        -- Create a message only if users are connected
        IF EXISTS (
          SELECT 1 FROM likes l1 
          JOIN likes l2 ON l1.liker = l2.liked AND l1.liked = l2.liker 
          WHERE (l1.liker = user1_id AND l1.liked = user2_id)
        ) THEN
          INSERT INTO messages (sender, receiver, content)
          VALUES (user1_id, user2_id, 'Hey there! How are you doing?');
        END IF;
      END IF;
      
    EXCEPTION WHEN OTHERS THEN
      -- Continue with next interaction if this one fails
      CONTINUE;
    END;
  END LOOP;
  
  RAISE NOTICE 'Generated % random interactions', num_interactions;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate test users with improved logic
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
  
  -- Gender-specific names
  male_first_names TEXT[] := ARRAY['Alexander', 'Benjamin', 'Christopher', 'Daniel', 'Ethan', 'Felix', 
    'Gabriel', 'Henry', 'Isaac', 'James', 'Kevin', 'Liam', 'Michael', 'Nathan', 'Oliver', 'Patrick', 
    'Quinn', 'Ryan', 'Samuel', 'Thomas', 'Victor', 'William', 'Xavier', 'Zachary', 'Adrian', 'Blake', 
    'Connor', 'David', 'Eric', 'Frank', 'George', 'Hunter', 'Ian', 'Jack', 'Kyle', 'Lucas', 'Mason', 
    'Noah', 'Owen', 'Peter', 'Robert', 'Sebastian', 'Tyler', 'Vincent', 'Wesley', 'Xander', 'Yusuf', 'Zane'];
    
  female_first_names TEXT[] := ARRAY['Abigail', 'Bella', 'Charlotte', 'Diana', 'Emma', 'Faith', 'Grace', 
    'Hannah', 'Isabella', 'Julia', 'Katherine', 'Luna', 'Mia', 'Natalie', 'Olivia', 'Penelope', 'Quinn', 
    'Rachel', 'Sophia', 'Taylor', 'Victoria', 'Willow', 'Ximena', 'Yasmin', 'Zoe', 'Aria', 'Brooke', 
    'Chloe', 'Delilah', 'Elena', 'Fiona', 'Gabriella', 'Hazel', 'Iris', 'Jasmine', 'Kimberly', 'Lily', 
    'Madison', 'Nicole', 'Paige', 'Rose', 'Samantha', 'Tessa', 'Uma', 'Violet', 'Wendy', 'Yara'];
    
  nonbinary_first_names TEXT[] := ARRAY['Alex', 'Avery', 'Blake', 'Cameron', 'Drew', 'Emery', 'Finley', 
    'Gray', 'Harper', 'Indigo', 'Jordan', 'Kai', 'Logan', 'Morgan', 'Nova', 'Ocean', 'Parker', 'Quinn', 
    'River', 'Sage', 'Taylor', 'Unity', 'Vale', 'Winter', 'Xen', 'Yuki', 'Zen'];
    
  last_names TEXT[] := ARRAY['Anderson', 'Brown', 'Clark', 'Davis', 'Evans', 'Foster', 'Garcia', 'Harris', 
    'Johnson', 'King', 'Lee', 'Martinez', 'Nelson', 'O''Connor', 'Parker', 'Rodriguez', 'Smith', 'Taylor', 
    'Wilson', 'Young', 'Adams', 'Baker', 'Cooper', 'Edwards', 'Fisher', 'Green', 'Hall', 'Jackson', 
    'Lewis', 'Miller', 'Moore', 'Phillips', 'Roberts', 'Thompson', 'Turner', 'Walker', 'White', 'Wright'];
    
  -- Gender-specific profile pictures
  male_profile_pics TEXT[] := ARRAY[
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
    'https://images.unsplash.com/photo-1568602471122-7832951cc4c5',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    'https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6',
    'https://images.unsplash.com/photo-1519699047748-de8e457a634e',
    'https://images.unsplash.com/photo-1480455624313-e29b44bbfde1',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a',
    'https://images.unsplash.com/photo-1566492031773-4f4e44671d66'
  ];
  
  female_profile_pics TEXT[] := ARRAY[
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e',
    'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df',
    'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    'https://images.unsplash.com/photo-1517365830460-955ce3ccd263',
    'https://plus.unsplash.com/premium_photo-1690407617542-2f210cf20d7e',
    'https://images.unsplash.com/photo-1554780336-390462301acf',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956'
  ];
  
  nonbinary_profile_pics TEXT[] := ARRAY[
    'https://plus.unsplash.com/premium_photo-1689977807477-a579eda91fa2',
    'https://images.unsplash.com/photo-1463453091185-61582044d556',
    'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126',
    'https://images.unsplash.com/photo-1551836022-deb4988cc6c0',
    'https://images.unsplash.com/photo-1601455763557-db1bea8a9a5a',
    'https://images.unsplash.com/photo-1607746882042-944635dfe10e'
  ];
  
  -- Logical bio templates based on interests
  bio_templates TEXT[] := ARRAY[
    'Passionate %s enthusiast who loves %s. Looking for someone to share adventures with!',
    'When I''m not busy with %s, you''ll find me %s. Let''s explore the world together!',
    'Life is about %s and %s. Seeking genuine connections with like-minded people.',
    'Professional by day, %s lover by night. Also enjoy %s in my free time.',
    'Adventure seeker with a passion for %s and %s. Coffee dates or hiking trails?',
    'Creative soul who finds joy in %s and %s. Looking for my partner in crime!',
    'Fitness enthusiast who also loves %s and %s. Balance is key in life and love.',
    'Foodie and %s lover seeking someone who appreciates %s as much as I do.',
    'Bookworm and %s enthusiast. Perfect date: %s followed by deep conversations.',
    'Tech-savvy professional with a love for %s and %s. Let''s build something amazing together!'
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
  selected_first_names TEXT[];
  selected_profile_pics TEXT[];
  
  -- Gender-based interest preferences
  male_preferred_interests TEXT[] := ARRAY['fitness', 'sports', 'technology', 'gaming', 'hiking', 'photography'];
  female_preferred_interests TEXT[] := ARRAY['art', 'fashion', 'yoga', 'reading', 'dancing', 'cooking'];
  common_interests TEXT[] := ARRAY['travel', 'movies', 'music', 'food', 'photography', 'hiking'];
  
BEGIN
  RAISE NOTICE 'Starting to generate % test users', num_users;

  FOR i IN 1..num_users LOOP
    BEGIN
      -- Select random gender first
      random_gender := gender_options[1 + floor(random() * array_length(gender_options, 1))];
      
      -- Choose appropriate names and pictures based on gender
      IF random_gender = 'male' THEN
        selected_first_names := male_first_names;
        selected_profile_pics := male_profile_pics;
      ELSIF random_gender = 'female' THEN
        selected_first_names := female_first_names;
        selected_profile_pics := female_profile_pics;
      ELSE
        selected_first_names := nonbinary_first_names;
        selected_profile_pics := nonbinary_profile_pics;
      END IF;
      
      -- Generate logical names
      random_first := selected_first_names[1 + floor(random() * array_length(selected_first_names, 1))];
      random_last := last_names[1 + floor(random() * array_length(last_names, 1))];
      username := lower(random_first || random_last || floor(random() * 100)::TEXT);
      first_name := random_first;
      last_name := random_last;
      email := lower(random_first || '.' || random_last || floor(random() * 1000)::TEXT || '@example.com');
      
      -- Logical sexual preference based on gender (with some randomness)
      IF random_gender = 'male' THEN
        IF random() < 0.85 THEN
          random_sexual_pref := 'heterosexual';
        ELSIF random() < 0.95 THEN
          random_sexual_pref := 'homosexual';
        ELSE
          random_sexual_pref := 'bisexual';
        END IF;
      ELSIF random_gender = 'female' THEN
        IF random() < 0.80 THEN
          random_sexual_pref := 'heterosexual';
        ELSIF random() < 0.90 THEN
          random_sexual_pref := 'homosexual';
        ELSE
          random_sexual_pref := 'bisexual';
        END IF;
      ELSE
        -- Non-binary users more likely to be bisexual or other
        IF random() < 0.50 THEN
          random_sexual_pref := 'bisexual';
        ELSIF random() < 0.70 THEN
          random_sexual_pref := 'other';
        ELSIF random() < 0.85 THEN
          random_sexual_pref := 'heterosexual';
        ELSE
          random_sexual_pref := 'homosexual';
        END IF;
      END IF;
      
      -- Generate realistic age between 18 and 55
      random_age := 18 + floor(random() * 37);
      
      -- Calculate date of birth based on age
      random_dob := CURRENT_DATE - (random_age * INTERVAL '1 year') - (floor(random() * 365) * INTERVAL '1 day');
      
      -- Generate logical interests based on gender and age
      user_interests := ARRAY[]::TEXT[];
      num_interests := 3 + floor(random() * 3); -- 3-5 interests
      
      -- Add some gender-preferred interests (30% chance each)
      IF random_gender = 'male' THEN
        FOR j IN 1..array_length(male_preferred_interests, 1) LOOP
          IF random() < 0.3 THEN
            user_interests := array_append(user_interests, male_preferred_interests[j]);
          END IF;
        END LOOP;
      ELSIF random_gender = 'female' THEN
        FOR j IN 1..array_length(female_preferred_interests, 1) LOOP
          IF random() < 0.3 THEN
            user_interests := array_append(user_interests, female_preferred_interests[j]);
          END IF;
        END LOOP;
      END IF;
      
      -- Add common interests to reach desired count
      WHILE array_length(user_interests, 1) < num_interests LOOP
        user_interests := array_append(user_interests, 
          CASE 
            WHEN random() < 0.7 THEN common_interests[1 + floor(random() * array_length(common_interests, 1))]
            ELSE interests_all[1 + floor(random() * array_length(interests_all, 1))]
          END
        );
      END LOOP;
      
      -- Remove duplicates and trim to desired length
      user_interests := ARRAY(SELECT DISTINCT unnest(user_interests) LIMIT num_interests);
      
      -- Select random city and coordinates with slight randomization
      random_city := 1 + floor(random() * array_length(cities, 1));
      random_lat := city_coords[random_city][1] + (random() * 0.1 - 0.05);
      random_lng := city_coords[random_city][2] + (random() * 0.1 - 0.05);
      
      -- Select appropriate profile picture
      pic_index := 1 + floor(random() * array_length(selected_profile_pics, 1));
      profile_pic := selected_profile_pics[pic_index];
      
      -- Create logical bio based on interests
      IF array_length(user_interests, 1) >= 2 THEN
        interest1 := user_interests[1];
        interest2 := user_interests[2];
      ELSE
        interest1 := user_interests[1];
        interest2 := 'meeting new people';
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
        '$2b$12$ZasZYPAD8w0hauYrEziYcumcMy5DWadtS/voVz0XJGMjpLgWWXQdm',
        random_gender::gender_type, 
        random_sexual_pref::sexual_orientation,
        user_interests,
        profile_pic,
        CASE 
          WHEN random_age BETWEEN 18 AND 25 THEN 20 + floor(random() * 40)::INTEGER
          WHEN random_age BETWEEN 26 AND 35 THEN 40 + floor(random() * 40)::INTEGER
          ELSE 60 + floor(random() * 40)::INTEGER
        END, -- Age-based fame rating
        cities[random_city],
        random_lat,
        random_lng,
        random_age,
        random_dob,
        random_bio,
        random() < 0.8 -- 80% verified
      ) RETURNING id INTO user_id;
      
      RAISE NOTICE 'Created user %: % % (%)', i, first_name, last_name, random_gender;
      
      -- Insert logical user preferences
      INSERT INTO "user_preferences" (
        "user_id", "min_age", "max_age", "min_fame_rating", "max_fame_rating", 
        "preferred_distance", "preferred_tags"
      ) VALUES (
        user_id,
        GREATEST(18, random_age - 8),
        LEAST(55, random_age + 10),
        GREATEST(0, (SELECT fame_rating FROM users WHERE id = user_id) - 30),
        100,
        CASE 
          WHEN random_age BETWEEN 18 AND 25 THEN 25 + floor(random() * 25)::INTEGER
          WHEN random_age BETWEEN 26 AND 35 THEN 15 + floor(random() * 35)::INTEGER
          ELSE 10 + floor(random() * 40)::INTEGER
        END, -- Age-based distance preference
        user_interests
      );
      
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error creating user %: %', i, SQLERRM;
    END;
  END LOOP;

  RAISE NOTICE 'Finished generating users, now creating interactions';

  BEGIN
    PERFORM generate_random_interactions(num_users / 10);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Error generating interactions: %', SQLERRM;
  END;
  
  RAISE NOTICE 'Completed user generation process';
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

-- Create trigger to automatically update age when date_of_birth changes
CREATE OR REPLACE FUNCTION update_age_from_dob() RETURNS TRIGGER AS $$
BEGIN
    NEW.age = EXTRACT(YEAR FROM AGE(NOW(), NEW.date_of_birth));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_age
    BEFORE INSERT OR UPDATE OF date_of_birth ON users
    FOR EACH ROW
    WHEN (NEW.date_of_birth IS NOT NULL)
    EXECUTE FUNCTION update_age_from_dob();
