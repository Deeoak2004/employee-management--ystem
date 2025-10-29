from sqlalchemy import create_engine
from urllib.parse import quote_plus
from sqlalchemy.ext.declarative import declarative_base  
from sqlalchemy.orm import sessionmaker 

password = quote_plus("Deepak@2004")  
SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://root:{password}@localhost:3306/task_management" 

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True, 
    pool_recycle=3600
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) 
Base = declarative_base() 

def get_db():
    db = SessionLocal()
    try:
        print("Database connected successfully") 
        yield db 
    finally: 
        db.close()