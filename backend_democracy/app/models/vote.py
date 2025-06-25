from pydantic import BaseModel
from typing import Literal
from bson import ObjectId

class VoteCreate(BaseModel):
    proposal_id: str 
    vote: Literal["yes", "no", "abstain"]

    class Config:
        orm_mode = True

class VoteOut(BaseModel):
    id: str
    proposal_id: str
    user_id: str
    vote: str

    class Config:
        orm_mode = True
