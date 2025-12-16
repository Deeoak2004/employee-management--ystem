from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import crud, schemas, database, models, auth
from typing import List
from ..auth import get_current_user

router = APIRouter(prefix="/tasks", tags=["Tasks"])
get_db = database.get_db

@router.post("/create-task", response_model=schemas.TaskOut)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    return crud.create_task(db, task)

@router.get("/get-tasks")
def list_tasks(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return crud.get_tasks(db, current_user)

@router.get("/get-task/{task_id}", response_model=schemas.TaskOut)
def get_task(task_id: int, db: Session = Depends(get_db)):
    return crud.get_task(db, task_id)

@router.put("/update-task/{task_id}", response_model=schemas.TaskOut)
def update_task(task_id: int, task: schemas.TaskUpdate, db: Session = Depends(get_db)):
    return crud.update_task(db, task_id, task)

@router.delete("/delete-task/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    
    return crud.delete_task(db, task_id)


@router.get("/task-status-count")
def get_task_status_count(db: Session = Depends(get_db)):
    pending = db.query(models.Task).filter(models.Task.status == "Pending").count()
    in_process = db.query(models.Task).filter(models.Task.status == "In-Process").count()
    completed = db.query(models.Task).filter(models.Task.status == "Completed").count()

    return {
        "pending": pending,
        "in_process": in_process,
        "completed": completed
    }