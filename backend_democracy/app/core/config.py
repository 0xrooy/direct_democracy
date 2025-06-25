import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

SECRET_KEY=os.getenv("SECRET_KEY","super-secret-key")
ALGORITHM=os.getenv("ALGORITHM","HS256")
ACCESS_TOKEN_EXPIRE_MINUTES=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES",30))
MONGO_URL=os.getenv("MONGO_URI","mongodb://localhost:27017")
DB_NAME=os.getenv("DB_NAME","democracy_db")