"""
routers/franchise/countries.py — GET /franchise/{franchise_id}/countries

Returns revenue grouped by state (US data) or country (Snowflake production data).
Used to power the geographic breakdown chart.

Query parameters:
  start: start date (YYYY-MM-DD)
  end:   end date (YYYY-MM-DD)

Expected response:
[
    { "state": "TX", "order_count": 1420, "revenue": 218500.00 },
    { "state": "FL", "order_count": 1285, "revenue": 198200.00 }
]
"""

from fastapi import APIRouter

from connection import get_connection, execute_query

router = APIRouter()


@router.get("/countries")
def get_countries(franchise_id: int, start: str = "2022-01-01", end: str = "2022-12-31"):
    conn = get_connection()

    results = execute_query(
        conn,
        """
        SELECT
            dc.addr_state                       AS state,
            COUNT(DISTINCT fo.order_id)         AS order_count,
            ROUND(SUM(fo.amount), 2)            AS revenue
        FROM fact_orders fo
        JOIN dim_customer dc ON fo.customer_id = dc.customer_id
        WHERE fo.order_date BETWEEN ? AND ?
          AND fo.status IN ('delivered', 'shipped')
        GROUP BY dc.addr_state
        ORDER BY revenue DESC
        """,
        (start, end),
    )

    return [
        {
            "state":       row["state"],
            "order_count": row["order_count"],
            "revenue":     round(row["revenue"] or 0, 2),
        }
        for row in results
    ]
