"""
api/admin/applications.py
GET /api/admin/applications

Returns all loan applications for underwriters/admins.
Protected: requires role = underwriter or admin.
Supports filtering by status and pagination.
"""

from fastapi import APIRouter, Request, HTTPException, Query
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from lib.firebase_admin_auth import verify_firebase_token
from lib.db import get_db

router = APIRouter()


@router.get("/api/admin/applications")
def list_all_applications(
    request: Request,
    status: str = Query(default=None, description="Filter by status: SUBMITTED|UNDER_REVIEW|APPROVED|DECLINED|CONDITIONAL"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100)
):
    """List all loan applications — underwriter/admin only."""
    decoded = verify_firebase_token(request)
    firebase_uid = decoded["uid"]

    db = get_db()

    # Verify role
    user_res = db.table("users").select("role").eq("firebase_uid", firebase_uid).execute()
    if not user_res.data:
        raise HTTPException(status_code=403, detail="User not found.")
    role = user_res.data[0].get("role", "applicant")
    if role not in ("underwriter", "admin"):
        raise HTTPException(status_code=403, detail="Access denied. Underwriter role required.")

    offset = (page - 1) * page_size

    query = (
        db.table("loan_applications")
        .select(
            "application_ref, applicant_name, applicant_age, pan_number, account_no, "
            "working_sector_label, monthly_income, loan_amount_requested, loan_tenor_months, "
            "loan_purpose, status, decision, underwriting_tier, cibil_score, dti_ratio, "
            "qsvm_prediction, risk_index, approved_rate, approved_emi, sanctioned_amount, "
            "submitted_at, decided_at, reviewed_by, reasons"
        )
        .order("submitted_at", desc=True)
        .range(offset, offset + page_size - 1)
    )

    if status:
        query = query.eq("status", status.upper())

    result = query.execute()

    # Count total
    count_query = db.table("loan_applications").select("id", count="exact")
    if status:
        count_query = count_query.eq("status", status.upper())
    count_result = count_query.execute()
    total = count_result.count or 0

    return {
        "status": "ok",
        "applications": result.data or [],
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": max(1, -(-total // page_size))
        }
    }
