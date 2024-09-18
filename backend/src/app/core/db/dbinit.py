from ..config import (
    AppSettings,
    EnvironmentSettings,
    EnvironmentOption,
    settings,
)
from psycopg2 import sql
import psycopg2

from ..logger import logging
logger = logging.getLogger(__name__)

createTableUserQuery = f"""
DROP TABLE IF EXISTS "USER" CASCADE; 
CREATE TABLE IF NOT EXISTS "USER" (
  "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "username" VARCHAR(255) NOT NULL,
  "first_name" VARCHAR(255),
  "last_name" VARCHAR(255),
  "email" VARCHAR(255) UNIQUE,
  "password" VARCHAR(255),
  "gender" VARCHAR(255),
  "sexual_preferences" TEXT,
  "interests" TEXT[],
  "pictures" TEXT,
  "fame_rating" NUMERIC,
  "location" VARCHAR(255),
  "latitude" NUMERIC,
  "address" VARCHAR(255),
  "age" NUMERIC,
  "bio" TEXT,
  "is_verified" BOOLEAN DEFAULT FALSE,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "reset_password_expires" TIMESTAMP,
  "reset_password_token" TEXT DEFAULT ''
)"""

createTableViewQuery = f"""
CREATE TABLE IF NOT EXISTS "user_views" (
  "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "viewer_id" UUID,
  "viewed_id" UUID,
  "view_time" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_viewer_id FOREIGN KEY ("viewer_id") REFERENCES "USER" ("id"),
  CONSTRAINT fk_viewed_id FOREIGN KEY ("viewed_id") REFERENCES "USER" ("id")
);"""

createTableLikesQuery = f"""
CREATE TABLE IF NOT EXISTS "user_likes" (
  "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "liker_id" UUID,
  "liked_id" UUID,
  "like_time" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_liker_id FOREIGN KEY ("liker_id") REFERENCES "USER" ("id"),
  CONSTRAINT fk_liked_id FOREIGN KEY ("liked_id") REFERENCES "USER" ("id")
);
"""


createTableMessageQuery = f"""
CREATE TABLE IF NOT EXISTS "Message" (
  "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "sender_id" UUID,
  "receiver_id" UUID,
  "time" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "content" TEXT,
  CONSTRAINT fk_sender_id FOREIGN KEY ("sender_id") REFERENCES "USER" ("id"),
  CONSTRAINT fk_receiver_id FOREIGN KEY ("receiver_id") REFERENCES "USER" ("id")
);
"""
def init_db(settings: (AppSettings | EnvironmentSettings)) -> None:
    DATABASE_URL = f"dbname={settings.POSTGRES_DB} user={settings.POSTGRES_USER} password={settings.POSTGRES_PASSWORD} host={settings.POSTGRES_SERVER} port={settings.POSTGRES_PORT}"
    conn = None
    try:
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = True
        cursor = conn.cursor()

        cursor.execute(
            sql.SQL("SELECT 1 FROM pg_database WHERE datname = %s"), [settings.POSTGRES_DB]
        )
        db_exists = cursor.fetchone()

        if not db_exists:
            cursor.execute(sql.SQL(f"CREATE DATABASE {settings.POSTGRES_DB}"))
            logger.info(f"Database '{settings.POSTGRES_DB}' created successfully.")
        else:
            logger.info(f"Database '{settings.POSTGRES_DB}' already exists.")
        
        cursor.execute(sql.SQL("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\""))

        # Function to check if a table exists
        def table_exists(table_name: str) -> bool:
            cursor.execute(sql.SQL("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = %s
                );
            """), [table_name])
            return cursor.fetchone()[0]

        # Check if USER table exists before creating
        if not table_exists("USER"):
            try:
                cursor.execute(createTableUserQuery)
                logger.info("USER table created successfully.")
            except Exception as e:
                logger.error(f"Error creating USER table: {e}")
        else:
            logger.info("USER table already exists.")

        other_table_queries = {
            "user_views": createTableViewQuery,
            "user_likes": createTableLikesQuery,
            "Message": createTableMessageQuery,
        }

        for table_name, query in other_table_queries.items():
            if not table_exists(table_name):
                try:
                    cursor.execute(query)
                    logger.info(f"Table '{table_name}' created successfully.")
                except Exception as e:
                    logger.error(f"Error creating table '{table_name}': {e}")
            else:
                logger.info(f"Table '{table_name}' already exists.")

    except Exception as e:
        logger.error(f"Error during database check or creation: {e}")

    finally:
        if conn:
            if cursor:
                cursor.close()
            conn.close()


from databases import Database

db_conn_string = f"postgresql+asyncpg://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}@{settings.POSTGRES_SERVER}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}"


database = Database(db_conn_string, min_size=5, max_size=20)