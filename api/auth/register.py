"""
api/auth/register.py
POST /api/auth/register

Called after Firebase client-side createUserWithEmailAndPassword succeeds.
Verifies the Firebase ID token and upserts the user record in Supabase.
"""

from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, EmailStr
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from lib.firebase_admin_auth import verify_firebase_token
from lib.db import get_db, log_audit

router = APIRouter()


class RegisterPayload(BaseModel):
    full_name: str
    email: str
    phone: str = None


@router.post("/api/auth/register")
def register_user(payload: RegisterPayload, request: Request):
    """
    Verify Firebase token → upsert user in Supabase users table.
    Returns user profile including role.
    """
    decoded = verify_firebase_token(request)
    firebase_uid = decoded["uid"]
    email = decoded.get("email", payload.email)

    db = get_db()

    # Check if user already exists
    existing = db.table("users").select("*").eq("firebase_uid", firebase_uid).execute()
    if existing.data:
        user = existing.data[0]
        log_audit(firebase_uid, email, "LOGIN", metadata={"type": "re-register"})
        return {"status": "existing", "user": user}

    # Create new user
    new_user = {
        "firebase_uid": firebase_uid,
        "full_name": payload.full_name.strip(),
        "email": email,
        "phone": payload.phone,
        "email_verified": decoded.get("email_verified", False),
        "role": "applicant"
    }

    result = db.table("users").insert(new_user).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create user record.")

    user = result.data[0]
    log_audit(firebase_uid, email, "REGISTER",
              metadata={"name": payload.full_name},
              ip_address=request.client.host if request.client else None,
              user_agent=request.headers.get("User-Agent"))

    return {"status": "created", "user": user}
