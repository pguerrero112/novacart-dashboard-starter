"""
routers/franchise/orders.py — GET /franchise/{franchise_id}/orders

Returns monthly order volume and revenue for the given date range.

Query parameters:
  start: start date (YYYY-MM-DD)
  end:   end date (YYYY-MM-DD)

Expected response:
[
    { "month": "2022-01", "month_name": "January", "order_count": 842, "revenue": 128450.00 },
    { "month": "2022-02", "month_name": "February", "order_count": 910, "revenue": 141230.00 }
]
"""

from fastapi import APIRouter

from connection import get_connection, execute_query

router = APIRouter()


@router.get("/orders")
def get_orders(franchise_id: int, start: str = "2022-01-01", end: str = "2022-12-31"):
    conn = get_connection()

    results = execute_query(
        conn,
        """
        SELECT
            SUBSTR(fo.order_date, 1, 7)      AS month,
            MIN(dd.month_name)          AS month_name,
            COUNT(fo.order_id)          AS order_count,
            ROUND(SUM(fo.amount), 2)    AS revenue
        FROM fact_orders fo
        JOIN dim_date dd ON fo.date_key = dd.date_key
        WHERE fo.order_date BETWEEN ? AND ?
          AND fo.status IN ('delivered', 'shipped')
        GROUP BY SUBSTR(fo.order_date, 1, 7)
        ORDER BY month ASC
        """,
        (start, end),
    )

    return [
        {
            "month":       row["month"],
            "month_name":  row["month_name"],
            "order_count": row["order_count"],
            "revenue":     round(row["revenue"] or 0, 2),
        }
        for row in results
    ]
