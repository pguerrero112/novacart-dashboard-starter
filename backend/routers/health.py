"""
routers/health.py — GET /health

Service health check. Confirms the database connection is working.
Used by the frontend service status indicator.
"""

import time
from fastapi import APIRouter
from fastapi.responses import JSONResponse

import config
from connection import get_connection, execute_query

router = APIRouter(tags=["System"])


@router.get("/health")
def health():
    uptime = round(time.time() - config.START_TIME)
    try:
        conn    = get_connection()
        results = execute_query(conn, "SELECT 1 AS ping")
        assert len(results) > 0
    except Exception as e:
        return JSONResponse(status_code=503, content={
            "status":   "degraded",
            "uptime_s": uptime,
            "database": {"status": "error", "message": str(e)},
        })
    return {
        "status":   "healthy",
        "uptime_s": uptime,
        "backend":  config.DATA_BACKEND,
        "database": {"status": "connected"},
    }
