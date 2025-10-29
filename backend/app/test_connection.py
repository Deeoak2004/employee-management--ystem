# test_connection.py
from database import engine
from sqlalchemy import text

def test_connection():
    try:
        # Try to connect
        with engine.connect() as connection:
            print("✅ Database connection successful!")
            
            # Run a simple query
            result = connection.execute(text("SELECT DATABASE();"))
            db_name = result.scalar()  # get single value
            print("Connected to database:", db_name)

    except Exception as e:
        print("❌ Database connection failed!")
        print("Error:", str(e))

if __name__ == "__main__":
    test_connection()
