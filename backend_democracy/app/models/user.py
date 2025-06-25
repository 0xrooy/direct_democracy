from pydantic import BaseModel, EmailStr
from bson import ObjectId
from typing import Optional

def str_to_objectid(id: str)-> ObjectId:
    return ObjectId(id)

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

    class Config:
        orm_mode=True

class UserLogin(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    id:str
    email:EmailStr
    username:str

    class Config:
        orm_mode=True

class UserInDB(UserOut):
    hashed_password:str

    class Config:
        orm_mode=True



