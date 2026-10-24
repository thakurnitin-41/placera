# Placera AI PBL backend

First backend milestone for the report-first PBL. Includes deterministic eligibility, graph search, Minimax/Alpha-Beta, knowledge-representation helpers, uncertainty primitives, a recommendation pipeline and FastAPI boundary.

## Setup
```bash
cd backend
python -m venv .venv
# Windows PowerShell: .venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate
python -m pip install -e '.[test]'
pytest
uvicorn placera_ai.api:app --reload
```

GET /health checks the API process only and does not claim PostgreSQL is connected. POST /api/recommendations currently computes in memory. Durable repositories, authentication and frontend integration remain later milestones.

## PostgreSQL schema
Set DATABASE_URL in your environment, install dependencies, then run alembic upgrade head from the backend directory. The initial schema includes profiles, normalized skills and aliases, opportunities, coordinator shortlist labels, recommendation runs/results, rule firings, calibration records and audit events. Migration execution requires a reachable PostgreSQL database. Do not use Base.metadata.create_all() as a production migration workflow.

## Limitations
- Priors and likelihoods are explicit demonstration assumptions, not learned parameters.
- The Bayesian-network helper is a single evidence update, not a general DAG inference engine.
- Forward chaining supports ground propositional Horn rules; unification is a separate helper, not a complete FOL theorem prover.
- Fuzzy membership/centroid primitives are implemented; the report's complete nine-rule fuzzy system still needs encoding and tests.
- No precision/recall claim is made without coordinator-labelled holdout data.