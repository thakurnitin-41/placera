# Placera AI PBL — Report-first implementation plan

## Repository audit
The current repository is a React/Vite client-side app. Its README describes localStorage-backed profiles, synthetic demo opportunities, deterministic TF-IDF/cosine similarity, eligibility checks, ATS analysis and placement-readiness features. Existing relevant files include src/services/eligibilityService.ts, src/services/recommendationEngine.ts, src/components/AIPipelinePage.tsx and src/components/AIInsightsModelPage.tsx. The latter includes a Python example referring to X_features and y_labels without defining them in the snippet; it must not be represented as a trained production classifier. The existing .env.example does not configure PostgreSQL.

## Target architecture
- Preserve the existing React/Vite frontend and visual identity.
- Add a Python FastAPI backend and PostgreSQL persistence.
- Keep hard eligibility constraints separate from soft ranking.
- Implement report algorithms as deterministic, testable functions with explanation traces.
- Use synthetic fixtures only when clearly labelled; no accuracy claims without coordinator-labelled holdout data.

## Report mapping
1. Search/CSP: BFS, DFS, Greedy Best-First, A*, hard eligibility and explainable ranking.
2. Adversarial search: Minimax and Alpha-Beta; both must return the same optimal value.
3. Knowledge representation: propositional evaluator, predicate unification, semantic network, frames and forward chaining.
4. Uncertainty: Bayes updates, certainty factors, Dempster-Shafer mass combination, fuzzy membership/centroid and a clearly scoped Bayesian evidence update.
5. Pipeline: eligibility first, rank only eligible roles, expose skill gaps and assumptions, then evaluate against labelled manual shortlists.

## Validation policy
- Test algorithmic invariants and hand-calculated examples.
- Report precision/recall only against a defined labelled set. If labels are absent, mark these metrics unavailable.
- Version and disclose priors, likelihoods and fuzzy parameters; these are assumptions until supported by calibration data.
- Label all generated demo data as synthetic.

## Phases
1. Repository audit and baseline preservation.
2. Backend package, PostgreSQL schema/migrations and API.
3. Search/CSP and tests.
4. Minimax and knowledge representation.
5. Uncertainty methods and numerical tests.
6. Frontend integration and coordinator workspace.
7. End-to-end validation, deployment and report correction.

This plan does not imply that later phases or deployment are complete.