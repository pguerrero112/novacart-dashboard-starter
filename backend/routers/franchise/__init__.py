"""
routers/franchise — /franchise/{franchise_id}/* endpoints, one file per endpoint.
"""

from fastapi import APIRouter

from .summary import router as summary_router
from .orders import router as orders_router
from .products import router as products_router
from .customers import router as customers_router
from .countries import router as countries_router

router = APIRouter(prefix="/franchise/{franchise_id}", tags=["Franchise"])
router.include_router(summary_router)
router.include_router(orders_router)
router.include_router(products_router)
router.include_router(customers_router)
router.include_router(countries_router)
