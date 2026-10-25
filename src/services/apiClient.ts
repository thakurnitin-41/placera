/**
 * Shared client for the Placera FastAPI backend and PostgreSQL database.
 * Set VITE_API_BASE_URL in Vercel to your deployed Render URL (e.g. https://placera-api.onrender.com).
 * Never put database credentials or private server secrets in VITE_* variables.
 */
import { StudentProfileData, JobPosting } from '../types';

const configuredBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
export const API_BASE_URL = configuredBase ? configuredBase.replace(/\/+$/, '') : '';

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export function isApiConfigured(): boolean {
  return Boolean(API_BASE_URL && API_BASE_URL.length > 0);
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError('Placera API is not configured. Set VITE_API_BASE_URL in Vercel.', 0);
  }
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new ApiError(message.slice(0, 300) || `API request failed (${response.status})`, response.status);
  }
  return response.json() as Promise<T>;
}

export interface ApiHealthResponse {
  status: string;
  database: string;
  note?: string;
}

export interface ApiStudentRecord {
  student_id: string;
  name: string;
  cgpa: number;
  branch: string;
  active_backlogs: number;
  graduation_year: number | null;
  skills: string[];
  projects: string[];
}

export interface ApiOpportunityRecord {
  opportunity_id: string;
  title: string;
  company: string | null;
  minimum_cgpa: number;
  eligible_branches: string[];
  required_skills: string[];
  max_active_backlogs?: number;
  eligible_graduation_years?: number[] | null;
  seats?: number;
  source?: string;
}

export interface ApiRecommendationResult {
  student_id: string;
  opportunity_id: string;
  eligible: boolean;
  score: number;
  matched_skills: string[];
  missing_skills: string[];
  explanation: string[];
  uncertainty: Record<string, unknown>;
}

export interface ApiRecommendationResponse {
  run_id: string;
  algorithm_version: string;
  dataset_version: string;
  validation_status: string;
  results: ApiRecommendationResult[];
}

// Health check
export const apiHealth = () => apiRequest<ApiHealthResponse>('/health');

// Student profile endpoints
export async function saveStudentApi(student: StudentProfileData): Promise<ApiStudentRecord> {
  const payload = {
    student_id: student.student_id || student.rollNumber || `S-${Date.now()}`,
    name: student.name || 'Student',
    cgpa: Number(student.GPA || 0),
    branch: student.branch || 'CSE',
    active_backlogs: Number(student.activeBacklogs || 0),
    graduation_year: student.graduationYear ? Number(student.graduationYear) : null,
    skills: Array.isArray(student.skills) ? student.skills : [],
    projects: Array.isArray(student.projects)
      ? student.projects.map((p) => (typeof p === 'string' ? p : p.title || p.description || 'Project'))
      : [],
  };
  return apiRequest<ApiStudentRecord>('/api/students', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchStudentsApi(): Promise<{ items: ApiStudentRecord[] }> {
  return apiRequest<{ items: ApiStudentRecord[] }>('/api/students');
}

// Opportunity endpoints
export async function saveOpportunityApi(job: JobPosting): Promise<ApiOpportunityRecord> {
  const payload = {
    opportunity_id: job.job_id,
    title: job.job_title,
    company: job.company || null,
    minimum_cgpa: Number(job.minimum_gpa || 0),
    eligible_branches: job.eligible_branches || [],
    required_skills: job.required_skills || [],
    max_active_backlogs: Number(job.max_allowed_backlogs || 0),
    eligible_graduation_years: job.eligible_graduation_years || null,
    seats: 1,
    source: job.isSyntheticDemoData ? 'synthetic' : 'manual',
  };
  return apiRequest<ApiOpportunityRecord>('/api/opportunities', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchOpportunitiesApi(): Promise<{ items: ApiOpportunityRecord[] }> {
  return apiRequest<{ items: ApiOpportunityRecord[] }>('/api/opportunities');
}

// Recommendations endpoints
export async function runRecommendationsApi(
  student: StudentProfileData,
  opportunities: JobPosting[]
): Promise<ApiRecommendationResponse> {
  const studentPayload = {
    student_id: student.student_id || student.rollNumber || `S-${Date.now()}`,
    name: student.name || 'Student',
    cgpa: Number(student.GPA || 0),
    branch: student.branch || 'CSE',
    active_backlogs: Number(student.activeBacklogs || 0),
    graduation_year: student.graduationYear ? Number(student.graduationYear) : null,
    skills: student.skills || [],
    projects: (student.projects || []).map((p) => (typeof p === 'string' ? p : p.title || p.description || 'Project')),
  };

  const opportunitiesPayload = opportunities.map((j) => ({
    opportunity_id: j.job_id,
    title: j.job_title,
    company: j.company || null,
    minimum_cgpa: Number(j.minimum_gpa || 0),
    eligible_branches: j.eligible_branches || [],
    required_skills: j.required_skills || [],
    max_active_backlogs: Number(j.max_allowed_backlogs || 0),
    eligible_graduation_years: j.eligible_graduation_years || null,
    seats: 1,
    source: j.isSyntheticDemoData ? 'synthetic' : 'manual',
  }));

  return apiRequest<ApiRecommendationResponse>('/api/recommendations', {
    method: 'POST',
    body: JSON.stringify({
      student: studentPayload,
      opportunities: opportunitiesPayload,
      dataset_version: 'placera-live-v1',
    }),
  });
}

export async function fetchRecommendationRunApi(runId: string): Promise<ApiRecommendationResponse> {
  return apiRequest<ApiRecommendationResponse>(`/api/recommendation-runs/${encodeURIComponent(runId)}`);
}
