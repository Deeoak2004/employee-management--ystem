

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import users, tasks
from .database import Base, engine
from app import auth


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Employee tasks management system"
)


origins = [
    "http://localhost:8081",  # Frontend ka URL
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   
    allow_credentials=True,
    allow_methods=["*"],   
    allow_headers=["*"],   
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(tasks.router)


@app.get("/")
def root():
    return{"message":"deepak"}