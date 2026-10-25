import React, { useState } from 'react';
import { X, Database, Table, Copy, Check, ShieldCheck } from 'lucide-react';

interface DatabaseSchemaModalProps {
  onClose: () => void;
}

export const DatabaseSchemaModal: React.FC<DatabaseSchemaModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'postgres' | 'visual' | 'sql' | 'firebase'>('postgres');
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedPgSql, setCopiedPgSql] = useState(false);

  const postgresSchemaCode = `-- PLACERA Production PostgreSQL Schema (Render Managed PostgreSQL)
-- Applied automatically via Alembic migrations on deployment

-- 1. Students Table (Candidate Profiles)
CREATE TABLE students (
    student_id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    cgpa NUMERIC(4, 2) NOT NULL,
    branch VARCHAR(64) NOT NULL,
    active_backlogs INTEGER NOT NULL DEFAULT 0,
    graduation_year INTEGER,
    skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    projects JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Opportunities Table (Campus Recruitment Drives)
CREATE TABLE opportunities (
    opportunity_id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    company VARCHAR(160),
    minimum_cgpa NUMERIC(4, 2) NOT NULL,
    eligible_branches JSONB NOT NULL DEFAULT '[]'::jsonb,
    required_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    max_active_backlogs INTEGER NOT NULL DEFAULT 0,
    eligible_graduation_years JSONB,
    seats INTEGER NOT NULL DEFAULT 1,
    source VARCHAR(32) NOT NULL DEFAULT 'synthetic',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Recommendation Runs Table (Explainable Run Audit)
CREATE TABLE recommendation_runs (
    run_id VARCHAR(64) PRIMARY KEY,
    algorithm_version VARCHAR(32) NOT NULL,
    parameters JSONB NOT NULL,
    dataset_version VARCHAR(80) NOT NULL,
    validation_status VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Recommendation Results Table (Bayesian Scores & Explanation)
CREATE TABLE recommendation_results (
    id SERIAL PRIMARY KEY,
    run_id VARCHAR(64) NOT NULL REFERENCES recommendation_runs(run_id) ON DELETE CASCADE,
    student_id VARCHAR(64) NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    opportunity_id VARCHAR(64) NOT NULL REFERENCES opportunities(opportunity_id) ON DELETE CASCADE,
    eligible BOOLEAN NOT NULL,
    score NUMERIC(5, 2) NOT NULL,
    matched_skills JSONB NOT NULL,
    missing_skills JSONB NOT NULL,
    explanation JSONB NOT NULL,
    uncertainty JSONB NOT NULL
);

-- 5. Manual Shortlist Labels Table (Placement Coordinator Benchmarks)
CREATE TABLE manual_shortlist_labels (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(64) NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    opportunity_id VARCHAR(64) NOT NULL REFERENCES opportunities(opportunity_id) ON DELETE CASCADE,
    label BOOLEAN NOT NULL,
    reviewer VARCHAR(120),
    dataset_split VARCHAR(32) NOT NULL DEFAULT 'unassigned',
    source_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_manual_shortlist UNIQUE (student_id, opportunity_id)
);`;

  const mysqlSchemaCode = `-- PLACERA Database Schema (MySQL 8.0 / Cloud SQL Compatible)
-- Project: AI-Powered Placement Recommendation System

CREATE DATABASE IF NOT EXISTS placera_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE placera_db;

-- 1. Students Table
CREATE TABLE students (
    student_id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    branch ENUM('CSE', 'AI & DS', 'IT', 'ECE', 'EEE', 'MECH') NOT NULL,
    GPA DECIMAL(3, 2) NOT NULL,
    skills JSON NOT NULL COMMENT 'Array of normalized skills',
    certifications JSON DEFAULT NULL COMMENT 'Array of cert objects',
    projects JSON DEFAULT NULL COMMENT 'Array of project objects',
    experience TEXT DEFAULT NULL,
    preferred_role VARCHAR(128) NOT NULL,
    preferred_location VARCHAR(128) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Jobs Table
CREATE TABLE jobs (
    job_id VARCHAR(64) PRIMARY KEY,
    company VARCHAR(128) NOT NULL,
    title VARCHAR(128) NOT NULL,
    description TEXT NOT NULL,
    required_skills JSON NOT NULL COMMENT 'Array of required skill strings',
    preferred_skills JSON DEFAULT NULL,
    experience_level VARCHAR(64) DEFAULT 'Entry Level (Fresher)',
    minimum_gpa DECIMAL(3, 2) NOT NULL DEFAULT 6.50,
    eligible_branches JSON NOT NULL COMMENT 'Array of branch strings',
    location VARCHAR(128) NOT NULL,
    ctc_range VARCHAR(64) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Recommendations Table
CREATE TABLE recommendations (
    recommendation_id VARCHAR(64) PRIMARY KEY,
    student_id VARCHAR(64) NOT NULL,
    job_id VARCHAR(64) NOT NULL,
    similarity_score DECIMAL(5, 2) NOT NULL COMMENT 'Cosine similarity percentage',
    fit_score DECIMAL(5, 2) NOT NULL COMMENT 'Random forest fit classifier score',
    final_match_score DECIMAL(5, 2) NOT NULL COMMENT 'Weighted match percentage',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE
);

-- 4. Skill_Gaps Table
CREATE TABLE skill_gaps (
    gap_id VARCHAR(64) PRIMARY KEY,
    student_id VARCHAR(64) NOT NULL,
    job_id VARCHAR(64) NOT NULL,
    skill VARCHAR(128) NOT NULL,
    priority ENUM('High', 'Medium', 'Low') NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE
);`;

  const copySql = () => {
    navigator.clipboard.writeText(mysqlSchemaCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const copyPgSql = () => {
    navigator.clipboard.writeText(postgresSchemaCode);
    setCopiedPgSql(true);
    setTimeout(() => setCopiedPgSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Database Structure (PostgreSQL / Relational / NoSQL)</h2>
              <p className="text-xs text-slate-500">PostgreSQL (Render live API), MySQL DDL, and Firestore mapping</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="px-6 pt-3 border-b border-slate-200 flex gap-6 text-xs font-bold bg-white overflow-x-auto">
          <button
            onClick={() => setActiveTab('postgres')}
            className={`pb-3 border-b-2 cursor-pointer shrink-0 ${
              activeTab === 'postgres' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500'
            }`}
          >
            PostgreSQL (Live Render DB)
          </button>
          <button
            onClick={() => setActiveTab('visual')}
            className={`pb-3 border-b-2 cursor-pointer shrink-0 ${
              activeTab === 'visual' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'
            }`}
          >
            Visual Schema (4 Tables)
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-3 border-b-2 cursor-pointer shrink-0 ${
              activeTab === 'sql' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'
            }`}
          >
            MySQL DDL
          </button>
          <button
            onClick={() => setActiveTab('firebase')}
            className={`pb-3 border-b-2 cursor-pointer shrink-0 ${
              activeTab === 'firebase' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'
            }`}
          >
            Firebase Firestore Compatibility
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {activeTab === 'postgres' && (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-bold block text-xs">Live Render PostgreSQL Database Schema</span>
                  <span className="text-[11px] text-emerald-800">
                    5 Relational tables synchronized with FastAPI + SQLAlchemy in <code className="font-mono bg-white/70 px-1 py-0.5 rounded">backend/</code>
                  </span>
                </div>
                <button
                  onClick={copyPgSql}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center justify-center gap-1.5 cursor-pointer font-medium text-xs shadow-xs shrink-0"
                >
                  {copiedPgSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPgSql ? 'Copied' : 'Copy PostgreSQL DDL'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-emerald-300 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                <code>{postgresSchemaCode}</code>
              </pre>
            </div>
          )}

          {activeTab === 'visual' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Table 1: Students */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                    <Table className="w-4 h-4 text-indigo-600" />
                    students
                  </span>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono">10 Columns</span>
                </div>
                <div className="space-y-1 font-mono text-[11px] text-slate-600">
                  <div className="flex justify-between py-0.5"><span className="text-indigo-600 font-bold">student_id (PK)</span><span>VARCHAR(64)</span></div>
                  <div className="flex justify-between py-0.5"><span>name</span><span>VARCHAR(128)</span></div>
                  <div className="flex justify-between py-0.5"><span>branch</span><span>ENUM</span></div>
                  <div className="flex justify-between py-0.5"><span>GPA</span><span>DECIMAL(3,2)</span></div>
                  <div className="flex justify-between py-0.5"><span>skills</span><span>JSON (Array)</span></div>
                  <div className="flex justify-between py-0.5"><span>certifications</span><span>JSON</span></div>
                  <div className="flex justify-between py-0.5"><span>projects</span><span>JSON</span></div>
                  <div className="flex justify-between py-0.5"><span>experience</span><span>TEXT</span></div>
                  <div className="flex justify-between py-0.5"><span>preferred_role</span><span>VARCHAR(128)</span></div>
                  <div className="flex justify-between py-0.5"><span>preferred_location</span><span>VARCHAR(128)</span></div>
                </div>
              </div>

              {/* Table 2: Jobs */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                    <Table className="w-4 h-4 text-blue-600" />
                    jobs
                  </span>
                  <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-mono">10 Columns</span>
                </div>
                <div className="space-y-1 font-mono text-[11px] text-slate-600">
                  <div className="flex justify-between py-0.5"><span className="text-blue-600 font-bold">job_id (PK)</span><span>VARCHAR(64)</span></div>
                  <div className="flex justify-between py-0.5"><span>company</span><span>VARCHAR(128)</span></div>
                  <div className="flex justify-between py-0.5"><span>title</span><span>VARCHAR(128)</span></div>
                  <div className="flex justify-between py-0.5"><span>description</span><span>TEXT</span></div>
                  <div className="flex justify-between py-0.5"><span>required_skills</span><span>JSON (Array)</span></div>
                  <div className="flex justify-between py-0.5"><span>preferred_skills</span><span>JSON (Array)</span></div>
                  <div className="flex justify-between py-0.5"><span>experience_level</span><span>VARCHAR(64)</span></div>
                  <div className="flex justify-between py-0.5"><span>minimum_gpa</span><span>DECIMAL(3,2)</span></div>
                  <div className="flex justify-between py-0.5"><span>eligible_branches</span><span>JSON (Array)</span></div>
                  <div className="flex justify-between py-0.5"><span>location</span><span>VARCHAR(128)</span></div>
                </div>
              </div>

              {/* Table 3: Recommendations */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                    <Table className="w-4 h-4 text-emerald-600" />
                    recommendations
                  </span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-mono">7 Columns</span>
                </div>
                <div className="space-y-1 font-mono text-[11px] text-slate-600">
                  <div className="flex justify-between py-0.5"><span className="text-emerald-600 font-bold">recommendation_id (PK)</span><span>VARCHAR(64)</span></div>
                  <div className="flex justify-between py-0.5"><span className="text-slate-900 font-semibold">student_id (FK)</span><span>VARCHAR(64)</span></div>
                  <div className="flex justify-between py-0.5"><span className="text-slate-900 font-semibold">job_id (FK)</span><span>VARCHAR(64)</span></div>
                  <div className="flex justify-between py-0.5"><span>similarity_score</span><span>DECIMAL(5,2)</span></div>
                  <div className="flex justify-between py-0.5"><span>fit_score</span><span>DECIMAL(5,2)</span></div>
                  <div className="flex justify-between py-0.5"><span>final_match_score</span><span>DECIMAL(5,2)</span></div>
                  <div className="flex justify-between py-0.5"><span>timestamp</span><span>TIMESTAMP</span></div>
                </div>
              </div>

              {/* Table 4: Skill_Gaps */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                    <Table className="w-4 h-4 text-amber-600" />
                    skill_gaps
                  </span>
                  <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-mono">5 Columns</span>
                </div>
                <div className="space-y-1 font-mono text-[11px] text-slate-600">
                  <div className="flex justify-between py-0.5"><span className="text-amber-600 font-bold">gap_id (PK)</span><span>VARCHAR(64)</span></div>
                  <div className="flex justify-between py-0.5"><span className="text-slate-900 font-semibold">student_id (FK)</span><span>VARCHAR(64)</span></div>
                  <div className="flex justify-between py-0.5"><span className="text-slate-900 font-semibold">job_id (FK)</span><span>VARCHAR(64)</span></div>
                  <div className="flex justify-between py-0.5"><span>skill</span><span>VARCHAR(128)</span></div>
                  <div className="flex justify-between py-0.5"><span>priority</span><span>ENUM('High','Med','Low')</span></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">MySQL Schema DDL Script</span>
                <button
                  onClick={copySql}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 flex items-center gap-1 cursor-pointer font-medium"
                >
                  {copiedSql ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSql ? 'Copied' : 'Copy SQL'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-indigo-300 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed">
                <code>{mysqlSchemaCode}</code>
              </pre>
            </div>
          )}

          {activeTab === 'firebase' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-900">
                <span className="font-bold block mb-1">Firebase Firestore Collections Mapping:</span>
                <p>
                  As requested in the project specification ("Keep architecture compatible with Firebase if required"), PLACERA tables map 1:1 to Firestore NoSQL root collections:
                </p>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-bold text-indigo-700">/students/{'{student_id}'}</span>
                  <p className="text-slate-600 text-[11px] font-sans mt-0.5">
                    Document fields: name, branch, GPA, skills[], certifications[], projects[], experience, preferred_role.
                  </p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-bold text-indigo-700">/jobs/{'{job_id}'}</span>
                  <p className="text-slate-600 text-[11px] font-sans mt-0.5">
                    Document fields: company, title, description, required_skills[], minimum_gpa, eligible_branches[].
                  </p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-bold text-indigo-700">/recommendations/{'{recommendation_id}'}</span>
                  <p className="text-slate-600 text-[11px] font-sans mt-0.5">
                    Document fields: student_id, job_id, similarity_score, fit_score, final_match_score, timestamp.
                  </p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-bold text-indigo-700">/skill_gaps/{'{gap_id}'}</span>
                  <p className="text-slate-600 text-[11px] font-sans mt-0.5">
                    Document fields: student_id, job_id, skill, priority.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 rounded-xl cursor-pointer"
          >
            Close Schema Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
