"""
main.py — NovaCart Account Dashboard API

Built with FastAPI. Auto-generated docs at: http://localhost:8000/docs

Endpoints:
  GET /health                                  — service health check
  GET /authorize                               — SPCS OAuth flow
  GET /franchise/{id}/summary                  — overview stats
  GET /franchise/{id}/orders                   — monthly order volume and revenue
  GET /franchise/{id}/products                 — top products by revenue
  GET /franchise/{id}/customers                — top customers by revenue
  GET /franchise/{id}/countries                — revenue by country (city/state for US data)

Data schema (from the DE capstone Gold layer):
  fact_orders:   order_id, customer_id, product_id, order_date, amount, currency, status, quantity, date_key
  dim_customer:  customer_id, name, email, addr_city, addr_state, valid_from, valid_to, is_current
  dim_product:   product_id, name, category, price
  dim_date:      date_key, year, quarter, month, month_name, day_of_week

Route implementations live under routers/ (one file per endpoint).
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import config
from routers import health, auth
from routers.franchise import router as franchise_router

# ── App setup ─────────────────────────────────────────────────────────────────

app = FastAPI(
    title="NovaCart Account Dashboard API",
    description=(
        "REST API for the NovaCart account manager dashboard. "
        "Built on top of the Gold data layer produced by the Data Engineering team."
    ),
    version="1.0.0",
)

# CORS — only needed for local development
# In SPCS, the NGINX router handles routing so CORS is not required
if config.CLIENT_VALIDATION == "Dev":
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://localhost:3001"],
        allow_methods=["GET"],
        allow_headers=["*"],
    )

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(franchise_router)


# ── Startup log ───────────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup():
    print("\nStarting NovaCart Dashboard API")
    print(f"Port:            {config.PORT}")
    print(f"Data backend:    {config.DATA_BACKEND}")
    print(f"Validation mode: {config.CLIENT_VALIDATION}")
    print(f"Docs:            http://localhost:{config.PORT}/docs\n")
