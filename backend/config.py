"""
config.py — Shared app settings, read once from the environment.
"""

import os
import time
from dotenv import load_dotenv

load_dotenv()

PORT              = int(os.getenv("PORT", 8000))
CLIENT_VALIDATION = os.getenv("CLIENT_VALIDATION", "Dev")
DATA_BACKEND      = os.getenv("DATA_BACKEND", "sqlite")
START_TIME        = time.time()
