import React, { useMemo, useState } from 'react';
import { StudentProfileData, RecommendationResult, ActivePage } from '../types';
import { 
  UserCheck, 
  Briefcase, 
  TrendingUp, 
  Target, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Building2, 
  Calendar,
  AlertCircle,
  ArrowLeft,
  UserPlus,
  LogIn
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  Cell 
} from 'recharts';
import { calculatePlacementReadiness, simulateImproveMyMatch } from '../services/readinessService';
import { getTargetRoleInfo } from '../data/targetRoles';
import { ResumeAnalyzer } from './ResumeAnalyzer';

interface StudentDashboardProps {
  student: StudentProfileData | null;
  recommendations: RecommendationResult[];
  setActivePage: (page: ActivePage) => void;
  onSelectJob: (rec: RecommendationResult) => void;
  onOpenAuthModal?: (mode?: 'login' | 'register') => void;
  onBack?: () => void;
  onUpdateStudent?: (student: StudentProfileData) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  recommendations,
  setActivePage,
  onSelectJob,
  onOpenAuthModal,
  onBack,
  onUpdateStudent,
}) => {
  const [simulatedSkills, setSimulatedSkills] = useState<string[]>([]);
  const [extraDsa, setExtraDsa] = useState(0);
  // Compute Profile Completeness
  const profileCompleteness = useMemo(() => {
    if (!student) return 0;
    let score = 30; // base for name, branch, graduation year
    if (student.GPA > 0) score += 15;
    if (student.skills.length >= 5) score += 20;
    else score += student.skills.length * 4;
    if (student.projects.length >= 2) score += 15;
    else if (student.projects.length === 1) score += 8;
    if (student.certifications.length >= 1) score += 10;
    if (student.experience && student.experience.trim().length > 10) score += 10;
    return Math.min(100, score);
  }, [student]);

  if (!student) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 pb-16">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack || (() => window.history.back())}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-600" />
            <span>Back</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
            <TrendingUp className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Placement Analytics & Insights Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Create your profile or sign in to unlock comprehensive placement readiness analytics, TF-IDF skill match breakdowns, and real-time eligibility charts.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onOpenAuthModal ? onOpenAuthModal('register') : null}
              className="w-full sm:w-auto px-6 py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create My Profile (Register)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onOpenAuthModal ? onOpenAuthModal('login') : null}
              className="w-full sm:w-auto px-6 py-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const topRec = recommendations[0];
  const readiness = useMemo(() => calculatePlacementReadiness(student, recommendations.map(r => r.job)), [student, recommendations]);
  const roleSkillSuggestions = useMemo(
    () => getTargetRoleInfo(student.preferred_role)?.coreSkills.filter(skill => !student.skills.includes(skill)).slice(0, 6) || [],
    [student.preferred_role, student.skills]
  );
  const simulation = useMemo(() => simulateImproveMyMatch(student, recommendations.map(r => r.job), {
    skillsToAdd: simulatedSkills,
    extraLeetCodeCount: extraDsa,
    certificationsToAdd: []
  }), [student, recommendations, simulatedSkills, extraDsa]);
  const avgMatchScore = recommendations.length > 0
    ? Math.round(recommendations.reduce((acc, r) => acc + r.final_match_score, 0) / recommendations.length)
    : 0;

  // Chart 1: Top Recommended Roles (Top 5)
  const topRolesData = useMemo(() => {
    return recommendations.slice(0, 5).map(r => ({
      role: r.job.job_title.length > 20 ? r.job.job_title.substring(0, 18) + '...' : r.job.job_title,
      company: r.job.company,
      score: r.final_match_score
    }));
  }, [recommendations]);

  // Chart 2: Match Score Distribution (Binned: 50-60, 60-70, 70-80, 80-90, 90-100)
  const scoreDistributionData = useMemo(() => {
    const bins = [
      { range: '50-60%', count: 0 },
      { range: '60-70%', count: 0 },
      { range: '70-80%', count: 0 },
      { range: '80-90%', count: 0 },
      { range: '90-100%', count: 0 },
    ];
    recommendations.forEach(r => {
      const s = r.final_match_score;
      if (s >= 90) bins[4].count++;
      else if (s >= 80) bins[3].count++;
      else if (s >= 70) bins[2].count++;
      else if (s >= 60) bins[1].count++;
      else bins[0].count++;
    });
    return bins;
  }, [recommendations]);

  // Chart 3: Skills Possessed vs Required (Top recurring campus skills)
  const skillComparisonData = useMemo(() => {
    const studentSkillsLower = new Set(student.skills.map(s => s.toLowerCase()));
    const keyCampusSkills = ['Python', 'SQL', 'C++', 'Machine Learning', 'React.js', 'System Design', 'Docker', 'Computer Networks'];
    
    return keyCampusSkills.map(skill => {
      const possessed = studentSkillsLower.has(skill.toLowerCase()) ? 100 : 0;
      // Recruiter demand level benchmark
      const required = ['Python', 'SQL', 'C++', 'Machine Learning'].includes(skill) ? 90 : 70;
      return {
        skill,
        possessed,
        required
      };
    });
  }, [student]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Top Page Navigation Bar with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack || (() => setActivePage('landing'))}
          id="student-dashboard-back-btn"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-all hover:border-slate-300 cursor-pointer active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-indigo-600" />
          <span>Back to Previous Page</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Student Portal</span>
          <span>/</span>
          <span className="font-semibold text-slate-900">Personal Placement Dashboard</span>
        </div>
      </div>

      {/* Top Banner with Student Welcome */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center font-black text-xl shadow-sm shadow-indigo-200">
            {student.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{student.name}</h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                {student.branch} • Batch of {student.graduationYear}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Target Role: <span className="font-semibold text-slate-700">{student.preferred_role}</span> • Cumulative CGPA: <span className="font-bold text-indigo-600">{student.GPA} / 10.0</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActivePage('profile')}
            id="dashboard-edit-profile-btn"
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Update Profile
          </button>
          <button
            onClick={() => setActivePage('pipeline')}
            id="dashboard-run-pipeline-btn"
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs shadow-indigo-200 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Re-run AI Match</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Profile Completeness */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Profile Completeness</span>
            <UserCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">{profileCompleteness}%</span>
            <span className="text-[11px] font-bold text-emerald-600">Model Ready</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${profileCompleteness}%` }} />
          </div>
        </div>

        {/* Recommended Jobs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Recommended Jobs</span>
            <Briefcase className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">{recommendations.length}</span>
            <span className="text-[11px] font-bold text-blue-600">Explainable scoring</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Filtered from 320 campus openings</p>
        </div>

        {/* Top Matching Role */}
        <div className="bg-white rounded-2xl border border-indigo-100 p-5 shadow-xs bg-gradient-to-br from-white to-indigo-50/50">
          <div className="flex items-center justify-between text-xs font-semibold text-indigo-700 uppercase">
            <span>Top Match Role</span>
            <Sparkles className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2">
            <span className="text-base font-bold text-slate-900 line-clamp-1">
              {topRec ? topRec.job.job_title : 'Pending Inference'}
            </span>
            <p className="text-[11px] text-indigo-600 font-semibold mt-0.5">
              {topRec ? `${topRec.job.company} (${topRec.final_match_score}% Match)` : 'Run Model to View'}
            </p>
          </div>
        </div>

        {/* Average Match Score */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Average Match Score</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">{avgMatchScore}%</span>
            <span className="text-[11px] font-bold text-emerald-600">Strong Baseline</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Cosine + criteria + skill coverage</p>
        </div>
      </div>

      {/* Placement Readiness Index and Improve My Match */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-slate-950 text-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-blue-300 font-bold">Placement Readiness Index</p>
              <h2 className="text-4xl font-black mt-2">{readiness.overallReadinessScore}<span className="text-lg text-slate-400">/100</span></h2>
            </div>
            <Target className="w-8 h-8 text-blue-400" />
          </div>
          <p className="text-sm font-bold text-blue-200 mt-3">{readiness.tierTitle}</p>
          <div className="grid grid-cols-2 gap-2 mt-5 text-xs">
            {Object.entries(readiness.dimensionScores).map(([name, score]) => (
              <div key={name} className="rounded-lg bg-white/10 p-2">
                <span className="block text-slate-400 capitalize">{name.replace(/([A-Z])/g, ' $1')}</span>
                <span className="font-bold">{score}%</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 mt-4">{readiness.eligibleJobsCount} of {readiness.totalJobsCount} opportunities pass every configured eligibility rule.</p>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-indigo-600 font-bold">Improve My Match</p>
              <h2 className="text-lg font-black text-slate-900 mt-1">Simulate your next preparation step</h2>
              <p className="text-xs text-slate-500 mt-1">This preview changes only the estimate; your saved profile is not modified.</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-indigo-600">{simulation.simulatedAverageMatch}%</span>
              <span className="text-xs text-slate-500 block">after ({simulation.averageDelta >= 0 ? '+' : ''}{simulation.averageDelta})</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {roleSkillSuggestions.map(skill => (
              <button
                key={skill}
                type="button"
                onClick={() => setSimulatedSkills(current => current.includes(skill) ? current.filter(item => item !== skill) : [...current, skill])}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold ${simulatedSkills.includes(skill) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
              >
                {simulatedSkills.includes(skill) ? '✓ ' : '+ '}{skill}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-3 text-xs font-semibold text-slate-700 mt-4">
            <span>Extra DSA practice</span>
            <input type="range" min="0" max="200" step="25" value={extraDsa} onChange={event => setExtraDsa(Number(event.target.value))} className="flex-1 accent-indigo-600" />
            <span className="w-10 text-right text-indigo-700">+{extraDsa}</span>
          </label>
          <div className="flex flex-wrap gap-4 mt-4 text-xs text-slate-600">
            <span>Before: <strong className="text-slate-900">{simulation.originalAverageMatch}%</strong></span>
            <span>Eligible opportunities after: <strong className="text-emerald-700">{simulation.newlyEligibleJobCount + readiness.eligibleJobsCount}</strong></span>
            <span>Selected skills: <strong className="text-slate-900">{simulatedSkills.length}</strong></span>
          </div>
        </div>
      </div>

      <ResumeAnalyzer
        student={student}
        onScoreSaved={score => onUpdateStudent?.({ ...student, atsResumeScore: score })}
        onResumeAnalyzed={(analysis, resumeText, fileName, pdfUrl, fileSize) => onUpdateStudent?.({
          ...student,
          atsResumeScore: analysis.atsScore,
          resumeText,
          resumeFileName: fileName,
          resumePdfUrl: pdfUrl || student.resumePdfUrl,
          resumeFileSize: fileSize || student.resumeFileSize,
          skills: Array.from(new Set([...student.skills, ...analysis.foundSkills])),
        })}
      />

      {/* Charts Grid: Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Top Recommended Roles */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Top Recommended Roles & Fit Scores</h3>
              <p className="text-xs text-slate-500">Top-5 campus roles matching profile</p>
            </div>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              Fit %
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topRolesData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="company" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  formatter={(val: any) => [`${val}% Fit`, 'Match Score']}
                />
                <Bar dataKey="score" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                  {topRolesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Recommendation Score Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recommendation Score Distribution</h3>
              <p className="text-xs text-slate-500">Frequency of placement fit percentages</p>
            </div>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              Score bands
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scoreDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  formatter={(val: any) => [`${val} Jobs`, 'Job Count']}
                />
                <Area type="monotone" dataKey="count" stroke="#6366f1" fill="#e0e7ff" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Skills Possessed vs Required */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Skills Possessed vs Recruiter Benchmark</h3>
              <p className="text-xs text-slate-500">Comparing your skill profile against top recruiter requirements</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-indigo-600" />
                <span>Possessed</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-slate-300" />
                <span>Recruiter Demand</span>
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="skill" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="possessed" name="You Have" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="required" name="Recruiter Demand" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Recommendations List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Ranked Recommendations</h3>
            <p className="text-xs text-slate-500">Top opportunities ready for campus application</p>
          </div>
          <button
            onClick={() => setActivePage('recommendations')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View All {recommendations.length} Jobs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setActivePage('jobs')}
            className="text-xs font-bold text-slate-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Browse All Opportunities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {recommendations.slice(0, 4).map((rec) => (
            <div key={rec.recommendation_id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{rec.job.job_title}</span>
                  <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    {rec.job.company}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>{rec.job.location}</span>
                  <span>•</span>
                  <span>Min GPA: {rec.job.minimum_gpa}</span>
                  <span>•</span>
                  <span>Matching: {rec.matching_skills.slice(0, 3).join(', ')}</span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4">
                <div className="text-right">
                  <span className="text-2xl font-black text-indigo-600">{rec.final_match_score}%</span>
                  <span className="text-[10px] text-slate-400 block">Match Score</span>
                </div>
                <button
                  onClick={() => onSelectJob(rec)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 bg-white hover:bg-indigo-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
