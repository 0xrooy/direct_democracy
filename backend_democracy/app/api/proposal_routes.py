from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.responses import FileResponse
from typing import List
from app.models.proposal import ProposalCreate, ProposalOut, VotePayload
from app.db.mongo import db
from bson import ObjectId
from uuid import uuid4
from datetime import datetime
import os
import mimetypes
from fastapi import Request, security
from app.fhe.utils import encrypt_vote, load_circuit,encode_cipher,decode_cipher,decrypt_result
import base64
from app.auth.auth_utils import get_admin_user, get_current_user


router = APIRouter()

UPLOAD_DIR = "private_uploads/signatures"
os.makedirs(UPLOAD_DIR, exist_ok=True)

SIGNATURE_THRESHOLD = int(os.getenv("SIGNATURE_THRESHOLD", 3))


def serialize_proposal(p):
    p["id"] = str(p["_id"])
    
    p.setdefault("stateConstituencies", [])
    p.setdefault("federalConstituencies", [])
    p.setdefault("signature_files", [])
    p.setdefault("signed_by", [])

    p["state_constituencies"] = p.get("stateConstituencies", [])
    p["federal_constituencies"] = p.get("federalConstituencies", [])
    p["signature_urls"] = [f['filename'] for f in p.get("signature_files", [])]

    p["votes_yes"]=p.get("votes_yes",0)
    p["votes_no"]=p.get("votes_no",0)

    del p["_id"]
    return p



@router.post("/", response_model=ProposalOut)
async def create_proposal(
    title: str = Form(...),
    description: str = Form(...),
    stateConstituencies: List[str] = Form(...),
    federalConstituencies: List[str] = Form(...),
    signature: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    allowed_types = ['image/png', 'image/jpeg', 'application/pdf']
    if signature.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type")

    signature.file.seek(0, 2)
    size = signature.file.tell()
    signature.file.seek(0)
    if size > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")

    filename = f"{uuid4()}.{signature.filename.split('.')[-1]}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(await signature.read())

    proposal_doc = {
        "title": title,
        "description": description,
        "stateConstituencies": stateConstituencies,
        "federalConstituencies": federalConstituencies,
        "signature_files": [{
            "filename": filename,
            "user_id": str(user["_id"]),
            "mime": signature.content_type,
            "original_name": signature.filename
        }],
        "signed_by": [str(user["_id"])],
        "signatures_count": 1,
        "status": "validated" if 1 >= SIGNATURE_THRESHOLD else "pending",
        "created_by": str(user["_id"]),
        "created_at": datetime.utcnow(),
        "votes_yes":0,
        "votes_no":0
    }

    try:
        result = await db.proposals.insert_one(proposal_doc)
        proposal_doc["_id"] = result.inserted_id
        return ProposalOut(**serialize_proposal(proposal_doc)).dict(by_alias=True)
    except Exception as e:
        if os.path.exists(filepath):
            os.remove(filepath)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/public")
async def list_public_proposals():
    query = {"status": {"$in": ["validated", "pending", "voting", "closed"]}}
    proposals = await db.proposals.find(query).to_list(100)
    return [
        ProposalOut(**serialize_proposal(p)).dict(by_alias=True)
        for p in proposals
    ]


@router.get("/mine")
async def list_my_proposals(user: dict = Depends(get_current_user)):
    proposals = await db.proposals.find({
        "created_by": str(user["_id"])
    }).to_list(100)
    return [
        ProposalOut(**serialize_proposal(p)).dict(by_alias=True)
        for p in proposals
    ]


@router.get("/{proposal_id}")
async def get_proposal(proposal_id: str):
    proposal = await db.proposals.find_one({"_id": ObjectId(proposal_id)})
    if not proposal:
        raise HTTPException(404, detail="Proposal not found")
    return ProposalOut(**serialize_proposal(proposal)).dict(by_alias=False) 


@router.post("/{proposal_id}/sign")
async def sign_proposal(
    request: Request,
    proposal_id: str,
    signature: UploadFile = File(...),
    user: dict = Depends(get_current_user)
    ):
    print(f"Received signature upload for proposal {proposal_id}")
    print(f"Signature filename: {signature.filename}")
    print(f"Signature content type: {signature.content_type}")
    
    

    proposal = await db.proposals.find_one({"_id": ObjectId(proposal_id)})
    if not proposal:
        raise HTTPException(404, detail="Proposal not found")

    user_id = str(user["_id"])
    if user_id in proposal.get("signed_by", []):
        raise HTTPException(400, detail="You have already signed this proposal.")

    if signature.content_type not in ['image/png', 'image/jpeg', 'application/pdf']:
        raise HTTPException(400, detail="Invalid file type")

    filename = f"{uuid4()}.{signature.filename.split('.')[-1]}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(await signature.read())

    signature_info = {
        "filename": filename,
        "user_id": user_id,
        "mime": signature.content_type,
        "original_name": signature.filename
    }

    updated_fields = {
        "$push": {
            "signature_files": signature_info,
            "signed_by": user_id
        }
    }

    new_signatures_count = len(proposal.get("signed_by", [])) + 1
    new_status = "validated" if new_signatures_count >= SIGNATURE_THRESHOLD else "pending"
    updated_fields["$set"] = {
        "signatures_count": new_signatures_count,
        "status": new_status
    }

    await db.proposals.update_one(
        {"_id": ObjectId(proposal_id)},
        updated_fields
    )

    updated = await db.proposals.find_one({"_id": ObjectId(proposal_id)})
    return ProposalOut(**serialize_proposal(updated)).dict(by_alias=True)


@router.get("/download/{filename}")
async def download_signature(filename: str, user: dict = Depends(get_current_user)):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(404, detail="File not found")

    mime_type, _ = mimetypes.guess_type(file_path)
    return FileResponse(file_path, media_type=mime_type, filename=filename)


@router.post("/{proposal_id}/vote")
async def vote_on_proposal(
    proposal_id: str,
    payload: VotePayload,
    user: dict = Depends(get_current_user)
    ):
    proposal = await db.proposals.find_one({"_id": ObjectId(proposal_id)})
    if not proposal:
        raise HTTPException(404, detail="Proposal not found")

    user_id = str(user["_id"])
    if proposal.get("status") != "validated":
        raise HTTPException(400, detail="Voting is not allowed on unvalidated proposals.")

    existing_votes = proposal.get("votes", [])
    if any(v["user_id"] == user_id for v in existing_votes):
        raise HTTPException(400, detail="You have already voted.")

    if payload.vote not in ["yes", "no"]:
        raise HTTPException(400, detail="Invalid vote option.")

    vote_doc = {
        "user_id": user_id,
        "vote": payload.vote,
        "voted_at": datetime.utcnow()
    }

    vote_bit=1 if payload.vote=="yes" else 0
    enc_vote=encrypt_vote(vote_bit)
    circuit=load_circuit()

    if "enc_tally" not in proposal:
        tally=enc_vote

    else:
        current_enc=decode_cipher(proposal["enc_tally"])
        new_tally=circuit.run(current_enc,enc_vote)

    encoded_tally=encode_cipher(new_tally)



    await db.proposals.update_one(
        {"_id": ObjectId(proposal_id)},
        {
            "$push":{"votes":vote_doc},
            "$set":{"enc_tally":encoded_tally}
        }
    )

    updated = await db.proposals.find_one({"_id": ObjectId(proposal_id)})
    return ProposalOut(**serialize_proposal(updated)).dict(by_alias=True)


@router.get("/{proposal_id}/result")
async def get_decrypted_result(proposal_id: str, admin:dict= Depends(get_admin_user)):
    proposal= await db.proposals.find_one({"_id":ObjectId(proposal_id)})
    if not proposal:
        raise HTTPException(404, detail="Proposal not found")
    
    if "enc_tally" not in proposal:
        raise HTTPException(400, detail="No encrypted tally available")
    
    ciphertext=decode_cipher(proposal["enc_tally"])
    result=decrypt_result(ciphertext)
    return {"yes_votes":int(result)}

