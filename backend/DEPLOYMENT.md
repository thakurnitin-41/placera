# Placera API deployment (Render + PostgreSQL)

This repository contains a Render Blueprint (`render.yaml`) and Docker image for the FastAPI service.

## Deploy
1. Import this repository in Render and use the Blueprint. It creates a web service and managed PostgreSQL database.
2. Set `ALLOWED_ORIGINS` on the API service to the exact Vercel production origin, e.g. `https://your-project.vercel.app`. Add any custom domain as a comma-separated origin. Do not use `*` for production.
3. Wait for `/health` to report `{"status":"ok","database":"connected"}`.
4. In Vercel, set `VITE_API_BASE_URL` to the API's HTTPS origin (no trailing slash), then redeploy the frontend.

## Security status — important
- CORS is an origin policy, **not authentication**.
- The current API's write and data-list endpoints do not yet enforce user authentication or role-based authorization. Do not put real student records or sensitive personal data into this deployment until server-side authentication and per-user/role authorization are implemented.
- Never put database URLs, passwords, signing keys, or privileged API keys in `VITE_*` variables.
- Use HTTPS, rotate credentials if exposed, restrict production CORS to known origins, and enable provider-side abuse protection/logging.
- `/health` is diagnostic only; a healthy response does not prove authentication or application flows are secure.

## Local test
From `backend/`:
```powershell
python -m pip install -e ".[test]"
$env:DATABASE_URL="postgresql+psycopg://USER:PASSWORD@localhost:5432/placera"
$env:ALLOWED_ORIGINS="http://localhost:3000"
alembic upgrade head
pytest
uvicorn placera_ai.api:app --reload
```
