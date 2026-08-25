"""
routers/auth.py — GET /authorize

SPCS OAuth authorization endpoint.

When running inside SPCS, the platform injects the authenticated Snowflake
username in the Sf-Context-Current-User header. This endpoint reads that
header and returns the user's identity so the frontend can store it.

In Dev mode: returns a mock user for local development.
"""

from fastapi import APIRouter, HTTPException, Request

import config

router = APIRouter(tags=["Auth"])


@router.get("/authorize")
def authorize(request: Request):
    if config.CLIENT_VALIDATION == "Dev":
        return {"user": "dev_user", "status": "authorized"}

    username = request.headers.get("sf-context-current-user")
    if not username:
        raise HTTPException(status_code=422, detail="Missing Sf-Context-Current-User header")

    return {"user": username, "status": "authorized"}
