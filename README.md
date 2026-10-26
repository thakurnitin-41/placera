# Placera — Modern AI-Powered Campus Placement Platform

[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)

Placera is an enterprise-grade, modern AI-powered placement platform engineered with a clean **white-and-navy executive theme**, elegant gradients, responsive layouts, explainable recommendation algorithms, and an intuitive **3-Step Registration & Onboarding Experience**.

---

## 🚀 Live Deployments & Repository Links

- **Official Repository**: [https://github.com/thakurnitin-41/placera](https://github.com/thakurnitin-41/placera)
- **Vercel Production Frontend**: [https://placera.vercel.app](https://placera.vercel.app)
- **Render Managed API & Database**: [https://placera-api.onrender.com](https://placera-api.onrender.com) (Health endpoint: [`/health`](https://placera-api.onrender.com/health))

---

## 🌟 Upgraded 3-Step Candidate Journey

Placera breaks down complex candidate registration into a streamlined, high-conversion flow:

```mermaid
flowchart LR
    A["1. Basic Registration"] --> B["2. Profile Creation"]
    B --> C["3. Personalised Onboarding"]
    B -.->|"Skip for now"| C
    C --> D["Student Dashboard & Matches"]
```

### 1. Basic Registration
- **Streamlined Account Creation**: Candidate name, institutional or personal email, WhatsApp/mobile number, and auto-generated or custom university registration roll number.
- **Cryptographic Security**: SHA-256 salted password hashing with real-time password strength meter and match indicator.
- **Form Intelligence**: Real-time inline validation with visual checkmarks and browser draft autosave (`localStorage`).

### 2. Profile Creation
- **Academic Hierarchy**: Dynamic course-to-branch mapping (B.Tech, BCA, MCA, M.Tech, MBA) with auto-synced graduation years, CGPA bounds validation (0–10.0), board percentages, and backlog tracking.
- **Searchable Skill Tags**: Live type-ahead search across 40+ high-demand skills, category filters (*Languages*, *AI/ML*, *Web/Backend*, *Databases*, *DevOps*), removable tag chips, and custom skill entry.
- **Career Preferences & Portfolio**: 8 target career roles, work location, relocation toggle, projects portfolio, and optional profile links (GitHub, LinkedIn, LeetCode handle & problems solved).
- **Skip-for-Now Flexibility**: Students can skip nonessential profile fields at any time; Placera assigns sensible backward-compatible defaults without breaking AI match models.

### 3. Personalised Onboarding
- **Profile Health Meter**: Interactive completion breakdown (Basic Info, Academics, Skills, Resume, Projects, Verification) with jump-to-edit actions.
- **Placement Readiness Index (PRI)**: Deterministic 0–100 score evaluating 5 hiring pillars (*Academic*, *Technical Skills*, *Problem Solving*, *Project Portfolio*, *ATS Resume*).
- **Client-Side ATS Resume Scanner**: Instant resume keyword density evaluation, action verb counting, quantifiable metrics detection, section scores, and concrete keyword suggestions.
- **Target Role Skill Gap Analysis**: Matched vs. high-priority missing skills evaluated against active recruiter criteria.
- **Contextual Action Roadmap**: Dynamic next steps based on real candidate data (e.g., adding projects, solving targeted DSA problems, marksheet upload).

---

## 🎨 Design System: White & Navy Theme

- **Color Palette**:
  - Deep Rich Navy: `#0a192f` / `#0f172a` / `#1e293b`
  - Crisp Pure White: `#ffffff`
  - Subtle Neutral Canvas: `#f8fafc` / `#f1f5f9`
  - Royal Sapphire & Indigo Gradients: `from-slate-950 via-slate-900 to-indigo-950`
  - Status Accents: Emerald `#10b981` (Verified / Match) and Amber `#f59e0b` (Under Review)
- **Typography & Components**: Modern card containers, subtle 1px slate borders, smooth hover elevations, responsive navigation with desktop pills, and sticky status banners.

---

## 🛠️ Architecture & Deterministic Matching Engine

Placera contains **zero black-box or fabricated AI results**. All recommendations and analytics run on transparent, explainable mathematics:

1. **TF-IDF & Cosine Vector Space**: Vectorizes student competencies, project summaries, and job requirements to calculate deterministic semantic overlap.
2. **Hard Multi-Criteria Eligibility Gate**: Strict filtering against company CGPA cutoffs, eligible departments, and maximum active backlog thresholds.
3. **Multi-Factor Weighted Fit**: Balances cosine similarity (35%), multi-criteria fit (35%), direct skill overlap (30%), and target role alignment bonus.

---

## 💻 Local Development

### Frontend (React + Vite + Tailwind CSS v4)
```bash
# Clone the repository
git clone https://github.com/thakurnitin-41/placera.git
cd placera

# Install dependencies
npm install

# Start local development server
npm run dev
```

### Production Build & Linting
```bash
npm run lint
npm run build
```

### Backend (FastAPI + SQLAlchemy + PostgreSQL)
```bash
cd backend
python -m pip install -e ".[test]"
$env:DATABASE_URL="postgresql+psycopg://postgres:password@localhost:5432/placera"
$env:ALLOWED_ORIGINS="http://localhost:3000,https://placera.vercel.app"
alembic upgrade head
uvicorn placera_ai.api:app --reload --port 8000
```

---

## 🚢 Deployment Configuration

### Vercel (`vercel.json`)
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
Set environment variable in Vercel Project Settings:
`VITE_API_BASE_URL=https://placera-api.onrender.com`

### Render (`render.yaml`)
Deploys the FastAPI service with Docker and provisions managed PostgreSQL:
```yaml
services:
  - type: web
    name: placera-api
    runtime: docker
    dockerfilePath: ./backend/Dockerfile
    dockerContext: ./backend
    healthCheckPath: /health
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: placera-postgres
          property: connectionString
      - key: ALLOWED_ORIGINS
        sync: false
databases:
  - name: placera-postgres
    databaseName: placera
    user: placera
```

---

## 📄 License
MIT License. Built for university placement cells and engineering graduates.
