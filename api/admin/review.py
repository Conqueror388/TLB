"""
api/admin/review.py
POST /api/admin/review

Underwriter manually updates the decision for a loan application.
Protected: requires role = underwriter or admin.
Supports APPROVED, DECLINED, CONDITIONAL, UNDER_REVIEW decisions.
"""

from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from lib.firebase_admin_auth import verify_firebase_token
from lib.db import get_db, log_audit

router = APIRouter()

VALID_DECISIONS = {"APPROVED", "DECLINED", "CONDITIONAL", "UNDER_REVIEW"}


class ReviewPayload(BaseModel):
    application_ref: str
    decision: str
    notes: Optional[str] = None
    override_reasons: Optional[List[str]] = None


@router.post("/api/admin/review")
def review_application(payload: ReviewPayload, request: Request):
    """Underwriter updates decision for a specific loan application."""
    decoded = verify_firebase_token(request)
    firebase_uid = decoded["uid"]
    actor_email = decoded.get("email", "")

    if payload.decision.upper() not in VALID_DECISIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid decision. Must be one of: {', '.join(VALID_DECISIONS)}"
        )

    db = get_db()

    # Verify role
    user_res = db.table("users").select("id, role").eq("firebase_uid", firebase_uid).execute()
    if not user_res.data:
        raise HTTPException(status_code=403, detail="User not found.")
    user = user_res.data[0]
    if user["role"] not in ("underwriter", "admin"):
        raise HTTPException(status_code=403, detail="Access denied. Underwriter role required.")

    # Verify application exists
    app_res = (
        db.table("loan_applications")
        .select("id, application_ref, status")
        .eq("application_ref", payload.application_ref)
        .execute()
    )
    if not app_res.data:
        raise HTTPException(status_code=404, detail=f"Application {payload.application_ref} not found.")

    app = app_res.data[0]
    decision = payload.decision.upper()

    update_data = {
        "status": decision if decision != "UNDER_REVIEW" else "UNDER_REVIEW",
        "decision": decision if decision in ("APPROVED", "DECLINED", "CONDITIONAL") else None,
        "decided_at": datetime.now(timezone.utc).isoformat(),
        "reviewed_by": user["id"]
    }

    if payload.override_reasons:
        update_data["reasons"] = payload.override_reasons

    db.table("loan_applications").update(update_data).eq("id", app["id"]).execute()

    log_audit(
        actor_uid=firebase_uid,
        actor_email=actor_email,
        action=f"REVIEW_{decision}",
        target_ref=payload.application_ref,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("User-Agent"),
        metadata={"notes": payload.notes, "previous_status": app["status"]}
    )

    return {
        "status": "ok",
        "application_ref": payload.application_ref,
        "decision": decision,
        "reviewed_by": actor_email,
        "message": f"Application {payload.application_ref} updated to {decision}."
    }
