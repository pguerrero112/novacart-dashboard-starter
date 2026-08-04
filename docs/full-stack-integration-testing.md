# Full Stack Integration Testing Guide

## Overview

This document provides a complete guide for testing the NovaCart Account Dashboard with both **backend (FastAPI)** and **frontend (React)** running together. This ensures end-to-end functionality before deployment to SPCS.

**Date:** 2026-08-04  
**Status:** ✅ Backend Running | ✅ Frontend Starting

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Backend Setup](#backend-setup)
3. [Frontend Setup](#frontend-setup)
4. [Testing Procedures](#testing-procedures)
5. [Expected Results](#expected-results)
6. [Troubleshooting](#troubleshooting)
7. [Integration Issues Found](#integration-issues-found)

---

## Quick Start

### Prerequisites

- Python 3.11+ installed
- Node.js 18+ installed  
- Both servers can run simultaneously (ports 8000 and 3000)

### Launch Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

**Open Browser:**
- Frontend: http://localhost:3000
- Backend API Docs: http://localhost:8000/docs

---

## Backend Setup

### Step 1: Create Environment File

**File:** `backend/.env`

```bash
# Data backend
DATA_BACKEND=sqlite

# SQLite path (relative to backend/ directory)
SQLITE_PATH=../data/novacart_gold.db

# Client validation mode
CLIENT_VALIDATION=Dev

# Server port
PORT=8000
```

### Step 2: Install Dependencies

**Core dependencies only (for local dev):**
```bash
cd backend
python -m pip install fastapi uvicorn[standard] python-dotenv
```

**Full dependencies (includes Snowflake connector):**
```bash
cd backend
pip install -r requirements.txt
```

> **Note:** For local dev, you can skip `snowflake-connector-python` since we're using SQLite.

### Step 3: Fix Snowflake Import

The `connection.py` file originally imported snowflake unconditionally. This has been fixed to import only when needed.

**Fixed:** Line 14 in `backend/connection.py` - removed unconditional `import snowflake.connector`

### Step 4: Start Backend

```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```

**Expected Output:**
```
INFO:     Will watch for changes in these directories: ['C:\\...\\backend']
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [XXXXX] using WatchFiles
INFO:     Started server process [XXXXX]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Step 5: Verify Backend

**Test Health Endpoint:**
```bash
curl http://localhost:8000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "uptime_s": 32,
  "backend": "sqlite",
  "database": {
    "status": "connected"
  }
}
```

**Test Summary Endpoint:**
```bash
curl http://localhost:8000/franchise/summary
```

**Expected Response:**
```json
{
  "total_revenue": 3219003.52,
  "total_orders": 17083,
  "unique_customers": 400,
  "date_range": {
    "start": "2022-01-01",
    "end": "2022-12-31"
  }
}
```

---

## Frontend Setup

### Step 1: Create Environment File

**File:** `frontend/.env`

```bash
# Backend URL for local development
REACT_APP_BACKEND_URL=http://localhost:8000

# Validation mode (must match backend)
REACT_APP_CLIENT_VALIDATION=Dev
```

### Step 2: Install Dependencies

```bash
cd frontend
npm install
```

**Expected:** ~1,328 packages installed in ~30 seconds

**Warnings:** Some deprecation warnings are normal (recharts@2.x, eslint@8.x, etc.)

### Step 3: Start Frontend

```bash
cd frontend
npm start
```

**Expected Output:**
```
Compiled successfully!

You can now view novacart-dashboard in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000

Note that the development build is not optimized.
To create a production build, use npm run build.

webpack compiled successfully
```

**Browser Auto-Opens:** React will automatically open http://localhost:3000

---

## Testing Procedures

### Test 1: Health Check & API Docs

**Backend Health:**
- Open: http://localhost:8000/health
- ✅ Should show JSON with "status": "healthy"

**Swagger API Docs:**
- Open: http://localhost:8000/docs
- ✅ Should show interactive API documentation
- ✅ All 7 endpoints listed (health, authorize, 5 franchise endpoints)
- ✅ No endpoints showing "501 Not Implemented"

### Test 2: OrdersView Dashboard

**Navigate:** http://localhost:3000 (default landing page)

**Stat Cards (Top Section):**
- [ ] **Total Revenue** displays: **$3,219,003.52**
- [ ] **Total Orders** displays: **17,083**
- [ ] **Unique Customers** displays: **400**

**Monthly Revenue Chart:**
- [ ] Bar or line chart displays 12 months (Jan-Dec 2022)
- [ ] X-axis shows month names (January, February, etc.)
- [ ] Y-axis shows revenue values
- [ ] Tooltip appears on hover showing month, order count, revenue

**Revenue by Country Chart:**
- [ ] Horizontal bar chart displays locations
- [ ] Bars show "City, State" format (e.g., "San Francisco, CA")
- [ ] Sorted by revenue (highest at top)
- [ ] Tooltip shows location, order count, revenue

**Date Range Filter:**
- [ ] Start date picker present (default: 2022-01-01)
- [ ] End date picker present (default: 2022-12-31)
- [ ] "Apply" button present
- [ ] Stat cards remain unchanged when filter applied
- [ ] Both charts update when filter applied

**Test Date Filter:**
1. Change start date to **2022-01-01**
2. Change end date to **2022-03-31** (Q1 only)
3. Click **Apply**
4. ✅ Monthly chart shows only Jan, Feb, Mar
5. ✅ Revenue by country chart shows Q1 data only
6. ✅ Stat cards show full year totals (unchanged)

### Test 3: ProductsView Dashboard

**Navigate:** Click "Products" in navigation bar

**Top 10 Products Chart:**
- [ ] Horizontal bar chart displays 10 products
- [ ] Bars show product names
- [ ] Sorted by revenue (highest at top)
- [ ] Tooltip shows product name, category, units sold, revenue

**Products Table:**
- [ ] Table displays all products (15 rows)
- [ ] Columns: Product Name, Category, Units Sold, Revenue
- [ ] Currency formatted with $ and 2 decimals
- [ ] Numbers formatted with comma separators

**Date Range Filter:**
- [ ] Same date pickers as OrdersView
- [ ] Apply button present
- [ ] Both chart and table update when filter applied

**Test Date Filter:**
1. Change start date to **2022-01-01**
2. Change end date to **2022-06-30** (First half of year)
3. Click **Apply**
4. ✅ Chart shows top 10 products for Jan-June
5. ✅ Table shows all products with H1 data

### Test 4: CustomersView Dashboard

**Navigate:** Click "Customers" in navigation bar

**Top Customers Table:**
- [ ] Table displays 20 customer rows
- [ ] Columns: Customer Name, Country, Order Count, Total Spent
- [ ] Country shows "City, State" format
- [ ] Currency formatted correctly
- [ ] Default sort: Total Spent (descending)

**Table Sorting:**
- [ ] Click **Customer Name** header → sorts alphabetically
- [ ] Click again → reverses sort (Z-A)
- [ ] Click **Country** header → sorts by location
- [ ] Click **Order Count** header → sorts by order count
- [ ] Click **Total Spent** header → sorts by revenue
- [ ] Arrow icon shows current sort column and direction

**Date Range Filter:**
- [ ] Same date pickers as other views
- [ ] Apply button present
- [ ] Table updates when filter applied

**Test Date Filter:**
1. Change start date to **2022-07-01**
2. Change end date to **2022-12-31** (Second half of year)
3. Click **Apply**
4. ✅ Table shows top 20 customers for July-December

### Test 5: Navigation & Theme

**Navigation Bar:**
- [ ] Fixed at top of page
- [ ] Links: Orders, Products, Customers
- [ ] Logo/title: "NovaCart"
- [ ] Theme toggle button present
- [ ] ServiceStatus indicator present (green = healthy)

**Theme Toggle:**
- [ ] Click theme toggle button
- [ ] ✅ Page switches to dark mode
- [ ] ✅ All text remains readable
- [ ] ✅ Charts display correctly in dark mode
- [ ] Click again → switches back to light mode
- [ ] ✅ Theme preference persists on page reload

**Navigation:**
- [ ] Click "Orders" → loads OrdersView
- [ ] Click "Products" → loads ProductsView
- [ ] Click "Customers" → loads CustomersView
- [ ] Browser back/forward buttons work
- [ ] URL updates correctly (/orders, /products, /customers)

### Test 6: Service Status Indicator

**ServiceStatus Component:**
- [ ] Green indicator when backend healthy
- [ ] Polls `/health` every 30 seconds
- [ ] Shows backend type (sqlite)

**Test Error Handling:**
1. Stop backend server (Ctrl+C in backend terminal)
2. Wait 30+ seconds for next poll
3. ✅ Indicator turns red
4. ✅ Error message displays
5. Restart backend server
6. Wait 30+ seconds
7. ✅ Indicator turns green again

### Test 7: Error Handling

**Empty Data State:**
1. Set date range to invalid period (e.g., 2023-01-01 to 2023-12-31)
2. Click Apply
3. ✅ No data message displays (or empty charts)

**Network Error:**
1. Stop backend server
2. Refresh page
3. ✅ Error message displays
4. ✅ Retry button or clear error message

**Loading States:**
- [ ] Loading spinner/skeleton displays while fetching data
- [ ] Loading doesn't persist indefinitely
- [ ] Data appears after loading completes

---

## Expected Results

### Summary Statistics (Full Year 2022)

| Metric | Expected Value | Source |
|--------|----------------|--------|
| Total Revenue | $3,219,003.52 | GET /franchise/summary |
| Total Orders | 17,083 | GET /franchise/summary |
| Unique Customers | 400 | GET /franchise/summary |
| Date Range | 2022-01-01 to 2022-12-31 | GET /franchise/summary |

### Monthly Revenue (2022)

| Month | Approximate Orders | Approximate Revenue |
|-------|-------------------|---------------------|
| January | ~1,400 | ~$260,000 |
| February | ~1,350 | ~$255,000 |
| ... | ... | ... |
| December | ~1,450 | ~$275,000 |

> **Note:** Exact values will vary. Totals should sum to 17,083 orders and $3,219,003.52 revenue.

### Top Products

**Top 5 Expected (Approximate):**
1. Product with highest revenue
2. Second highest
3. Third highest
4. Fourth highest
5. Fifth highest

> **Note:** Query returns top 10. Names and values from database.

### Top Customers

**Expected:** 20 customer rows sorted by total spending (highest first)

### Geographic Distribution

**Expected:** Multiple US cities with "City, State" format sorted by revenue

---

## Troubleshooting

### Backend Won't Start

**Error:** `ModuleNotFoundError: No module named 'snowflake'`

**Solution:** 
```bash
# Option 1: Install just what's needed for local dev
cd backend
python -m pip install fastapi uvicorn[standard] python-dotenv

# Option 2: Fix connection.py to only import snowflake when needed (already done)
```

**Error:** `FileNotFoundError: SQLite database not found`

**Solution:**
```bash
# Verify database exists
ls data/novacart_gold.db

# Check SQLITE_PATH in backend/.env
SQLITE_PATH=../data/novacart_gold.db
```

**Error:** `Address already in use`

**Solution:**
```bash
# Kill process on port 8000
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Or use different port:
uvicorn main:app --reload --port 8001
```

### Frontend Won't Start

**Error:** `ENOENT: no such file or directory, open '.../package.json'`

**Solution:**
```bash
# Ensure you're in the frontend directory
cd frontend
pwd  # Should show: .../nguyen-nguyen/frontend
npm install
```

**Error:** `Port 3000 is already in use`

**Solution:**
```bash
# Kill process on port 3000 or use different port
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or React will prompt to use port 3001
```

**Error:** Blank page in browser

**Solution:**
```bash
# Check browser console for errors
# Verify REACT_APP_BACKEND_URL in frontend/.env
REACT_APP_BACKEND_URL=http://localhost:8000

# Check backend is running:
curl http://localhost:8000/health
```

### CORS Errors

**Error:** `Access to fetch... has been blocked by CORS policy`

**Solution:**
```bash
# Ensure CLIENT_VALIDATION=Dev in backend/.env
# This enables CORS for localhost:3000

# Verify in backend/main.py:
# If CLIENT_VALIDATION == "Dev": CORS enabled
```

### API Returns 500 Error

**Check Backend Logs:**
- Look in terminal running `uvicorn`
- Check for Python exceptions
- Verify database connection

**Common Causes:**
- SQL syntax error
- Database file missing
- Missing environment variable

### Charts Not Rendering

**Check:**
- Browser console for JavaScript errors
- Data is returned from API (check Network tab)
- Recharts library loaded (`npm list recharts`)
- React version compatible with Recharts

### Data Doesn't Match Expected Values

**Verify:**
- Correct date range applied
- Status filter `('delivered', 'shipped')` in SQL
- `is_current = 1` filter for customer endpoints
- No duplicate records in results

---

## Integration Issues Found

### Issue 1: Snowflake Import Error (FIXED)

**Problem:** `backend/connection.py` imported snowflake unconditionally, causing error in local dev.

**Fix:** Removed `import snowflake.connector` from top of file. Import moved into `get_snowflake_connection()` function.

**File:** `backend/connection.py` line 14

**Status:** ✅ Fixed

### Issue 2: (To be discovered during testing)

**Problem:** [Describe any frontend issues found]

**Fix:** [Describe fix]

**Status:** [Status]

---

## Next Steps After Testing

### If All Tests Pass:

1. ✅ **Document Test Results**
   - Create test report with screenshots
   - Note any minor issues or improvements

2. ✅ **Prepare for Deployment**
   - Build Docker images
   - Test Docker builds locally
   - Update environment variables for SPCS

3. ✅ **Solution Design Document**
   - App Consultant writes architecture document
   - Include technology choices and trade-offs

4. ✅ **Client Presentation**
   - Prepare demo script
   - Create presentation slides
   - Practice 10-minute demo + Q&A

### If Issues Found:

1. ❌ **Document Issues**
   - Screenshot error messages
   - Note steps to reproduce
   - Check browser console logs

2. ❌ **Prioritize Fixes**
   - P0: Blocking (dashboard won't load)
   - P1: High (feature doesn't work)
   - P2: Medium (cosmetic or minor)

3. ❌ **Fix and Retest**
   - Fix P0 and P1 issues
   - Rerun full test suite
   - Verify fixes don't break other features

---

## Testing Checklist Summary

### Backend API Tests
- [x] GET /health returns healthy status
- [x] GET /authorize returns dev_user
- [x] GET /franchise/summary returns correct totals
- [ ] GET /franchise/products returns top 10
- [ ] GET /franchise/orders returns monthly data
- [ ] GET /franchise/customers returns top 20
- [ ] GET /franchise/cities returns locations
- [ ] Date filtering works on all endpoints

### Frontend Dashboard Tests
- [ ] OrdersView loads without errors
- [ ] ProductsView loads without errors
- [ ] CustomersView loads without errors
- [ ] Navigation between views works
- [ ] Theme toggle works (light/dark)
- [ ] ServiceStatus indicator displays
- [ ] Date range filters update data
- [ ] Table sorting works (CustomersView)
- [ ] Charts render correctly
- [ ] Loading states display
- [ ] Error states display

### Integration Tests
- [ ] Frontend calls backend successfully
- [ ] CORS works in dev mode
- [ ] Data displays correctly in UI
- [ ] Date filters work end-to-end
- [ ] All three views function properly
- [ ] Theme persists across navigation
- [ ] No console errors
- [ ] Responsive design works (desktop/tablet)

---

## Status Summary

### ✅ Completed
- Backend environment configured
- Backend server running on port 8000
- Backend API endpoints implemented (all 5 franchise endpoints)
- Backend health check working
- Frontend environment configured
- Frontend dependencies installed
- Frontend server starting on port 3000
- Connection.py fixed (snowflake import)
- API documentation available at /docs

### ⏳ In Progress
- Frontend compilation
- Full integration testing

### ⏭️ Next
- Open http://localhost:3000 in browser
- Test all three dashboard views
- Verify date filtering
- Document any issues found
- Create test results report

---

**Testing Date:** 2026-08-04  
**Backend Status:** ✅ Running (port 8000)  
**Frontend Status:** ✅ Starting (port 3000)  
**Ready for Testing:** Once frontend compilation completes

**Estimated Testing Time:** 30-45 minutes for full suite
