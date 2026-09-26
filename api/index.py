"""
api/index.py — Vercel Serverless Function entry point.
Exposes the unified TEAM LEGENDS BANK (TLB) FastAPI application for Vercel.
"""

import os
import sys

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from app.server import app
