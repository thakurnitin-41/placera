import React from 'react';
import { ActivePage, StudentProfileData, RecommendationResult } from '../types';
import { 
  Sparkles, 
  ArrowRight, 
  Cpu, 
  BarChart3, 
  CheckCircle2, 
  Layers, 
  Target, 
  BookOpen, 
  UserCheck, 
  Building2, 
  ArrowUpRight,
  ShieldCheck,
  Zap,
  GraduationCap,
  UserPlus,
  LogIn,
  Binary,
  FileCheck,
  Compass,
  Award,
  ChevronRight
} from 'lucide-react';

interface LandingPageProps {
  setActivePage: (page: ActivePage) => void;
  onLoadDemoAndRun: () => void;
  student: StudentProfileData | null;
  topRecommendation?: RecommendationResult;
  onGetStarted?: () => void;
  onOpenAuthModal?: (mode?: 'login' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  setActivePage,
  onLoadDemoAndRun,
  student,
  topRecommendation,
  onGetStarted,
  onOpenAuthModal,
}) => {
  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    } else if (onOpenAuthModal) {
      onOpenAuthModal('register');
    } else {
      setActivePage('profile');
    }
  };

  const handleLogin = () => {
    if (onOpenAuthModal) {
      onOpenAuthModal('login');
    } else if (onGetStarted) {
      onGetStarted();
    } else {
      setActivePage('profile');
    }
  };

  return (
    <div className="space-y-16 pb-20">
      
      {/* HERO SECTION: PLATFORM INTRODUCTION & GET STARTED */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-12 lg:pb-20 border-b border-slate-200 bg-white rounded-3xl shadow-xs">
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-70 pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
              <span>AI-Powered Campus Placement & Career Recommendation System</span>
            </div>

            {/* Platform Title & Slogan */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight">
                PLACERA
              </h1>
              <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600 tracking-tight">
                Find Where You Fit.
              </p>
            </div>

            {/* About the Platform Description (Is platform ke baare me) */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto">
              <strong>PLACERA</strong> is an intelligent placement matching engine that evaluates engineering students 
              beyond basic CGPA cutoffs. By analyzing verified programming competencies, academic metrics, 
              and achievements against <strong>synthetic campus opportunity profiles</strong>, PLACERA estimates your top-fit job roles
              and generates personalized interview roadmaps.
            </p>

            {/* Main Action Buttons with Prominent GET STARTED */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              {/* PRIMARY GET STARTED BUTTON */}
              <button
                onClick={handleGetStarted}
                id="hero-get-started-btn"
                className="w-full sm:w-auto px-7 py-3.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-95 group"
              >
                {student ? (
                  <>
                    <UserCheck className="w-4 h-4 text-indigo-200 group-hover:text-white transition-colors" />
                    <span>Go to My Dashboard ({student.name.split(' ')[0]})</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 text-indigo-200 group-hover:text-white transition-colors" />
                    <span>Get Started (Register / Sign In)</span>
                  </>
                )}
                <ArrowRight className="w-4 h-4 text-indigo-200 group-hover:translate-x-0.5 transition-transform" />
              </button>

            </div>

            {/* Trust Indicators */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-slate-500 text-xs font-medium border-t border-slate-100 max-w-xl mx-auto">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Local profile benchmark</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>25+ synthetic roles</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Transparent AI Match Scores</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: ABOUT THE PLATFORM (IS PLATFORM KE BAARE ME) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            <span>About The Platform</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Why PLACERA Replaces Legacy Placement Systems
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Traditional campus placement portals filter students using crude, one-dimensional GPA cutoffs, ignoring genuine coding skills and project contributions. PLACERA brings fair, multi-dimensional Machine Learning to campus recruitment.
          </p>
        </div>

        {/* 3 Core Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-indigo-300 transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Holistic Candidate Evaluation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We look beyond just marks. PLACERA analyzes student programming languages, tech frameworks, certified projects, and hackathon achievements so skilled engineers never get left behind.
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-indigo-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Full Profile Scoring</span>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-indigo-300 transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Explainable AI & Fair Shortlisting</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              No black-box rejections. Students and placement coordinators get a complete breakdown showing TF-IDF similarity, deterministic profile fit, eligibility, and exact matching skills.
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-purple-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>100% Transparent Rationale</span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-indigo-300 transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Skill-Gap Roadmap & Preparation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Discovers missing competencies for dream companies like Google or Amazon, providing customized 3-step learning roadmaps before the recruiter sets foot on campus.
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Targeted Upskilling Guides</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: RECRUITER SPECTRUM & CAMPUS OPPORTUNITIES */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Campus Placement Recruiters Covered
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Real job descriptions from Tier-1 Dream employers, product giants, and high-growth tech firms
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-xs">
            <span className="text-xs font-bold text-purple-700 uppercase block mb-1">Tier 1 Dream</span>
            <p className="text-sm font-extrabold text-slate-800">Google • Microsoft</p>
            <span className="text-[11px] text-slate-500">₹25 - 45+ LPA</span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-xs">
            <span className="text-xs font-bold text-blue-700 uppercase block mb-1">Core Tech Giants</span>
            <p className="text-sm font-extrabold text-slate-800">Amazon • Cisco • Oracle</p>
            <span className="text-[11px] text-slate-500">₹18 - 32 LPA</span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-xs">
            <span className="text-xs font-bold text-emerald-700 uppercase block mb-1">Fintech & Quant</span>
            <p className="text-sm font-extrabold text-slate-800">Goldman Sachs • Morgan</p>
            <span className="text-[11px] text-slate-500">₹22 - 38 LPA</span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-xs">
            <span className="text-xs font-bold text-indigo-700 uppercase block mb-1">Product Innovators</span>
            <p className="text-sm font-extrabold text-slate-800">Uber • Atlassian • Adobe</p>
            <span className="text-[11px] text-slate-500">₹20 - 40 LPA</span>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA: GET STARTED BANNER */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 text-xs text-indigo-300 font-mono bg-indigo-900/60 px-3 py-1 rounded-full border border-indigo-700/60">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Ready to Launch Your Campus Placement Journey?</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Create Your Profile or Sign In to Explore Top Matches
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Join hundreds of engineering students finding their ideal placement fit with transparent AI match scoring, webcam-verified identity, and custom preparation roadmaps.
              </p>
            </div>

            {student ? (
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setActivePage('dashboard')}
                  id="bottom-dashboard-btn"
                  className="w-full sm:w-auto px-7 py-3.5 text-sm font-bold bg-white text-indigo-950 hover:bg-slate-100 rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 group"
                >
                  <UserCheck className="w-4 h-4 text-indigo-600" />
                  <span>Open Placement Dashboard</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  onClick={() => setActivePage('profile')}
                  id="bottom-profile-btn"
                  className="w-full sm:w-auto px-5 py-3.5 text-sm font-semibold bg-indigo-800/80 hover:bg-indigo-700 text-white rounded-xl border border-indigo-600/60 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                >
                  <span>View Academic Profile</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleGetStarted}
                  id="bottom-get-started-btn"
                  className="w-full sm:w-auto px-7 py-3.5 text-sm font-bold bg-white text-indigo-950 hover:bg-slate-100 rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 group"
                >
                  <UserPlus className="w-4 h-4 text-indigo-600" />
                  <span>Get Started (Register / Sign In)</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={handleLogin}
                  id="bottom-login-btn"
                  className="w-full sm:w-auto px-5 py-3.5 text-sm font-semibold bg-indigo-800/80 hover:bg-indigo-700 text-white rounded-xl border border-indigo-600/60 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                >
                  <LogIn className="w-4 h-4 text-indigo-300" />
                  <span>Sign In / Register</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
};
