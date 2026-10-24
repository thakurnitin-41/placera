# Placera AI PBL backend

Report-first backend for Placera. It provides deterministic algorithms and PostgreSQL-backed APIs for profiles, opportunities, recommendation history and coordinator shortlist labels.

## Setup (Windows PowerShell)
```powershell
cd backend
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -e ".[test]"
Copy-Item .env.example .env
# Edit .env and set DATABASE_URL to your PostgreSQL connection string.
alembic upgrade head
pytest
uvicorn placera_ai.api:app --reload
```

Set `DATABASE_URL` in the shell or load your local .env using your preferred environment manager; the app does not automatically load .env files. Example:
`postgresql+psycopg://placera:YOUR_PASSWORD@localhost:5432/placera`

## API endpoints
- `GET /health`: reports whether PostgreSQL can answer SELECT 1.
- `POST/GET /api/students`: create/update and list student profiles.
- `POST/GET /api/opportunities`: create/update and list opportunity records.
- `POST /api/recommendations`: runs eligibility-first matching and persists run + results.
- `GET /api/recommendation-runs/{run_id}`: reloads a saved run and its results.
- `POST /api/validation/labels`: create/update coordinator shortlist labels.
- `GET /api/validation/metrics?run_id=...`: computes precision/recall against labels assigned to the test split; returns unavailable if none exist.

Swagger docs are available at `/docs` while the API is running.

## Security and limitations
**Authentication and authorization are not implemented in this backend milestone. Do not expose write endpoints to the public internet yet.** Add server-side authentication, role-based access control, rate limits, audit review and privacy controls before public deployment. Never commit production credentials.

Priors and likelihoods are explicit demo assumptions, not learned parameters. The Bayesian-network helper is a single evidence update, not a general DAG inference engine. Forward chaining supports ground propositional Horn rules; unification is a separate helper, not a complete FOL theorem prover. The nine-rule fuzzy system and full frontend integration remain follow-up work. No precision/recall claim is made without independent coordinator-labelled test data.