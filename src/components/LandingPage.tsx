import React from 'react';
import { ActivePage, StudentProfileData, RecommendationResult } from '../types';
import { 
  Sparkles, 
  ArrowRight, 
  Cpu, 
  CheckCircle2, 
  Layers, 
  Target, 
  Building2, 
  ShieldCheck, 
  Zap, 
  GraduationCap, 
  UserPlus, 
  LogIn, 
  FileText, 
  TrendingUp, 
  Award, 
  Quote,
  ChevronRight,
  UserCheck
} from 'lucide-react';

interface LandingPageProps {
  setActivePage: (page: ActivePage) => void;
  onLoadDemoAndRun?: () => void;
  student: StudentProfileData | null;
  topRecommendation?: RecommendationResult;
  onGetStarted?: () => void;
  onOpenAuthModal?: (role?: 'student' | 'admin', mode?: 'login' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  setActivePage,
  student,
  topRecommendation,
  onGetStarted,
  onOpenAuthModal,
}) => {
  const handleGetStarted = () => {
    if (student) {
      setActivePage('onboarding');
    } else if (onOpenAuthModal) {
      onOpenAuthModal('student', 'register');
    } else if (onGetStarted) {
      onGetStarted();
    } else {
      setActivePage('profile');
    }
  };

  const handleLogin = () => {
    if (student) {
      setActivePage('dashboard');
    } else if (onOpenAuthModal) {
      onOpenAuthModal('student', 'login');
    } else {
      setActivePage('profile');
    }
  };

  return (
    <div className="space-y-16 pb-20">
      
      {/* 1. HERO SECTION: WHITE & NAVY THEME WITH ELEGANT GRADIENTS */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 border border-slate-200/80 bg-white rounded-3xl shadow-sm">
        {/* Subtle Decorative Background Gradients */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-gradient-to-br from-indigo-500/10 via-blue-500/5 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-gradient-to-tr from-slate-900/5 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Top Career Quotation Card */}
            <div className="relative max-w-2xl mx-auto p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-50 via-white to-indigo-50/50 border border-slate-200/90 shadow-2xs text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider">
                <Quote className="w-3.5 h-3.5 rotate-180" />
                <span>Pathway to Placement Excellence</span>
                <Quote className="w-3.5 h-3.5" />
              </div>
              <blockquote className="text-sm sm:text-base font-semibold text-slate-800 italic leading-snug">
                "Your future is created by what you do today, not tomorrow. Discover your true strengths, bridge your skill gaps, and step into the right opportunity."
              </blockquote>
              <p className="text-[11px] font-medium text-slate-500">
                — Empowering Every Student's Career Journey
              </p>
            </div>

            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Next-Gen Placement Intelligence & Personalised Onboarding</span>
            </div>

            {/* Platform Title & Slogan */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight">
                PLACERA
              </h1>
              <p className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-slate-900 tracking-tight">
                Find Where You Fit.
              </p>
            </div>

            {/* Platform Description */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto">
              <strong>PLACERA</strong> is an intelligent placement matching engine that evaluates students 
              beyond basic CGPA cutoffs. Experience our 3-step onboarding: basic registration, academic & skill profiling with searchable tags, and personalised placement readiness tracking.
            </p>

            {/* Main Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <button
                onClick={handleGetStarted}
                id="hero-get-started-btn"
                className="w-full sm:w-auto px-7 py-3.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-95 group"
              >
                {student ? (
                  <>
                    <Sparkles className="w-4 h-4 text-indigo-400 group-hover:text-white transition-colors" />
                    <span>View My Onboarding Roadmap ({student.name.split(' ')[0]})</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 text-indigo-400 group-hover:text-white transition-colors" />
                    <span>Get Started • 3-Step Registration</span>
                  </>
                )}
                <ArrowRight className="w-4 h-4 text-indigo-300 group-hover:translate-x-1 transition-transform" />
              </button>

              {!student && (
                <button
                  onClick={handleLogin}
                  className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
                >
                  <LogIn className="w-4 h-4 text-slate-500" />
                  <span>Sign In to Existing Account</span>
                </button>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-slate-500 text-xs font-medium border-t border-slate-100 max-w-xl mx-auto">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Deterministic Cosine Match</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Client-Side ATS Scanner</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>25+ Campus Opportunities</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. THREE-STEP REGISTRATION & ONBOARDING JOURNEY HIGHLIGHT */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            Intuitive Candidate Experience
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How Placera Elevates Your Placement Preparation
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Streamlined into three intuitive phases designed to guide students from account creation to job offer readiness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Basic Registration */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs hover:border-indigo-400 hover:shadow-lg transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-md">
                01
              </div>
              <h3 className="text-lg font-bold text-slate-900">Basic Registration</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Simple, focused sign-up with candidate name, institutional email, phone verification, and cryptographic password hashing with live strength feedback.
              </p>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Inline validation & password meter</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Browser draft autosave</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Quick-register or full profile option</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Profile Creation */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs hover:border-indigo-400 hover:shadow-lg transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md">
                02
              </div>
              <h3 className="text-lg font-bold text-slate-900">Profile Creation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter degree, branch, CGPA, searchable skill tags, target career role, projects, and resume text with a convenient skip-for-now option.
              </p>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>Searchable skill tag selector (40+ skills)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>Target career roles & location preferences</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>Graceful handling of incomplete profiles</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Personalised Onboarding */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs hover:border-indigo-400 hover:shadow-lg transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center font-black text-sm shadow-md">
                03
              </div>
              <h3 className="text-lg font-bold text-slate-900">Personalised Onboarding</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Instant diagnostic dashboard displaying profile health %, Placement Readiness Index (PRI), real ATS resume score, role skill gaps, and next steps.
              </p>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>5-dimensional readiness score (0-100)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Client-side ATS keyword scanner</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Ranked campus opportunity matches</span>
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* 3. PLATFORM CORE PILLARS */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl space-y-8">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Deterministic & Explainable AI</span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Transparent Algorithms, Zero Black Boxes
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Placera uses verifiable mathematical models so students and placement officers know exactly why a recommendation is made.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <Cpu className="w-6 h-6 text-indigo-400" />
            <h4 className="text-sm font-bold text-white">TF-IDF Vector Space</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cosine similarity over candidate skills, project text, and recruiter job specifications.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h4 className="text-sm font-bold text-white">Strict Eligibility Filter</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hard checks for minimum CGPA, eligible branch codes, and maximum standing backlog limits.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <FileText className="w-6 h-6 text-blue-400" />
            <h4 className="text-sm font-bold text-white">Client-Side ATS Engine</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time resume scoring with action verbs, quantifiable metrics, and keyword density.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <TrendingUp className="w-6 h-6 text-amber-400" />
            <h4 className="text-sm font-bold text-white">Placement Readiness</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Multidimensional PRI index evaluating academics, coding aptitude, and portfolio maturity.
            </p>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
          <p className="text-xs text-slate-400">
            Ready to explore verified campus opportunities?
          </p>
          <button
            onClick={() => setActivePage('jobs')}
            className="px-5 py-2.5 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-xl transition-all cursor-pointer shadow-md"
          >
            Browse Campus Opportunities →
          </button>
        </div>
      </section>

    </div>
  );
};
