from fastapi import APIRouter, Depends
from app.auth.auth_utils import get_current_user

router = APIRouter()

@router.get("/protected")
def protected_route(user: dict = Depends(get_current_user)):
    return {"message": f"Hello {user['sub']}"}
