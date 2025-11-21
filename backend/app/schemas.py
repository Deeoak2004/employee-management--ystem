from pydantic import BaseModel
from typing import Optional
from  enum import Enum

class RoleEnum(str , Enum):
      Admin = "Admin"
      Employee = "Employee"



class UserBase(BaseModel):
    name: str
    email: str
    role: RoleEnum

class UserCreate(BaseModel):
    name:str
    email: str
    password: str
    role : RoleEnum
    

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    role: Optional[RoleEnum] = None

class UserOut(UserBase):
    id: int
    class Config:
        orm_mode = True



  
class TaskBase(BaseModel):
     title: str
     description: str
     status: str
     assigned_to: Optional[int] = None  
     comment: Optional[str] = None
class TaskCreate(TaskBase):
   pass




class TaskUpdate(BaseModel):
    title:Optional[str]= None
    description:Optional[str]= None
    status:Optional[str]= None
    assigned_to:Optional[int]= None
    comment:Optional[str]= None
    
class TaskOut(TaskBase):
    id: int
    class Config:
        orm_mode = True


class Login(BaseModel):
    email: str
 
    password:str