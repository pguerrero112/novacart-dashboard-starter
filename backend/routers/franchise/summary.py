"""
routers/franchise/summary.py — GET /franchise/{franchise_id}/summary

Returns an overview of all orders for the given franchise:
- Total revenue (delivered + shipped orders only)
- Total orders
- Number of unique customers
- Date range of available data

Expected response:
{
    "total_revenue": 1284750.00,
    "total_orders": 8432,
    "unique_customers": 380,
    "date_range": { "start_date": "2022-01-01", "end_date": "2022-12-31" }
}
"""

from fastapi import APIRouter

from connection import get_connection, execute_query

router = APIRouter()


@router.get("/summary")
def get_summary(franchise_id: int):
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
        "total_revenue":    round(row["total_revenue"] or 0, 2),
        "total_orders":     row["total_orders"],
        "unique_customers": row["unique_customers"],
        "date_range":       {"start_date": row["start_date"], "end_date": row["end_date"]},
    }
