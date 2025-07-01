from fastapi import FastAPI
from app.api.protected import router as protected_router
from app.api.routes import router as main_router
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()



origins=["http://localhost:3000",
         "http://frontend:3000",
         "http://127.0.0.1:3000"]

app=FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(main_router)
app.include_router(protected_router, prefix="/api")
