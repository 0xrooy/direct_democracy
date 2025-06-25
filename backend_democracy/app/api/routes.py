from fastapi import APIRouter
from app.api import user_routes, vote_routes, proposal_routes

router=APIRouter()
router.include_router(user_routes.router, prefix="/users", tags=["Users"])
router.include_router(vote_routes.router, prefix="/votes", tags=["Votes"])
router.include_router(proposal_routes.router, prefix="/proposal", tags=["Proposals"])