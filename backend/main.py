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

Your job: implement the TODO sections in each endpoint.
The connection and query helpers are already set up in connection.py.
"""

import os
import time
from datetime import datetime
from fastapi import FastAPI, HTTPException, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

from connection import get_connection, execute_query

load_dotenv()

# ── App setup ─────────────────────────────────────────────────────────────────

app = FastAPI(
    title="NovaCart Account Dashboard API",
    description=(
        "REST API for the NovaCart account manager dashboard. "
        "Built on top of the Gold data layer produced by the Data Engineering team."
    ),
    version="1.0.0",
)

PORT              = int(os.getenv("PORT", 8000))
CLIENT_VALIDATION = os.getenv("CLIENT_VALIDATION", "Dev")
START_TIME        = time.time()

# CORS — only needed for local development
# In SPCS, the NGINX router handles routing so CORS is not required
if CLIENT_VALIDATION == "Dev":
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://localhost:3001"],
        allow_methods=["GET"],
        allow_headers=["*"],
    )


# ── Startup log ───────────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup():
    print("\nStarting NovaCart Dashboard API")
    print(f"Port:            {PORT}")
    print(f"Data backend:    {os.getenv('DATA_BACKEND', 'sqlite')}")
    print(f"Validation mode: {CLIENT_VALIDATION}")
    print(f"Docs:            http://localhost:{PORT}/docs\n")


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/health", tags=["System"])
def health():
    """
    Returns service health and confirms the database connection is working.
    Used by the frontend service status indicator.
    """
    uptime = round(time.time() - START_TIME)
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
        "backend":  os.getenv("DATA_BACKEND", "sqlite"),
        "database": {"status": "connected"},
    }


# ── Auth ──────────────────────────────────────────────────────────────────────

@app.get("/authorize", tags=["Auth"])
def authorize(request: Request):
    """
    SPCS OAuth authorization endpoint.

    When running inside SPCS, the platform injects the authenticated Snowflake
    username in the Sf-Context-Current-User header. This endpoint reads that
    header and returns the user's identity so the frontend can store it.

    In Dev mode: returns a mock user for local development.
    """
    if CLIENT_VALIDATION == "Dev":
        return {"user": "dev_user", "status": "authorized"}

    username = request.headers.get("sf-context-current-user")
    if not username:
        raise HTTPException(status_code=422, detail="Missing Sf-Context-Current-User header")

    return {"user": username, "status": "authorized"}


# ── Validation helpers ────────────────────────────────────────────────────────

def validate_date_range(start: str, end: str):
    """
    Validate that start date is before or equal to end date.
    Raises HTTPException(422) if validation fails.
    """
    try:
        start_dt = datetime.strptime(start, '%Y-%m-%d')
        end_dt = datetime.strptime(end, '%Y-%m-%d')
        if start_dt > end_dt:
            raise HTTPException(
                status_code=422,
                detail="Start date must be before or equal to end date"
            )
    except ValueError:
        raise HTTPException(
            status_code=422,
            detail="Invalid date format. Use YYYY-MM-DD"
        )


# ── Franchise endpoints ───────────────────────────────────────────────────────

@app.get("/franchise/summary", tags=["Franchise"])
def get_summary():
    """
    Returns an overview of all orders in the database:
    - Total revenue (delivered + shipped orders only)
    - Total orders
    - Number of unique customers
    - Date range of available data

    Expected response:
    {
        "total_revenue": 1284750.00,
        "total_orders": 8432,
        "unique_customers": 380,
        "date_range": { "start": "2022-01-01", "end": "2022-12-31" }
    }

    TODO: implement this endpoint.
    Hints:
      - Use fact_orders table
      - Filter status IN ('delivered', 'shipped') for revenue
      - Use MIN/MAX of order_date for date_range
    """
    try:
        conn = get_connection()
        results = execute_query(conn, """
            SELECT
                COUNT(DISTINCT order_id)    AS total_orders,
                SUM(amount)                 AS total_revenue,
                COUNT(DISTINCT customer_id) AS unique_customers,
                MIN(order_date)             AS start_date,
                MAX(order_date)             AS end_date
            FROM fact_orders
            WHERE status IN ('delivered', 'shipped')
        """)

        row = results[0]
        return {
            "total_revenue":     round(row["total_revenue"] or 0, 2),
            "total_orders":      row["total_orders"],
            "unique_customers":  row["unique_customers"],
            "date_range": {"start": row["start_date"], "end": row["end_date"]},
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/franchise/orders", tags=["Franchise"])
def get_orders(
    start: str = Query(
        default="2022-01-01",
        regex=r'^\d{4}-\d{2}-\d{2}$',
        description="Start date in YYYY-MM-DD format"
    ),
    end: str = Query(
        default="2022-12-31",
        regex=r'^\d{4}-\d{2}-\d{2}$',
        description="End date in YYYY-MM-DD format"
    )
):
    """
    Returns monthly order volume and revenue for the given date range.
    Used to power the orders overview chart.

    Query parameters:
      start: start date (YYYY-MM-DD)
      end:   end date (YYYY-MM-DD)

    Expected response:
    [
        { "month": "2022-01", "month_name": "January", "order_count": 842, "revenue": 128450.00 },
        { "month": "2022-02", "month_name": "February", "order_count": 910, "revenue": 141230.00 }
    ]
    """
    validate_date_range(start, end)
    try:
        conn = get_connection()
        results = execute_query(conn, """
            SELECT
                printf('%04d-%02d', d.year, d.month) AS month,
                d.month_name,
                COUNT(DISTINCT o.order_id) AS order_count,
                SUM(o.amount) AS revenue
            FROM fact_orders o
            JOIN dim_date d ON o.date_key = d.date_key
            WHERE o.status IN ('delivered', 'shipped')
              AND o.order_date BETWEEN ? AND ?
            GROUP BY d.year, d.month, d.month_name
            ORDER BY d.year, d.month
        """, (start, end))

        # Format response with proper types
        return [
            {
                "month": row["month"],
                "month_name": row["month_name"],
                "order_count": row["order_count"],
                "revenue": round(row["revenue"], 2)
            }
            for row in results
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/franchise/products", tags=["Franchise"])
def get_products(
    start: str = Query(
        default="2022-01-01",
        regex=r'^\d{4}-\d{2}-\d{2}$',
        description="Start date in YYYY-MM-DD format"
    ),
    end: str = Query(
        default="2022-12-31",
        regex=r'^\d{4}-\d{2}-\d{2}$',
        description="End date in YYYY-MM-DD format"
    )
):
    """
    Returns the top 10 products by revenue for the given date range.

    Expected response:
    [
        { "product_id": "P001", "name": "Wireless Headphones", "category": "Electronics",
          "units_sold": 342, "revenue": 30578.58 }
    ]
    """
    validate_date_range(start, end)
    try:
        conn = get_connection()
        results = execute_query(conn, """
            SELECT
                p.product_id,
                p.name,
                p.category,
                SUM(o.quantity) AS units_sold,
                SUM(o.amount) AS revenue
            FROM fact_orders o
            JOIN dim_product p ON o.product_id = p.product_id
            WHERE o.status IN ('delivered', 'shipped')
              AND o.order_date BETWEEN ? AND ?
            GROUP BY p.product_id, p.name, p.category
            ORDER BY revenue DESC
            LIMIT 10
        """, (start, end))

        # Format response with proper types
        return [
            {
                "product_id": row["product_id"],
                "name": row["name"],
                "category": row["category"],
                "units_sold": row["units_sold"],
                "revenue": round(row["revenue"], 2)
            }
            for row in results
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/franchise/customers", tags=["Franchise"])
def get_customers(
    start: str = Query(
        default="2022-01-01",
        regex=r'^\d{4}-\d{2}-\d{2}$',
        description="Start date in YYYY-MM-DD format"
    ),
    end: str = Query(
        default="2022-12-31",
        regex=r'^\d{4}-\d{2}-\d{2}$',
        description="End date in YYYY-MM-DD format"
    )
):
    """
    Returns the top 20 customers by revenue for the given date range.

    Expected response:
    [
        { "customer_id": "C001", "name": "Alice Johnson", "city": "Austin",
          "state": "TX", "total_orders": 14, "total_spent": 1240.50 }
    ]
    """
    validate_date_range(start, end)
    try:
        conn = get_connection()
        results = execute_query(conn, """
            SELECT
                c.customer_id,
                c.name,
                c.addr_city AS city,
                c.addr_state AS state,
                COUNT(DISTINCT o.order_id) AS total_orders,
                SUM(o.amount) AS total_spent
            FROM fact_orders o
            JOIN dim_customer c ON o.customer_id = c.customer_id
            WHERE c.is_current = 1
              AND o.status IN ('delivered', 'shipped')
              AND o.order_date BETWEEN ? AND ?
            GROUP BY c.customer_id, c.name, c.addr_city, c.addr_state
            ORDER BY total_spent DESC
            LIMIT 20
        """, (start, end))

        # Format response with proper types
        return [
            {
                "customer_id": row["customer_id"],
                "name": row["name"],
                "city": row["city"],
                "state": row["state"],
                "total_orders": row["total_orders"],
                "total_spent": round(row["total_spent"], 2)
            }
            for row in results
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/franchise/cities", tags=["Franchise"])
def get_cities(start: str = "2022-01-01", end: str = "2022-12-31"):
    """
    Returns revenue grouped by city and state.
    Used to power the geographic breakdown chart.

    Expected response:
    [
        { "city": "Austin", "state": "TX", "order_count": 420, "revenue": 38430.00 }
    ]
    """
    try:
        conn = get_connection()
        results = execute_query(conn, """
            SELECT
                c.addr_city AS city,
                c.addr_state AS state,
                COUNT(DISTINCT o.order_id) AS order_count,
                SUM(o.amount) AS revenue
            FROM fact_orders o
            JOIN dim_customer c ON o.customer_id = c.customer_id
            WHERE c.is_current = 1
              AND o.status IN ('delivered', 'shipped')
              AND o.order_date BETWEEN ? AND ?
            GROUP BY c.addr_city, c.addr_state
            ORDER BY revenue DESC
        """, (start, end))

        # Format response with proper types
        return [
            {
                "city": row["city"],
                "state": row["state"],
                "order_count": row["order_count"],
                "revenue": round(row["revenue"], 2)
            }
            for row in results
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/franchise/customer/{customer_id}", tags=["Franchise"])
def get_customer_by_id(customer_id: str, start: str = "2022-01-01", end: str = "2022-12-31"):
    """
    Get a specific customer by ID with their purchase history.

    Returns customer details and total orders/spending for the date range.
    """
    try:
        conn = get_connection()
        results = execute_query(conn, """
            SELECT
                c.customer_id,
                c.name,
                c.addr_city AS city,
                c.addr_state AS state,
                COUNT(DISTINCT o.order_id) AS total_orders,
                SUM(o.amount) AS total_spent
            FROM dim_customer c
            LEFT JOIN fact_orders o ON c.customer_id = o.customer_id
                AND o.status IN ('delivered', 'shipped')
                AND o.order_date BETWEEN ? AND ?
            WHERE c.is_current = 1
              AND c.customer_id = ?
            GROUP BY c.customer_id, c.name, c.addr_city, c.addr_state
        """, (start, end, customer_id))

        if not results:
            raise HTTPException(status_code=404, detail=f"Customer {customer_id} not found")

        row = results[0]
        return {
            "customer_id": row["customer_id"],
            "name": row["name"],
            "city": row["city"],
            "state": row["state"],
            "total_orders": row["total_orders"] or 0,
            "total_spent": round(row["total_spent"] or 0, 2)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/franchise/product/{product_id}", tags=["Franchise"])
def get_product_by_id(product_id: str, start: str = "2022-01-01", end: str = "2022-12-31"):
    """
    Get a specific product by ID with sales data.

    Returns product details and units sold/revenue for the date range.
    """
    try:
        conn = get_connection()
        results = execute_query(conn, """
            SELECT
                p.product_id,
                p.name,
                p.category,
                COALESCE(SUM(o.quantity), 0) AS units_sold,
                COALESCE(SUM(o.amount), 0) AS revenue
            FROM dim_product p
            LEFT JOIN fact_orders o ON p.product_id = o.product_id
                AND o.status IN ('delivered', 'shipped')
                AND o.order_date BETWEEN ? AND ?
            WHERE p.product_id = ?
            GROUP BY p.product_id, p.name, p.category
        """, (start, end, product_id))

        if not results:
            raise HTTPException(status_code=404, detail=f"Product {product_id} not found")

        row = results[0]
        return {
            "product_id": row["product_id"],
            "name": row["name"],
            "category": row["category"],
            "units_sold": row["units_sold"],
            "revenue": round(row["revenue"], 2)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/franchise/search", tags=["Franchise"])
def search(query: str, limit: int = 10):
    """
    Server-side search across products and customers.
    Returns top matching results for the given query string.

    Query parameters:
      query: search string (minimum 2 characters)
      limit: maximum number of results per category (default 10, max 20)

    Expected response:
    {
        "customers": [
            { "customer_id": "C001", "name": "Alice Johnson", "city": "Austin", "state": "TX" }
        ],
        "products": [
            { "product_id": "P001", "name": "Wireless Headphones", "category": "Electronics" }
        ]
    }
    """
    # Validate query
    if not query or len(query) < 2:
        raise HTTPException(status_code=400, detail="Query must be at least 2 characters")

    # Validate limit
    if limit < 1 or limit > 20:
        raise HTTPException(status_code=400, detail="Limit must be between 1 and 20")

    try:
        conn = get_connection()

        # Search pattern for LIKE queries (case-insensitive)
        search_pattern = f"%{query}%"

        # Search customers
        customer_results = execute_query(conn, """
            SELECT DISTINCT
                c.customer_id,
                c.name,
                c.addr_city AS city,
                c.addr_state AS state
            FROM dim_customer c
            WHERE c.is_current = 1
              AND (
                  LOWER(c.name) LIKE LOWER(?)
                  OR LOWER(c.addr_city) LIKE LOWER(?)
                  OR LOWER(c.addr_state) LIKE LOWER(?)
              )
            ORDER BY c.name
            LIMIT ?
        """, (search_pattern, search_pattern, search_pattern, limit))

        # Search products
        product_results = execute_query(conn, """
            SELECT DISTINCT
                p.product_id,
                p.name,
                p.category
            FROM dim_product p
            WHERE LOWER(p.name) LIKE LOWER(?)
               OR LOWER(p.category) LIKE LOWER(?)
            ORDER BY p.name
            LIMIT ?
        """, (search_pattern, search_pattern, limit))

        return {
            "customers": [
                {
                    "customer_id": row["customer_id"],
                    "name": row["name"],
                    "city": row["city"],
                    "state": row["state"]
                }
                for row in customer_results
            ],
            "products": [
                {
                    "product_id": row["product_id"],
                    "name": row["name"],
                    "category": row["category"]
                }
                for row in product_results
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
