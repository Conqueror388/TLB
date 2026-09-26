"""
api/my_applications.py
GET /api/my-applications

Returns all loan applications submitted by the authenticated user.
Applicants can only see their own applications.
"""

from fastapi import APIRouter, Request
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from lib.firebase_admin_auth import verify_firebase_token
from lib.db import get_db

router = APIRouter()


@router.get("/api/my-applications")
def my_applications(request: Request):
    """List all loan applications for the current authenticated user."""
    decoded = verify_firebase_token(request)
    firebase_uid = decoded["uid"]

    db = get_db()

    # Get user record
    user_res = db.table("users").select("id").eq("firebase_uid", firebase_uid).execute()
    if not user_res.data:
        return {"status": "ok", "applications": [], "count": 0}

    user_id = user_res.data[0]["id"]

    # Fetch their applications ordered newest first
    apps_res = (
        db.table("loan_applications")
        .select(
            "application_ref, applicant_name, loan_amount_requested, loan_tenor_months, "
            "loan_purpose, status, decision, underwriting_tier, cibil_score, "
            "approved_rate, approved_emi, sanctioned_amount, submitted_at, decided_at"
        )
        .eq("user_id", user_id)
        .order("submitted_at", desc=True)
        .execute()
    )

    return {
        "status": "ok",
        "applications": apps_res.data or [],
        "count": len(apps_res.data or [])
    }
