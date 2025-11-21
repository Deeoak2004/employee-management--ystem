from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50))
    email = Column(String(50), unique=True, index=True)
    password = Column(String(100))
    role = Column(String(20))  

    tasks = relationship("Task", back_populates="assigned_user")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100))
    description = Column(String(255))
    status = Column(String(20))  
    assigned_to = Column(Integer, ForeignKey("users.id"))
    comment = Column(String(255), nullable=True)

    assigned_user = relationship("User", back_populates="tasks")