import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def check_connection():
    db_url = os.getenv('DATABASE_URL')
    
    if not db_url:
        print("❌ Error: DATABASE_URL not found in .env file.")
        print("Please ensure you have created a .env file in the backend directory.")
        return

    print(f"Connecting to: {db_url.split('@')[-1]}") # Print host/db only for security
    
    try:
        # Create engine
        engine = create_engine(db_url)
        
        # Connect and execute a simple query
        with engine.connect() as connection:
            result = connection.execute(text("SELECT version();"))
            version = result.fetchone()
            print("✅ Connection Successful!")
            print(f"PostgreSQL Version: {version[0]}")
            
            # List tables to verify schema
            print("\nExisting Tables:")
            tables_query = text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name;
            """)
            tables = connection.execute(tables_query).fetchall()
            if tables:
                for table in tables:
                    print(f" - {table[0]}")
            else:
                print(" - No tables found. Did you run the schema.sql?")

    except Exception as e:
        print("❌ Connection Failed!")
        print(f"Error: {str(e)}")
        print("\nTroubleshooting tips:")
        print("1. Ensure PostgreSQL service is running.")
        print("2. Check if the database 'parking_system' exists.")
        print("3. Verify username and password in .env.")
        print("4. Ensure 'psycopg2-binary' is installed.")

if __name__ == "__main__":
    check_connection()
Line: 1
