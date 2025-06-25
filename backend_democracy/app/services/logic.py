from datetime import datetime
from bson import ObjectId

# Check if user already voted
async def has_user_voted(db, user_id: str, proposal_id: str) -> bool:
    vote = await db.votes.find_one({
        "proposal_id": proposal_id,
        "user_id": user_id
    })
    return vote is not None

# Count vote results for a proposal
async def get_vote_counts(db, proposal_id: str) -> dict:
    pipeline = [
        {"$match": {"proposal_id": proposal_id}},
        {"$group": {"_id": "$vote", "count": {"$sum": 1}}}
    ]
    results = await db.votes.aggregate(pipeline).to_list(None)
    return {res["_id"]: res["count"] for res in results}

# Check if voting is open
def is_voting_open(proposal: dict) -> bool:
    now = datetime.utcnow()
    return proposal["start_time"] <= now <= proposal["end_time"]
