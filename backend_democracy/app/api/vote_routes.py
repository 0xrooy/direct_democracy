from fastapi import APIRouter, HTTPException, Depends
from app.models.vote import VoteCreate, VoteOut
from app.auth.auth_utils import get_current_user
from app.db.mongo import db
from app.services.logic import has_user_voted  # 🔁 new import

from bson import ObjectId

router = APIRouter()

@router.post("/", response_model=VoteOut)
async def cast_vote(vote: VoteCreate, user: dict = Depends(get_current_user)):
    user_id = str(user["_id"])
    proposal_id = vote.proposal_id

    if await has_user_voted(db, user_id, proposal_id):
        raise HTTPException(status_code=400, detail="You have already voted on this proposal")

    vote_doc = {
        "proposal_id": proposal_id,
        "user_id": user_id,
        "vote": vote.vote
    }

    result = await db.votes.insert_one(vote_doc)

    return VoteOut(
        id=str(result.inserted_id),
        proposal_id=proposal_id,
        user_id=user_id,
        vote=vote.vote
    )
