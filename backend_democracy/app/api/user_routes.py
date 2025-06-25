from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from app.models.user import UserCreate, UserOut, UserInDB, UserLogin
from app.db.mongo import db
from app.auth.auth_utils import get_password_hash, verify_password, create_access_token
from datetime import timedelta

from bson import ObjectId

router = APIRouter()


@router.post("/register", response_model=UserOut)
async def register_user(user: UserCreate):
   
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

   
    hashed_pw = get_password_hash(user.password)
    user_doc = {
        "email": user.email,
        "username": user.username,
        "hashed_password": hashed_pw,
    }
    result = await db.users.insert_one(user_doc)

    return UserOut(
        id=str(result.inserted_id),
        email=user.email,
        username=user.username
    )


@router.post("/login")
async def login_user(form_data:OAuth2PasswordRequestForm=Depends()):
    db_user=await db.users.find_one({"username":form_data.username})
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(form_data.password,db_user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    

    access_token=create_access_token(data={"sub":form_data.username, "id":str(db_user["_id"])}, expires_delta=timedelta(minutes=30))
    return {"access_token":access_token, "token_type":"bearer"}

