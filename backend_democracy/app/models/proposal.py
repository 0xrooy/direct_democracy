from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ProposalBase(BaseModel):
    title: str
    description: str
    federal_constituencies: List[str] = Field(default_factory=list, alias="stateConstituencies")
    state_constituencies: List[str] = Field(default_factory=list, alias="federalConstituencies")
    signature_urls: List[str] = Field(default_factory=list)  # these are file paths

    class Config:
        validated_by_name=True
        populate_by_name=True
        

class ProposalCreate(ProposalBase):
    pass  # this is fine for now

class ProposalInDB(ProposalBase):
    id: str
    created_by: str
    signatures_count: int = 0
    status: str = "draft"
    signed_by: List[str] = Field(default_factory=list)
    created_at: Optional[datetime] = None
    votes_yes: int=0
    votes_no: int=0

class ProposalOut(ProposalInDB):
    class Config:
        from_attributes = True 

class VotePayload(BaseModel):
    vote: str
