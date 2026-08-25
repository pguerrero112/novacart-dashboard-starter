"""
routers/franchise/customers.py — GET /franchise/{franchise_id}/customers

Returns the top 20 customers by total spend for the given date range.

Query parameters:
  start: start date (YYYY-MM-DD)
  end:   end date (YYYY-MM-DD)

Expected response:
[
    { "customer_id": "C001", "name": "Alice Johnson", "city": "Austin",
      "state": "TX", "total_orders": 14, "total_spent": 1240.50 }
]
"""

from fastapi import APIRouter

from connection import get_connection, execute_query

router = APIRouter()


@router.get("/customers")
def get_customers(franchise_id: int, start: str = "2022-01-01", end: str = "2022-12-31"):
    conn = get_connection()

    results = execute_query(
        conn,
        """
        SELECT
            dc.customer_id                      AS customer_id,
            dc.name                             AS name,
            dc.addr_city                        AS city,
            dc.addr_state                        AS state,
            COUNT(DISTINCT fo.order_id)         AS total_orders,
            ROUND(SUM(fo.amount), 2)            AS total_spent
        FROM fact_orders fo
        JOIN dim_customer dc ON fo.customer_id = dc.customer_id
        WHERE fo.order_date BETWEEN ? AND ?
          AND fo.status IN ('delivered', 'shipped')
          AND dc.is_current = 1
        GROUP BY dc.customer_id, dc.name, dc.addr_city, dc.addr_state
        ORDER BY total_spent DESC
        LIMIT 20
        """,
        (start, end),
    )

    return [
        {
            "customer_id":  row["customer_id"],
            "name":         row["name"],
            "city":         row["city"],
            "state":        row["state"],
            "total_orders": row["total_orders"],
            "total_spent":  round(row["total_spent"] or 0, 2),
        }
        for row in results
    ]
