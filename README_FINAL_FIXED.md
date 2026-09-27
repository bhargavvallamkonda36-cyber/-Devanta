# DEVANTA - FINAL FIXED

## Frontend
```powershell
cd frontend
npm install
npm run dev
```
Open http://localhost:5173

## Backend
```powershell
cd backend
.\venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

## If login/profile says invalid or expired token
Open browser DevTools Console once and run:
```js
localStorage.removeItem("devanta_token");
localStorage.removeItem("devanta_username");
location.href = "/login";
```
Then log in again.

## Important fixes in this version
- One shared Devanta sidebar across pages
- Consistent sidebar/main width so text is not hidden underneath the sidebar
- Dashboard no longer has a duplicate sidebar implementation
- Home no longer has a separate old sidebar
- PostgreSQL uses psycopg2-binary instead of missing pg8000
- JWT settings include FRONTEND_URL and ACCESS_TOKEN_EXPIRE_MINUTES
- Added GET /tags
- Profile/dashboard automatically redirect after a 401 token response
- Responsive layouts for desktop/tablet/mobile
