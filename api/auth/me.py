"""
api/auth/me.py
GET /api/auth/me

Returns the current authenticated user's profile + role from Supabase.
Used by frontend on page load to restore session state.
"""

from fastapi import APIRouter, Request, HTTPException
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from lib.firebase_admin_auth import verify_firebase_token
from lib.db import get_db

router = APIRouter()


@router.get("/api/auth/me")
def get_me(request: Request):
    """Return authenticated user profile including role."""
    decoded = verify_firebase_token(request)
    firebase_uid = decoded["uid"]

    db = get_db()
    result = db.table("users").select("*").eq("firebase_uid", firebase_uid).execute()

    if not result.data:
        raise HTTPException(
            status_code=404,
            detail="User profile not found. Please complete registration."
        )

    user = result.data[0]
    return {
        "status": "ok",
        "user": {
            "id": user["id"],
            "firebase_uid": user["firebase_uid"],
            "full_name": user["full_name"],
            "email": user["email"],
            "phone": user.get("phone"),
            "role": user["role"],
            "email_verified": user.get("email_verified", False),
            "pan_number": user.get("pan_number"),
            "account_no": user.get("account_no"),
            "created_at": user["created_at"]
        }
    }
