from sqlalchemy.orm import Session
from . import models, schemas
from .auth import hash_password  
from fastapi import HTTPException

def create_user(db: Session, user: schemas.UserCreate):
    
    db_user = models.User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password),  
        role=user.role
    )
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="User with this email already exists")

def get_users(db: Session, skip=0, limit=10):
    
    return db.query(models.User).offset(skip).limit(limit).all()

def get_user(db: Session, user_id: int):
       
    return db.query(models.User).filter(models.User.id == user_id).first()


def update_user(db: Session, user_id: int, user: schemas.UserUpdate):
  
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        db_user.name = user.name
        db_user.email = user.email
        db_user.role = user.role
        if user.password:
            db_user.password = hash_password(user.password)  
        db.commit()
        db.refresh(db_user)
    return db_user


def delete_user(db: Session, user_id: int):
    

    
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        db.delete(db_user)
        db.commit()
    return db_user



def create_task(db: Session, task: schemas.TaskCreate):
    user = db.query(models.User).filter(models.User.id == task.assigned_to).first()
    if not user:
        raise HTTPException(status_code=400, detail="Assigned user not exixt")
    
    db_task = models.Task(**task.dict())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def get_tasks(db: Session, current_user: models.User):
    if current_user.role == "Admin":
        return db.query(models.Task).all()  # Admin → sab tasks
    else:
        return db.query(models.Task).filter(models.Task.assigned_to == current_user.id).all()  # Employee → assigned tasks




def update_task(db: Session, task_id: int, task: schemas.TaskUpdate):
          
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if db_task:
        for key, value in task.dict().items():
            setattr(db_task, key, value)
        db.commit()
        db.refresh(db_task)
    return db_task

def delete_task(db: Session, task_id: int):
    
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if db_task:
        db.delete(db_task)
        db.commit()
        return db_task