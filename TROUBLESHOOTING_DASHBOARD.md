# Troubleshooting: Dashboard Not Showing Changes

## Issue
Changes are not visible on `http://localhost:3000/en/dashboard`

## Root Causes & Solutions

### 1. **Database Migration Not Run** ⚠️ **MOST LIKELY**

**Problem:** The new database tables don't exist yet, so API calls fail silently.

**Solution:**
```bash
# Option 1: Run migration (if database connection works)
npx prisma migrate deploy

# Option 2: Apply SQL manually via Railway console or database client
# Use the SQL from: prisma/migrations/20250123000001_add_amakusanyirizo_complete/migration.sql
```

**How to Check:**
- Open browser DevTools (F12) → Console tab
- Look for errors like "Table does not exist" or "P2021"
- Check Network tab → Look for failed API calls to `/api/v1/geo/stats`

---

### 2. **Prisma Client Not Regenerated** ✅ **FIXED**

**Problem:** Prisma client was out of date with schema changes.

**Solution:** Already fixed - Prisma client has been regenerated.

---

### 3. **Server Not Restarted**

**Problem:** Next.js dev server needs restart after schema changes.

**Solution:**
```bash
# Stop the server (Ctrl+C) and restart
npm run dev
```

---

### 4. **Browser Cache**

**Problem:** Browser cached old version of the page.

**Solution:**
- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)
- Or clear browser cache

---

### 5. **API Errors (Check Console)**

**Problem:** API calls failing but errors not visible.

**How to Check:**
1. Open browser DevTools (F12)
2. Go to Console tab - look for red errors
3. Go to Network tab - check `/api/v1/geo/stats` and `/api/v1/geo/entities`
4. Click on failed requests → Check Response tab

**Common Errors:**
- `401 Unauthorized` → Token expired, log out and log back in
- `500 Internal Server Error` → Check server logs, likely database issue
- `Table does not exist` → Migration not run

---

### 6. **No Geo-Location Data**

**Problem:** Section shows but is empty because no entities have geo-location data.

**Solution:**
- The section will now always show (even if empty)
- Add geo-location data to farmers, agents, or MCCs to see data
- Use the "Add Farmer" form and fill in geo-location

---

## Quick Diagnostic Steps

1. **Check Browser Console:**
   ```javascript
   // Open DevTools Console and check:
   localStorage.getItem("Gemurai_token") // Should return a token
   ```

2. **Check Network Requests:**
   - Open DevTools → Network tab
   - Refresh page
   - Look for `/api/v1/geo/stats` request
   - Check if it returns 200 OK or an error

3. **Check Server Logs:**
   - Look at terminal where `npm run dev` is running
   - Check for Prisma errors or database connection errors

4. **Verify Database:**
   ```bash
   # Check if tables exist (if you have database access)
   npx prisma studio
   # Or check via database client
   ```

---

## Expected Behavior After Fix

Once migrations are run and server restarted:

1. **Geo-Intelligence Section** should always be visible on dashboard
2. **Empty State:** Shows "No geo-location data available" if no data exists
3. **With Data:** Shows widgets with statistics and map visualization
4. **Loading State:** Shows spinner while fetching data

---

## Current Status

✅ **Fixed:**
- Prisma client regenerated
- Dashboard section always visible (with fallback)
- Better error handling in API routes

⚠️ **Still Needed:**
- Run database migration (connection issue preventing automatic migration)
- Restart dev server after migration

---

## Next Steps

1. **Apply Migration Manually:**
   - Copy SQL from `prisma/migrations/20250123000001_add_amakusanyirizo_complete/migration.sql`
   - Run it in your database client (Railway console, pgAdmin, etc.)

2. **Restart Dev Server:**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

3. **Test:**
   - Navigate to `http://localhost:3000/en/dashboard`
   - You should see "Geo-Intelligence" section
   - Even if empty, the section should be visible

4. **Add Test Data:**
   - Add a farmer with geo-location
   - Section should populate with data
