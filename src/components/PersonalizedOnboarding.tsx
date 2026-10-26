import React, { useMemo } from 'react';
import { StudentProfileData, JobPosting, RecommendationResult, ActivePage } from '../types';
import { calculatePlacementReadiness } from '../services/readinessService';
import { analyzeResumeText } from '../services/resumeAnalysisService';
import { generateSkillGapAnalysis } from '../services/recommendationEngine';
import { getTargetRoleInfo } from '../data/targetRoles';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Trophy,
  Target,
  FileText,
  Layers,
  TrendingUp,
  Briefcase,
  GraduationCap,
  Code,
  ShieldCheck,
  Lightbulb,
  Award,
  UserCheck,
  ChevronRight,
  BookOpen,
  ArrowUpRight,
  Clock,
  Edit3
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

interface PersonalizedOnboardingProps {
  student: StudentProfileData | null;
  jobs: JobPosting[];
  recommendations: RecommendationResult[];
  setActivePage: (page: ActivePage) => void;
  onSelectJob?: (rec: RecommendationResult) => void;
  onOpenAuthModal?: (role?: 'student' | 'admin', mode?: 'login' | 'register') => void;
}

export const PersonalizedOnboarding: React.FC<PersonalizedOnboardingProps> = ({
  student,
  jobs,
  recommendations,
  setActivePage,
  onSelectJob,
  onOpenAuthModal,
}) => {
  // If no student is loaded, show invitation card
  if (!student) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4 space-y-8">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center shadow-sm space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-md">
            <Sparkles className="w-8 h-8 text-indigo-400" />
          </div>
          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Personalised Placement Onboarding
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Sign in or create your student profile to unlock real-time placement readiness, ATS resume scores, role-based skill gap roadmaps, and tailored next steps.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onOpenAuthModal ? onOpenAuthModal('student', 'register') : setActivePage('profile')}
              className="w-full sm:w-auto px-6 py-3 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Create Account & Start Onboarding</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onOpenAuthModal ? onOpenAuthModal('student', 'login') : setActivePage('profile')}
              className="w-full sm:w-auto px-6 py-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Sign In to Existing Profile</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 1. Calculate Real Profile Completeness Breakdown
  const completenessDetails = useMemo(() => {
    const checks = [
      { id: 'basic', label: 'Basic Info & Credentials', weight: 20, done: Boolean(student.name && (student.collegeEmail || student.personalEmail || student.email)) },
      { id: 'academic', label: 'Academic Details (CGPA, Branch, Years)', weight: 20, done: Boolean(student.GPA > 0 && student.branch && student.graduationYear) },
      { id: 'skills', label: 'Technical Skills (3+ minimum)', weight: 20, done: Boolean(student.skills && student.skills.length >= 3) },
      { id: 'role', label: 'Career Role & Location Preference', weight: 15, done: Boolean(student.preferred_role) },
      { id: 'projects', label: 'Project Portfolio & Work Experience', weight: 15, done: Boolean((student.projects && student.projects.length > 0) || (student.experience && student.experience.trim().length > 10)) },
      { id: 'resume', label: 'Resume & Verification Document', weight: 10, done: Boolean(student.resumeText || student.studentProof || student.uploadedMarksheets?.length) },
    ];

    const completedWeight = checks.filter(c => c.done).reduce((acc, c) => acc + c.weight, 0);
    return {
      percentage: Math.min(100, completedWeight),
      checks
    };
  }, [student]);

  // 2. Real Placement Readiness Calculation
  const readinessReport = useMemo(() => {
    return calculatePlacementReadiness(student, jobs);
  }, [student, jobs]);

  // 3. Real Client-Side ATS Resume Analysis
  const atsAnalysis = useMemo(() => {
    const textToAnalyze = student.resumeText || student.experience || student.skills.join(', ');
    return analyzeResumeText(textToAnalyze, student.preferred_role);
  }, [student]);

  // 4. Real Skill Gap Analysis
  const skillGaps = useMemo(() => {
    return generateSkillGapAnalysis(student, recommendations);
  }, [student, recommendations]);

  // Target role metadata
  const targetRoleDef = useMemo(() => {
    return getTargetRoleInfo(student.preferred_role || 'Software Development Engineer (SDE-1)');
  }, [student.preferred_role]);

  // 5. Dynamic Next Steps based on actual profile data
  const dynamicNextSteps = useMemo(() => {
    const steps: {
      id: string;
      title: string;
      description: string;
      impact: 'High' | 'Medium' | 'Essential';
      actionLabel: string;
      actionPage: ActivePage;
      isDone: boolean;
    }[] = [];

    // Verification step
    if (student.verificationStatus !== 'Verified') {
      steps.push({
        id: 'verification',
        title: 'Submit Verified Academic Document',
        description: 'Upload your current semester marksheet or institutional ID card for placement officer clearance.',
        impact: 'Essential',
        actionLabel: 'Upload Proof in Profile',
        actionPage: 'profile',
        isDone: false,
      });
    }

    // Skills step
    if (student.skills.length < 5) {
      steps.push({
        id: 'skills',
        title: 'Enrich Core Technical Skills',
        description: `Add at least ${5 - student.skills.length} more skills to match standard recruitment filters for ${student.preferred_role || 'SDE'}.`,
        impact: 'High',
        actionLabel: 'Add Skills',
        actionPage: 'profile',
        isDone: false,
      });
    }

    // Project step
    if (!student.projects || student.projects.length < 2) {
      steps.push({
        id: 'projects',
        title: 'Showcase Technical Projects',
        description: 'Top placement recruiters look for 2+ deployed or open-source projects highlighting architecture and code hygiene.',
        impact: 'High',
        actionLabel: 'Add Projects',
        actionPage: 'profile',
        isDone: false,
      });
    }

    // LeetCode / DSA step
    if (!student.leetcodeSolved || student.leetcodeSolved < 50) {
      steps.push({
        id: 'dsa',
        title: 'Accelerate Problem Solving (DSA)',
        description: 'Aim for 50+ medium LeetCode questions (Arrays, Trees, Graphs, DP) to unlock Tier-1 company eligibility.',
        impact: 'Medium',
        actionLabel: 'Update Coding Profile',
        actionPage: 'profile',
        isDone: (student.leetcodeSolved || 0) >= 50,
      });
    }

    // Resume ATS optimization step
    if (atsAnalysis.atsScore < 75) {
      steps.push({
        id: 'resume',
        title: 'Optimize ATS Resume Keywords',
        description: `Current ATS score is ${atsAnalysis.atsScore}/100. Incorporate industry action verbs and quantifiable metrics into your work experience.`,
        impact: 'High',
        actionLabel: 'Refine Resume',
        actionPage: 'profile',
        isDone: false,
      });
    }

    // Explore opportunities step
    steps.push({
      id: 'opportunities',
      title: 'Review Verified Campus Opportunities',
      description: `${recommendations.length} placement roles currently match your academic discipline (${student.branch}) and CGPA.`,
      impact: 'Essential',
      actionLabel: 'Explore Recommendations',
      actionPage: 'recommendations',
      isDone: false,
    });

    return steps;
  }, [student, atsAnalysis, recommendations]);

  const dimensionChartData = useMemo(() => [
    { dimension: 'Academic', score: readinessReport.dimensionScores.academic, fullMark: 100 },
    { dimension: 'Technical', score: readinessReport.dimensionScores.technicalSkills, fullMark: 100 },
    { dimension: 'Problem Solving', score: readinessReport.dimensionScores.problemSolving, fullMark: 100 },
    { dimension: 'Projects', score: readinessReport.dimensionScores.projectPortfolio, fullMark: 100 },
    { dimension: 'ATS Resume', score: readinessReport.dimensionScores.resumeAts, fullMark: 100 },
  ], [readinessReport]);

  const topMatches = recommendations.slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      
      {/* 1. HERO ONBOARDING HEADER (Clean White & Navy Theme with Subtle Gradients) */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-10 shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-indigo-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300 animate-pulse" />
              <span>Step 3 of 3 • Personalised Onboarding & Career Roadmap</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-200 to-white">{student.name}</span>!
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Your profile is registered with <span className="text-white font-semibold">{student.collegeName || 'Placera Campus'}</span>.
              Here is your comprehensive placement readiness assessment, deterministic match index, ATS resume breakdown, and immediate action items.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-medium text-slate-300">
              <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                {student.course || 'B.Tech'} • {student.branch} ({student.graduationYear})
              </span>
              <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                <Target className="w-3.5 h-3.5 text-blue-400" />
                Target: {student.preferred_role || 'Software Engineering'}
              </span>
              <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-semibold ${
                student.verificationStatus === 'Verified'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}>
                <ShieldCheck className="w-3.5 h-3.5" />
                {student.verificationStatus || 'Pending Review'}
              </span>
            </div>
          </div>

          {/* Quick Overall Readiness Pill Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 text-center min-w-[200px] w-full md:w-auto shadow-lg">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Placement Readiness Index
            </p>
            <div className="flex items-baseline justify-center gap-1 my-1">
              <span className="text-4xl sm:text-5xl font-black text-white">
                {readinessReport.overallReadinessScore}
              </span>
              <span className="text-slate-400 text-sm font-semibold">/100</span>
            </div>
            <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
              {readinessReport.tierTitle}
            </span>
          </div>
        </div>
      </section>

      {/* 2. PROFILE COMPLETION & ONBOARDING PROGRESS CHECKLIST */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-slate-900" />
              <h2 className="text-xl font-bold text-slate-900">Profile Health & Completeness</h2>
            </div>
            <p className="text-xs text-slate-500">
              Complete key sections to maximize your placement match score and visibility to top campus recruiters.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-2xl font-black text-slate-900">{completenessDetails.percentage}%</span>
              <span className="text-xs text-slate-500 block">Profile Score</span>
            </div>
            <div className="w-16 h-16 relative flex items-center justify-center">
              <svg className="w-14 h-14 transform -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  stroke="currentColor"
                  strokeWidth="5"
                  className="text-slate-100"
                  fill="transparent"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeDasharray={2 * Math.PI * 22}
                  strokeDashoffset={2 * Math.PI * 22 * (1 - completenessDetails.percentage / 100)}
                  strokeLinecap="round"
                  className="text-indigo-600 transition-all duration-700 ease-out"
                  fill="transparent"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Interactive Checklist Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {completenessDetails.checks.map((chk) => (
            <div
              key={chk.id}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                chk.done 
                  ? 'bg-slate-50/70 border-slate-200/80 text-slate-800' 
                  : 'bg-amber-50/40 border-amber-200/70 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {chk.done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                )}
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-900 truncate">{chk.label}</p>
                  <span className="text-[10px] text-slate-500">
                    {chk.done ? 'Completed' : 'Pending completion'} • +{chk.weight}%
                  </span>
                </div>
              </div>
              {!chk.done && (
                <button
                  onClick={() => setActivePage('profile')}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 shrink-0 cursor-pointer"
                >
                  Add
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 3. CORE ANALYTICS: PLACEMENT READINESS + RESUME ATS (2-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Placement Readiness Breakdown */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Placement Readiness Index</h3>
                  <p className="text-xs text-slate-500">Multidimensional evaluation across 5 hiring pillars</p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                {readinessReport.eligibleJobsCount} Eligible Drives
              </span>
            </div>

            {/* Dimensional Chart */}
            <div className="h-44 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dimensionChartData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis dataKey="dimension" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} width={90} />
                  <Tooltip
                    formatter={(val: any) => [`${val}/100`, 'Score']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '11px', border: 'none' }}
                  />
                  <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                    {dimensionChartData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.score >= 75 ? '#2563eb' : entry.score >= 50 ? '#6366f1' : '#94a3b8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Key Strengths & Growth Areas */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Key Insights</p>
              <div className="space-y-1.5">
                {readinessReport.keyStrengths.slice(0, 2).map((str, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>{str}</span>
                  </div>
                ))}
                {readinessReport.growthOpportunities.slice(0, 2).map((opp, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                    <span>{opp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => setActivePage('dashboard')}
            className="w-full py-2.5 px-4 text-xs font-bold text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Open Detailed Analytics Dashboard</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* ATS Resume Analysis Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                  <FileText className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">ATS Resume Scanner</h3>
                  <p className="text-xs text-slate-500">Keyword density, verbs & impact score</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-slate-900">{atsAnalysis.atsScore}</span>
                <span className="text-[10px] text-slate-400 block font-semibold">/100 ATS Score</span>
              </div>
            </div>

            {/* Metrics Chips */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                <span className="text-xs text-slate-500 block">Keywords</span>
                <span className="text-sm font-bold text-slate-900">{atsAnalysis.foundSkills.length}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                <span className="text-xs text-slate-500 block">Action Verbs</span>
                <span className="text-sm font-bold text-slate-900">{atsAnalysis.actionVerbsCount}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                <span className="text-xs text-slate-500 block">Metrics</span>
                <span className="text-sm font-bold text-slate-900">{atsAnalysis.metricsDetectedCount}</span>
              </div>
            </div>

            {/* Section Breakdown Progress */}
            <div className="space-y-2 pt-1">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Skills Match</span>
                  <span>{atsAnalysis.sectionScores.skillsMatch}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${atsAnalysis.sectionScores.skillsMatch}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Experience & Impact</span>
                  <span>{atsAnalysis.sectionScores.experienceImpact}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${atsAnalysis.sectionScores.experienceImpact}%` }}></div>
                </div>
              </div>
            </div>

            {/* Top Suggestions */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">ATS Suggestions</p>
              {atsAnalysis.suggestions.slice(0, 2).map((sug, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                  <Lightbulb className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" />
                  <span>{sug}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActivePage('profile')}
            className="w-full py-2.5 px-4 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            <span>Update Resume or Paste Full Text</span>
          </button>
        </div>

      </div>

      {/* 4. TARGET ROLE SKILL GAP BREAKDOWN */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-slate-900" />
              <h2 className="text-xl font-bold text-slate-900">
                Target Role Skill Gap: <span className="text-indigo-600">{student.preferred_role || 'Software Engineering'}</span>
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Deterministic comparison against recruitment benchmarks across top hiring partners.
            </p>
          </div>

          <button
            onClick={() => setActivePage('skill-gap')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
          >
            <span>View Full Roadmap</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Matched Skills */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Matching & Verified Skills ({skillGaps.filter(s => s.status === 'matching').length})
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {skillGaps.filter(s => s.status === 'matching').slice(0, 10).map((item, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200/70 inline-flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {item.skill}
                </span>
              ))}
              {skillGaps.filter(s => s.status === 'matching').length === 0 && (
                <p className="text-xs text-slate-400 italic">No exact skill matches recorded yet.</p>
              )}
            </div>
          </div>

          {/* High Priority Missing Skills */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-rose-600" />
                Priority Skills to Acquire ({skillGaps.filter(s => s.status === 'missing' && s.priority === 'High').length})
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {skillGaps.filter(s => s.status === 'missing' && s.priority === 'High').slice(0, 10).map((item, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-800 text-xs font-semibold border border-rose-200/70 inline-flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  {item.skill}
                </span>
              ))}
              {skillGaps.filter(s => s.status === 'missing' && s.priority === 'High').length === 0 && (
                <p className="text-xs text-emerald-600 font-medium">All high priority skills covered!</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 5. PERSONALISED NEXT STEPS & IMMEDIATE ACTION ITEMS */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-slate-900" />
            <h2 className="text-xl font-bold text-slate-900">Your Personalised Next Steps</h2>
          </div>
          <p className="text-xs text-slate-500">
            Action items calculated from your current placement readiness, missing credentials, and target role requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dynamicNextSteps.map((step, idx) => (
            <div
              key={step.id}
              className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                    step.impact === 'Essential'
                      ? 'bg-rose-100 text-rose-700'
                      : step.impact === 'High'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {step.impact}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 font-semibold">0{idx + 1}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 leading-snug">{step.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{step.description}</p>
              </div>

              <button
                onClick={() => setActivePage(step.actionPage)}
                className="w-full py-2 px-3 text-xs font-bold text-slate-800 bg-white hover:bg-slate-900 hover:text-white border border-slate-200 rounded-xl transition-all flex items-center justify-between cursor-pointer"
              >
                <span>{step.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 6. TOP PLACEMENT MATCHES PREVIEW */}
      {topMatches.length > 0 && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-slate-900" />
                <h2 className="text-xl font-bold text-slate-900">Your Top Campus Recommendations</h2>
              </div>
              <p className="text-xs text-slate-500">
                Live placement opportunities matched with deterministic cosine similarity and academic criteria.
              </p>
            </div>

            <button
              onClick={() => setActivePage('recommendations')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              <span>View All {recommendations.length} Matches</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topMatches.map((rec) => (
              <div
                key={rec.recommendation_id}
                onClick={() => {
                  if (onSelectJob) onSelectJob(rec);
                }}
                className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-lg transition-all cursor-pointer bg-white flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">{rec.job.company}</span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {Math.round(rec.final_match_score)}% Match
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{rec.job.job_title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2">{rec.job.description}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>Min CGPA: {rec.job.minimum_gpa}</span>
                    <span className="text-indigo-600 font-bold">{rec.job.job_type}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {rec.matching_skills.slice(0, 3).map((sk, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                        {sk}
                      </span>
                    ))}
                    {rec.matching_skills.length > 3 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-400">
                        +{rec.matching_skills.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. BOTTOM ACTION HUB: DIRECT NAVIGATION CTAS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 text-white shadow-xl">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-base font-bold text-white">Ready to proceed to your placement dashboard?</h3>
          <p className="text-xs text-slate-300">
            Monitor real-time application pipelines, run hiring simulators, and download verified certificates.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActivePage('dashboard')}
            className="px-5 py-2.5 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <span>Go to Student Dashboard</span>
          </button>
          <button
            onClick={() => setActivePage('recommendations')}
            className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Briefcase className="w-4 h-4" />
            <span>View All Opportunities</span>
          </button>
        </div>
      </div>

    </div>
  );
};
