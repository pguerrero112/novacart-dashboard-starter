"""
routers/franchise/products.py — GET /franchise/{franchise_id}/products

Returns the top 10 products by revenue for the given date range.

Expected response:
[
    { "product_id": "P001", "name": "Wireless Headphones", "category": "Electronics",
      "units_sold": 342, "revenue": 30578.58 }
]
"""

from fastapi import APIRouter

from connection import get_connection, execute_query

router = APIRouter()


@router.get("/products")
def get_products(franchise_id: int, start: str = "2022-01-01", end: str = "2022-12-31"):
    conn = get_connection()

    results = execute_query(
        conn,
        """
        SELECT
            dp.product_id               AS product_id,
            dp.name                     AS name,
            dp.category                 AS category,
            COUNT(fo.order_id)          AS units_sold,
            ROUND(SUM(fo.amount), 2)    AS revenue
        FROM fact_orders fo
        JOIN dim_product dp ON fo.product_id = dp.product_id
        WHERE fo.order_date BETWEEN ? AND ?
          AND fo.status IN ('delivered', 'shipped')
        GROUP BY dp.product_id, dp.name, dp.category
        ORDER BY revenue DESC
        LIMIT 10
        """,
        (start, end),
    )

    return [
        {
            "product_id": row["product_id"],
            "name":       row["name"],
            "category":   row["category"],
            "units_sold": row["units_sold"],
            "revenue":    round(row["revenue"] or 0, 2),
        }
        for row in results
    ]
